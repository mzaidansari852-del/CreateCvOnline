/**
 * Environment access.
 *
 * Two rules are enforced here and nowhere else:
 *
 *  1. Client code may only ever read `publicEnv`. It contains nothing but
 *     `NEXT_PUBLIC_*` values, which are inlined into the browser bundle by design.
 *  2. Server secrets are read lazily through `serverEnv()`. Reading them lazily
 *     (rather than at module scope) means `next build` succeeds on a machine that has
 *     no credentials configured, while any request that genuinely needs a secret fails
 *     loudly with an actionable message instead of a cryptic `undefined`.
 */

/* -------------------------------------------------------------------------- */
/* Public                                                                      */
/* -------------------------------------------------------------------------- */

export interface PublicEnv {
  siteUrl: string;
  siteName: string;
  firebase: {
    apiKey: string;
    authDomain: string;
    projectId: string;
    storageBucket: string;
    messagingSenderId: string;
    appId: string;
    measurementId?: string;
  };
  paypalClientId: string;
  paypalCurrency: string;
  gaMeasurementId?: string;
  googleSiteVerification?: string;
}

function normaliseUrl(value: string | undefined): string {
  const raw = value?.trim() || 'http://localhost:3000';
  const withProtocol = /^https?:\/\//i.test(raw) ? raw : `https://${raw}`;
  return withProtocol.replace(/\/+$/, '');
}

/**
 * Public configuration. Safe to import from client components.
 * Missing values degrade to empty strings so the UI can render a "not configured"
 * state rather than crashing the whole tree.
 */
export const publicEnv: PublicEnv = {
  siteUrl: normaliseUrl(process.env.NEXT_PUBLIC_SITE_URL),
  siteName: process.env.NEXT_PUBLIC_SITE_NAME?.trim() || 'CreateCVOnline',
  firebase: {
    apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY ?? '',
    authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN ?? '',
    projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID ?? '',
    storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET ?? '',
    messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID ?? '',
    appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID ?? '',
    measurementId: process.env.NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID || undefined,
  },
  paypalClientId: process.env.NEXT_PUBLIC_PAYPAL_CLIENT_ID ?? '',
  paypalCurrency: (process.env.NEXT_PUBLIC_PAYPAL_CURRENCY || 'USD').toUpperCase().slice(0, 3),
  gaMeasurementId: process.env.NEXT_PUBLIC_GA_MEASUREMENT_ID || undefined,
  googleSiteVerification: process.env.NEXT_PUBLIC_GOOGLE_SITE_VERIFICATION || undefined,
};

/* -------------------------------------------------------------------------- */
/* The site URL guard                                                          */
/* -------------------------------------------------------------------------- */

/**
 * `NEXT_PUBLIC_SITE_URL` is the only variable whose absence is completely invisible.
 *
 * Everything else fails in a way somebody notices: no Firebase key and nobody can sign
 * in, no PayPal secret and checkout returns a 503. Miss this one and the site works
 * perfectly — while every canonical tag, every `og:url`, every JSON-LD `@id`, every
 * sitemap entry and the robots `Host` directive all point at `http://localhost:3000`,
 * because that is what `normaliseUrl` falls back to. Google is told, on every page, that
 * the real home of this content is a machine it cannot reach.
 *
 * There is no runtime symptom to catch it by, so it has to be caught at build time.
 *
 * On a deployment platform this throws and the build fails. Locally it only warns: a
 * production build against localhost is a normal thing to do here — `npm run previews`
 * and `npm run verify:seo` both do it — and making that fail would be trading a real
 * problem for an invented one.
 */
export function siteUrlProblem(url: string): string | null {
  let host: string;
  try {
    host = new URL(url).hostname.toLowerCase();
  } catch {
    return `NEXT_PUBLIC_SITE_URL is not a valid URL ("${url}").`;
  }

  const local =
    host === 'localhost' ||
    host === '0.0.0.0' ||
    host === '::1' ||
    host === '[::1]' ||
    host.endsWith('.local') ||
    host.endsWith('.localhost') ||
    /^127(\.\d{1,3}){3}$/.test(host);

  if (!local) return null;

  return process.env.NEXT_PUBLIC_SITE_URL?.trim()
    ? `NEXT_PUBLIC_SITE_URL points at "${host}", which no crawler or payment provider can reach.`
    : 'NEXT_PUBLIC_SITE_URL is not set, so every canonical URL, Open Graph tag, JSON-LD ' +
        'identifier and sitemap entry would be published as http://localhost:3000.';
}

