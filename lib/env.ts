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

  const paypalClientId = process.env.PAYPAL_CLIENT_ID?.trim();
  const paypalClientSecret = process.env.PAYPAL_CLIENT_SECRET?.trim();
  const paypalEnvironment = (process.env.PAYPAL_ENVIRONMENT?.trim() || 'sandbox').toLowerCase();

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
            webhookId: process.env.PAYPAL_WEBHOOK_ID?.trim() || undefined,
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
