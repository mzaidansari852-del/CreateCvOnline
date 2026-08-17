'use client';

import { useCallback } from 'react';
import { useRouter } from 'next/navigation';

import { useCopy } from '@/components/i18n/LocaleProvider';
import { useToast } from '@/components/ui/toast';
import { trackEvent } from '@/lib/analytics/events';
import type { AppCopy } from '@/lib/i18n/app-copy';

/**
 * The dashboard's single door to the REST API.
 *
 * Every write in the dashboard goes through here so that the three things that matter
 * are handled once rather than at twenty call sites: the `{ error: { code, message } }`
 * envelope is unwrapped, a `402` keeps hold of its `upgradeUrl`, and a network failure
 * becomes a sentence a person can act on instead of a raw `TypeError`.
 */

export class ApiRequestError extends Error {
  readonly status: number;
  readonly code: string;
  /** Where to send the user to lift the limit. Only set for `402` responses. */
  readonly upgradeUrl: string | null;
  /**
   * The sentence the server itself sent, or `null` when the message was synthesised here.
   *
   * `message` cannot answer that question. It is the error's identity — callers match on
   * it, it is what a thrown error logs — so it is left exactly as the API worded it, in
   * the API's own language. Whether there was anything to show a person is a separate
   * fact, and the display path in `useApiErrorToast` needs it to decide between the
   * server's sentence and a translated one.
   */
  readonly serverMessage: string | null;
  /**
   * Which fields the server rejected, for a `422`.
   *
   * The API has always sent these — `toErrorResponse` maps every `ZodError` issue to a
   * `path` and a `message` — and this class used to drop them on the floor. The cost was
   * concrete: a user filled in an entire CV, every save was refused with "Some of the
   * submitted values are not valid", and the one thing that would have ended it in seconds
   * (`data.experience.0.startDate — Use YYYY, YYYY-MM or YYYY-MM-DD`) was in the response
   * body the whole time, thrown away one layer below the screen that needed it.
   */
  readonly issues: readonly { path: string; message: string }[];

  constructor(
    status: number,
    code: string,
    message: string,
    upgradeUrl: string | null = null,
    serverMessage: string | null = null,
    issues: readonly { path: string; message: string }[] = [],
  ) {
    super(message);
    this.name = 'ApiRequestError';
    this.status = status;
    this.code = code;
    this.upgradeUrl = upgradeUrl;
    this.serverMessage = serverMessage;
    this.issues = issues;
  }

  /** True when the request was refused because of the user's plan. */
  get isEntitlement(): boolean {
    return this.status === 402;
  }
}

interface ErrorEnvelope {
  error?: { code?: unknown; message?: unknown; details?: unknown };
}

/** The `issues` array a `422` carries, shape-checked. Anything unexpected reads as none. */
function issuesFrom(details: unknown): { path: string; message: string }[] {
  if (!details || typeof details !== 'object' || !('issues' in details)) return [];
  const raw = (details as { issues: unknown }).issues;
  if (!Array.isArray(raw)) return [];
  return raw.flatMap((entry) =>
    entry &&
    typeof entry === 'object' &&
    typeof (entry as { path?: unknown }).path === 'string' &&
    typeof (entry as { message?: unknown }).message === 'string'
      ? [
          {
            path: (entry as { path: string }).path,
            message: (entry as { message: string }).message,
          },
        ]
      : [],
  );
}

function upgradeUrlFrom(details: unknown): string | null {
  if (details && typeof details === 'object' && 'upgradeUrl' in details) {
    const value = (details as { upgradeUrl: unknown }).upgradeUrl;
    if (typeof value === 'string' && value.length > 0) return value;
  }
  return null;
}

/** Reads the standard error envelope off a failed response. Never throws. */
export async function readApiError(response: Response): Promise<ApiRequestError> {
  const body = (await response.json().catch(() => null)) as ErrorEnvelope | null;
  const code = typeof body?.error?.code === 'string' ? body.error.code : 'request-failed';
  const sent =
    typeof body?.error?.message === 'string' && body.error.message.length > 0
      ? body.error.message
      : null;

  return new ApiRequestError(
    response.status,
    code,
    sent ?? `The server refused that request (${response.status}).`,
    upgradeUrlFrom(body?.error?.details),
    sent,
    issuesFrom(body?.error?.details),
  );
}

export async function apiRequest<T>(url: string, init: RequestInit = {}): Promise<T> {
  let response: Response;
  try {
    response = await fetch(url, {
      credentials: 'same-origin',
      ...init,
      headers: {
        ...(init.body ? { 'Content-Type': 'application/json' } : {}),
        ...init.headers,
      },
    });
  } catch {
    throw new ApiRequestError(
      0,
      'network',
      'Network problem — check your connection and try again.',
    );
  }

  if (!response.ok) throw await readApiError(response);
  return (await response.json()) as T;
}