/** True on Vercel, GitHub Actions, and anything else that sets the conventional flag. */
const isDeploymentBuild = Boolean(process.env.VERCEL || process.env.CI);

if (typeof window === 'undefined' && process.env.NODE_ENV === 'production') {
  const problem = siteUrlProblem(publicEnv.siteUrl);
  if (problem) {
    const message =
      `${problem}\n` +
      'Set it to the public origin of the deployment, e.g. https://www.createcvonline.com ' +
      '(no trailing slash), in the hosting provider\'s environment variables.';
    if (isDeploymentBuild) {
      throw new Error(`[env] ${message}`);
    }
    console.warn(`\n[env] Warning: ${message}\n`);
  }
}

/** True when the browser SDK has everything it needs to talk to Firebase. */
export const isFirebaseClientConfigured =
  publicEnv.firebase.apiKey.length > 0 &&
  publicEnv.firebase.authDomain.length > 0 &&
  publicEnv.firebase.projectId.length > 0 &&
  publicEnv.firebase.appId.length > 0;

/** True when the PayPal Buttons SDK can be loaded in the browser. */
export const isPayPalClientConfigured = publicEnv.paypalClientId.length > 0;

/* -------------------------------------------------------------------------- */
/* Server                                                                      */
/* -------------------------------------------------------------------------- */

export class MissingEnvError extends Error {
  readonly variables: string[];

  constructor(variables: string[], hint: string) {
    super(
      `Missing required environment variable${variables.length > 1 ? 's' : ''}: ` +
        `${variables.join(', ')}.\n${hint}\nSee .env.example and the "Configuration" section of README.md.`,
    );
    this.name = 'MissingEnvError';
    this.variables = variables;
  }
}

function readServiceAccount(): {
  projectId: string;
  clientEmail: string;
  privateKey: string;
} | null {
  const json = process.env.FIREBASE_SERVICE_ACCOUNT_JSON?.trim();
  if (json) {
    try {
      const parsed = JSON.parse(json) as Record<string, string>;
      if (parsed.project_id && parsed.client_email && parsed.private_key) {
        return {
          projectId: parsed.project_id,
          clientEmail: parsed.client_email,
          privateKey: parsed.private_key.replace(/\\n/g, '\n'),
        };
      }
    } catch {
      throw new Error(
        'FIREBASE_SERVICE_ACCOUNT_JSON is set but is not valid JSON. Paste the full contents of the service-account key file.',
      );
    }
  }

  const projectId = process.env.FIREBASE_PROJECT_ID?.trim();
  const clientEmail = process.env.FIREBASE_CLIENT_EMAIL?.trim();
  const privateKey = process.env.FIREBASE_PRIVATE_KEY?.trim();

  if (!projectId || !clientEmail || !privateKey) return null;

  return {
    projectId,
    clientEmail,
    // Hosting dashboards commonly store the key with literal "\n" sequences.
    privateKey: privateKey.replace(/\\n/g, '\n').replace(/^"|"$/g, ''),
  };
}

/**
 * Reads an opaque credential — a PayPal client id, secret or webhook id.
 *
 * These are base64url-ish tokens: letters, digits, `-`, `_`, `.`. They never legitimately
 * contain whitespace or quotes, and both get introduced by hand in a hosting dashboard:
 *
 *  - PayPal's console wraps a long client id across two lines, so select-and-copy yields
 *    a value with a newline in the middle. `trim()` does not touch that.
 *  - Anyone who has just pasted `FIREBASE_PRIVATE_KEY` — which *must* keep its wrapping
 *    quotes — tends to quote the next value too, out of habit.
 *
 * Either produces a 401 from PayPal's token endpoint and an afternoon spent re-reading
 * credentials that were correct all along. Both are unambiguously mistakes, so repair
 * them here rather than reporting them.
 */
