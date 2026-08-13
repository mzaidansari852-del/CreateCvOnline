import 'server-only';

import { NextResponse, type NextRequest } from 'next/server';
import { ZodError, type ZodType } from 'zod';

import { clientKey, consume } from './rate-limit';
import { SESSION_COOKIE, verifySessionCookieValue } from '@/lib/auth/session';
import { ensureUserProfile, getUserProfile } from '@/lib/db/users';
import { EntitlementError } from '@/lib/entitlements';
import { CVNotFoundError } from '@/lib/db/cvs';
import { MissingEnvError } from '@/lib/env';
import { PaymentsUnavailableError } from '@/lib/payments';
import { effectivePlan, type Plan } from '@/lib/plans';
import type { SessionUser, UserProfile } from '@/types/user';

/**
 * Route-handler plumbing.
 *
 * Wraps every API route with the same four things so no individual route can forget one:
 * rate limiting, authentication, request-body validation, and error → status mapping
 * that never leaks an internal message to the client.
 */

export interface ApiError {
  error: { code: string; message: string; details?: unknown };
}

export function apiError(
  status: number,
  code: string,
  message: string,
  details?: unknown,
): NextResponse<ApiError> {
  return NextResponse.json({ error: { code, message, details } }, { status });
}

export interface AuthedContext<P = Record<string, string>> {
  request: NextRequest;
  user: SessionUser;
  profile: UserProfile;
  plan: Plan;
  /** Resolved dynamic route segments. Empty for static routes. */
  params: P;
}

export interface PublicContext<P = Record<string, string>> {
  request: NextRequest;
  params: P;
}

/** Next.js 16 passes dynamic segments as a Promise. */
interface RouteContext<P> {
  params: Promise<P>;
}

async function resolveParams<P>(context: RouteContext<P> | undefined): Promise<P> {
  const value = await context?.params;
  return (value ?? ({} as P)) as P;
}

interface HandlerOptions {
  /** Requests per window for this route. Defaults to the global setting. */
  rateLimit?: { max: number; windowSeconds: number };
  /** Bucket name, so a burst on one route does not throttle another. */
  scope: string;
  /** Reject signed-in users whose e-mail address is unverified. */
  requireVerifiedEmail?: boolean;
  /** Reject non-administrators. */
  requireAdmin?: boolean;
}

/** Maps a thrown error to a safe HTTP response. Unknown errors become an opaque 500. */
export function toErrorResponse(error: unknown): NextResponse<ApiError> {
  if (error instanceof ZodError) {
    return apiError(422, 'invalid-request', 'Some of the submitted values are not valid.', {
      issues: error.issues.map((issue) => ({
        path: issue.path.join('.'),
        message: issue.message,
      })),
    });
  }
  if (error instanceof EntitlementError) {
    return apiError(error.status, error.code, error.message, { upgradeUrl: error.upgradeUrl });
  }
  if (error instanceof CVNotFoundError) {
    return apiError(404, 'not-found', error.message);
  }
  if (error instanceof PaymentsUnavailableError) {
    return apiError(503, 'payments-unavailable', error.message);
  }
  if (error instanceof MissingEnvError) {
    // Configuration problems are the operator's to fix; the client gets a generic message
    // while the full detail goes to the server log.
    console.error('[api] configuration error:', error.message);
    return apiError(503, 'not-configured', 'This feature is not available right now.');
  }
  if (
    error &&
    typeof error === 'object' &&
    'status' in error &&
    typeof (error as { status: unknown }).status === 'number' &&
    'message' in error
  ) {
    const status = (error as { status: number }).status;
    const message = String((error as { message: unknown }).message);
    if (status >= 400 && status < 500) return apiError(status, 'request-failed', message);
  }

  console.error('[api] unhandled error:', error);
  return apiError(500, 'server-error', 'Something went wrong on our side. Please try again.');
}

function rateLimitResponse(scope: string, request: NextRequest, options: HandlerOptions) {
  const result = consume(clientKey(request.headers, scope), options.rateLimit);
  if (result.allowed) return null;
  return NextResponse.json(
    {
      error: {
        code: 'rate-limited',
        message: `Too many requests. Try again in ${result.retryAfterSeconds} second${result.retryAfterSeconds === 1 ? '' : 's'}.`,
      },
    },
    {
      status: 429,
      headers: {
        'Retry-After': String(result.retryAfterSeconds),
        'X-RateLimit-Limit': String(result.limit),
        'X-RateLimit-Remaining': '0',
      },
    },
  );
}

/** A route that does not require a signed-in user. */
export function publicRoute<P = Record<string, string>>(
  options: HandlerOptions,
  handler: (context: PublicContext<P>) => Promise<NextResponse>,
) {
  return async (request: NextRequest, context?: RouteContext<P>): Promise<NextResponse> => {
    const limited = rateLimitResponse(options.scope, request, options);
    if (limited) return limited;

    try {
      return await handler({ request, params: await resolveParams(context) });
    } catch (error) {
      return toErrorResponse(error);
    }
  };
}

/** A route that requires a valid session cookie. */
export function authedRoute<P = Record<string, string>>(
  options: HandlerOptions,
  handler: (context: AuthedContext<P>) => Promise<NextResponse>,
) {
  return async (request: NextRequest, context?: RouteContext<P>): Promise<NextResponse> => {
    const limited = rateLimitResponse(options.scope, request, options);
    if (limited) return limited;

    try {
      const user = await verifySessionCookieValue(request.cookies.get(SESSION_COOKIE)?.value);
      if (!user) {
        return apiError(401, 'unauthenticated', 'Please sign in and try again.');
      }
      if (options.requireAdmin && user.role !== 'admin') {
        return apiError(403, 'forbidden', 'Administrator access is required.');
      }
      if (options.requireVerifiedEmail && !user.emailVerified) {
        return apiError(
          403,
          'email-unverified',
          'Verify your e-mail address before using this feature.',
        );
      }

      const profile = (await getUserProfile(user.uid)) ?? (await ensureUserProfile(user));
      return await handler({
        request,
        user,
        profile,
        plan: effectivePlan(profile.entitlement),
        params: await resolveParams(context),
      });
    } catch (error) {
      return toErrorResponse(error);
    }
  };
}

/** Parses and validates a JSON body, throwing `ZodError` on mismatch. */
export async function readJson<T>(request: NextRequest, schema: ZodType<T>): Promise<T> {
  let payload: unknown;
  try {
    payload = await request.json();
  } catch {
    throw new ZodError([
      {
        code: 'custom',
        path: [],
        message: 'Request body must be valid JSON.',
        input: undefined,
      },
    ]);
  }
  return schema.parse(payload);
}