/**
 * Downloads a CV as a PDF.
 *
 * The endpoint answers with either a file or a JSON error, so the content type decides
 * how the response is read. The blob is handed to a temporary anchor because that is the
 * only way to keep the server's `Content-Disposition` filename.
 */
export async function downloadCVPdf(cvId: string, fallbackName: string): Promise<void> {
  let response: Response;
  try {
    response = await fetch(`/api/cvs/${cvId}/pdf`, { credentials: 'same-origin' });
  } catch {
    throw new ApiRequestError(
      0,
      'network',
      'Network problem — check your connection and try again.',
    );
  }

  if (!response.ok) throw await readApiError(response);

  const disposition = response.headers.get('Content-Disposition') ?? '';
  const match = /filename="([^"]+)"/.exec(disposition);
  const filename = match?.[1] ?? `${fallbackName || 'cv'}.pdf`;

  const blob = await response.blob();
  const objectUrl = URL.createObjectURL(blob);
  const anchor = document.createElement('a');
  anchor.href = objectUrl;
  anchor.download = filename;
  document.body.appendChild(anchor);
  anchor.click();
  anchor.remove();
  // Revoking immediately can cancel the download in Safari.
  setTimeout(() => URL.revokeObjectURL(objectUrl), 4000);
}

/**
 * Whether a message is something to put in front of a person.
 *
 * The API writes its refusals as sentences, but a failure that escapes a library puts
 * whatever it likes in the envelope — `auth/invalid-credential`, or a stack trace. A
 * single unspaced token is an identifier and a very long one is a dump; neither is worth
 * showing, and both are worse than a plain sentence in the reader's own language.
 */
function isUserFacing(message: string | null | undefined): message is string {
  const trimmed = message?.trim();
  if (!trimmed) return false;
  return trimmed.length <= 300 && /\s/.test(trimmed);
}

/** The sentence to show for a failed request, translated when the server supplied none. */
function describeError(error: ApiRequestError, copy: AppCopy): string {
  /*
   * Checked before the server's sentence, which is the one exception to the rule below.
   * A `pdf-unavailable` message is written for whoever deploys the site — it names
   * environment variables and a README section — so unlike a quota message, the server is
   * not the better-informed party about what the *reader* should be told.
   */
  if (error.code === 'pdf-unavailable') return copy.cvs.pdfUnavailableBody;
  if (isUserFacing(error.serverMessage)) return error.serverMessage;
  if (error.code === 'network') return copy.dashboard.networkError;
  if (error.isEntitlement) return copy.dashboard.planLimitBody;
  return copy.dashboard.requestRefused(error.status);
}

/**
 * Turns any thrown error into a toast.
 *
 * A `402` is never shown as a generic failure: the server's own sentence is displayed
 * verbatim next to an Upgrade action pointing at the URL the server supplied.
 *
 * "Verbatim" is the whole point of the descriptions here, and it is also why this is the
 * only place that translates. The server knows which quota was hit and says so; the
 * browser only knows that something was refused. So a message the server wrote wins, and
 * the localised strings are the floor underneath it — used when there is no message, or
 * when what came back is machine output rather than prose.
 */
export function useApiErrorToast(): (error: unknown, fallbackTitle: string) => void {
  const toast = useToast();
  const router = useRouter();
  const copy = useCopy();

  return useCallback(
    (error: unknown, fallbackTitle: string) => {
      if (error instanceof ApiRequestError) {
        if (error.isEntitlement) {
          const target = error.upgradeUrl ?? '/pricing';
          trackEvent('upgrade_prompt_shown', { reason: error.code });
          toast.push({
            title: copy.dashboard.planLimitTitle,
            description: describeError(error, copy),
            tone: 'warning',
            durationMs: 12000,
            action: { label: copy.dashboard.seePlans, onClick: () => router.push(target) },
          });
          return;
        }
        toast.error(fallbackTitle, describeError(error, copy));
        return;
      }
      toast.error(
        fallbackTitle,
        // Not an `ApiRequestError`, so nothing here was written for a reader: a `TypeError`
        // from the runtime is the usual case.
        error instanceof Error && isUserFacing(error.message)
          ? error.message
          : copy.dashboard.pleaseTryAgain,
      );
    },
    [toast, router, copy],
  );
}

/** Copies text and reports whether it worked, so the caller can toast honestly. */
export async function copyToClipboard(value: string): Promise<boolean> {
  try {
    await navigator.clipboard.writeText(value);
    return true;
  } catch {
    return false;
  }
}