function readOpaqueToken(raw: string | undefined): string | undefined {
  if (!raw) return undefined;
  const unquoted = raw.trim().replace(/^["']|["']$/g, '');
  const compact = unquoted.replace(/\s+/g, '');
  return compact.length > 0 ? compact : undefined;
}

export interface ServerEnv {
  firebaseAdmin: { projectId: string; clientEmail: string; privateKey: string } | null;
  storageBucket: string | undefined;
  paypal: {
    clientId: string;
    clientSecret: string;
    environment: 'sandbox' | 'live';
    webhookId: string | undefined;
  } | null;
  pdf: {
    executablePath: string | undefined;
    browserWSEndpoint: string | undefined;
    renderSecret: string;
  };
  sessionCookieDays: number;
  adminEmails: string[];
  rateLimit: { max: number; windowSeconds: number };
}

let cached: ServerEnv | null = null;

/** Lazily-resolved, memoised server configuration. Never import from a client component. */
export function serverEnv(): ServerEnv {
  if (cached) return cached;

  const firebaseAdmin = readServiceAccount();

  const paypalClientId = readOpaqueToken(process.env.PAYPAL_CLIENT_ID);
  const paypalClientSecret = readOpaqueToken(process.env.PAYPAL_CLIENT_SECRET);
  const paypalEnvironment = (
    readOpaqueToken(process.env.PAYPAL_ENVIRONMENT) || 'sandbox'
  ).toLowerCase();

  cached = {
    firebaseAdmin,
    storageBucket:
      process.env.FIREBASE_STORAGE_BUCKET?.trim() ||
      publicEnv.firebase.storageBucket ||
      undefined,
    paypal:
      paypalClientId && paypalClientSecret
        ? {
            clientId: paypalClientId,
            clientSecret: paypalClientSecret,
            environment: paypalEnvironment === 'live' ? 'live' : 'sandbox',
            webhookId: readOpaqueToken(process.env.PAYPAL_WEBHOOK_ID),
          }
        : null,
    pdf: {
      executablePath: process.env.PDF_CHROMIUM_EXECUTABLE_PATH?.trim() || undefined,
      browserWSEndpoint: process.env.PDF_BROWSER_WS_ENDPOINT?.trim() || undefined,
      renderSecret:
        process.env.PDF_RENDER_SECRET?.trim() ||
        process.env.FIREBASE_PRIVATE_KEY?.slice(0, 64) ||
        'createcvonline-insecure-development-render-secret',
    },
    sessionCookieDays: clampNumber(process.env.SESSION_COOKIE_DAYS, 5, 1, 14),
    adminEmails: (process.env.ADMIN_EMAILS ?? '')
      .split(',')
      .map((value) => value.trim().toLowerCase())
      .filter(Boolean),
    rateLimit: {
      max: clampNumber(process.env.RATE_LIMIT_MAX, 60, 1, 10_000),
      windowSeconds: clampNumber(process.env.RATE_LIMIT_WINDOW_SECONDS, 60, 1, 3_600),
    },
  };

  return cached;
}

function clampNumber(
  raw: string | undefined,
  fallback: number,
  min: number,
  max: number,
): number {
  const parsed = Number.parseInt(raw ?? '', 10);
  if (!Number.isFinite(parsed)) return fallback;
  return Math.min(max, Math.max(min, parsed));
}

/** Throws a descriptive `MissingEnvError` when the Admin SDK is not configured. */
export function requireFirebaseAdminEnv(): NonNullable<ServerEnv['firebaseAdmin']> {
  const env = serverEnv();
  if (!env.firebaseAdmin) {
    throw new MissingEnvError(
      ['FIREBASE_PROJECT_ID', 'FIREBASE_CLIENT_EMAIL', 'FIREBASE_PRIVATE_KEY'],
      'Download a service-account key from Firebase Console → Project settings → Service accounts.',
    );
  }
  return env.firebaseAdmin;
}

/** Throws a descriptive `MissingEnvError` when PayPal is not configured. */
export function requirePayPalEnv(): NonNullable<ServerEnv['paypal']> {
  const env = serverEnv();
  if (!env.paypal) {
    throw new MissingEnvError(
      ['PAYPAL_CLIENT_ID', 'PAYPAL_CLIENT_SECRET'],
      'Create a REST API app at https://developer.paypal.com/dashboard/applications.',
    );
  }
  return env.paypal;
}

/** True when server-side Firebase operations are possible. */
export function isFirebaseAdminConfigured(): boolean {
  return serverEnv().firebaseAdmin !== null;
}

/** True when server-side PayPal operations are possible. */
export function isPayPalConfigured(): boolean {
  return serverEnv().paypal !== null;
}

/** Used by tests to reset memoised state between cases. */
export function __resetServerEnvCache(): void {
  cached = null;
}
