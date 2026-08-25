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

import { describePaddleApiKey, explainPaddleKeyProblem } from '@/lib/payments/paddle-key';

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
  /** The currency plan prices are quoted in. */
  storeCurrency: string;
  /** Paddle's client-side token. Public by design; never the API key. */
  paddleClientToken: string;
  paddleEnvironment: 'sandbox' | 'production';
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
  /*
   * The currency `lib/plans.ts` quotes its prices in.
   *
   * Named for the store rather than for a gateway. It was `paypalCurrency` once, which was
   * never really a PayPal setting — it always meant "what our prices are denominated in".
   * `NEXT_PUBLIC_PAYPAL_CURRENCY` is still read as a fallback so a deployment that set it
   * years ago keeps working without a new environment entry; new ones should set
   * `NEXT_PUBLIC_STORE_CURRENCY`.
   */
  storeCurrency: (
    process.env.NEXT_PUBLIC_STORE_CURRENCY ||
    process.env.NEXT_PUBLIC_PAYPAL_CURRENCY ||
    'USD'
  )
    .toUpperCase()
    .slice(0, 3),
  /*
   * Paddle's client-side token is *designed* to be public — it identifies the seller to
   * Paddle.js and can do nothing on its own. It is not the API key, which is server-only
   * and must never appear here. Paddle prefixes them differently for exactly this reason:
   * a client token starts `live_`/`test_`, an API key starts `pdl_`. A test asserts the
   * one in this field is not an API key, because pasting the wrong value into the wrong
   * variable is the single most likely way to leak it.
   */
  paddleClientToken: process.env.NEXT_PUBLIC_PADDLE_CLIENT_TOKEN ?? '',
  paddleEnvironment:
    (process.env.NEXT_PUBLIC_PADDLE_ENVIRONMENT || 'sandbox').toLowerCase() === 'production'
      ? ('production' as const)
      : ('sandbox' as const),
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
 * in, no Paddle key and checkout returns a 503. Miss this one and the site works
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
      "(no trailing slash), in the hosting provider's environment variables.";
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
 * Reads an opaque credential — a Paddle API key, client token or webhook secret.
 *
 * These are base64url-ish tokens: letters, digits, `-`, `_`, `.`. They never legitimately
 * contain whitespace or quotes, and both get introduced by hand in a hosting dashboard:
 *
 *  - A dashboard wraps a long key across two lines, so select-and-copy yields a value with
 *    a newline in the middle. `trim()` does not touch that.
 *  - Anyone who has just pasted `FIREBASE_PRIVATE_KEY` — which *must* keep its wrapping
 *    quotes — tends to quote the next value too, out of habit.
 *
 * Either produces an authentication failure from the provider and an afternoon spent
 * re-reading credentials that were correct all along. Both are unambiguously mistakes, so
 * repair them here rather than reporting them.
 */
function readOpaqueToken(raw: string | undefined): string | undefined {
  if (!raw) return undefined;
  const unquoted = raw.trim().replace(/^["']|["']$/g, '');
  /*
   * `Bearer ` is stripped because the value is a *credential*, not a header. Anyone
   * copying from an API reference — where the example is `Authorization: Bearer <key>` —
   * takes the word along with it, and the result is a header reading `Bearer Bearer …`
   * that every provider rejects as malformed rather than as wrong.
   */
  const bare = unquoted.replace(/^Bearer\s+/i, '');
  const compact = bare.replace(/\s+/g, '');
  return compact.length > 0 ? compact : undefined;
}

/**
 * Whether the four Paddle switches contradict each other.
 *
 * ## Why this is a hard failure rather than a warning
 *
 * Paddle is configured by four independent values that all have to say the same thing:
 * the API key's own prefix (`pdl_sdbx_` / `pdl_live_`), `PADDLE_ENVIRONMENT`, the client
 * token's prefix (`test_` / `live_`), and `NEXT_PUBLIC_PADDLE_ENVIRONMENT`. `.env.example`
 * says they must agree. Nothing checked that they did, and the two ways they come apart are
 * both silent:
 *
 *  - **Half-switched.** The API key is swapped to live and `PADDLE_ENVIRONMENT` is not, or
 *    the reverse. `create-transaction` then creates the transaction in one environment and
 *    the browser opens the overlay in the other, so Paddle cannot find it. Every customer
 *    gets "we could not open the payment window" and it reads as a broken site rather than
 *    a missing environment variable.
 *
 *  - **Left in sandbox.** Everything agrees, on sandbox, in production. No real card can be
 *    charged — but the grant path does not care which environment a transaction came from.
 *    It checks that the transaction is `completed` and that the amount equals the plan
 *    price, then writes a real entitlement. In sandbox both are satisfiable by anyone, with
 *    Paddle's published test card, for free. The client token is baked into the browser
 *    bundle, so "this site is in sandbox" is not a secret either.
 *
 * A contradiction therefore makes the gateway *absent*, exactly as a malformed key already
 * does: the checkout says payments are unavailable — which is true — instead of offering a
 * button that cannot work, or one that works far too well.
 *
 * ## What it deliberately does not do
 *
 * It does not fire when the environment cannot be established. A legacy pre-2025 API key is
 * a 50-character random string with no prefix, so `describePaddleApiKey` reports
 * `environment: null`; those keys work, and refusing to start a checkout because a working
 * credential predates a format change would be this function causing the outage it exists
 * to prevent. Same for an unset client token, which `checkoutWillOfferPaddle` already
 * covers.
 */
export function paddleEnvironmentProblem(input: {
  /** From the API key's prefix. `null` for a legacy key — not checkable, so not checked. */
  keyEnvironment: 'sandbox' | 'production' | null;
  serverEnvironment: 'sandbox' | 'production';
  /** Raw `NEXT_PUBLIC_PADDLE_CLIENT_TOKEN`. Empty when unset. */
  clientToken: string;
  publicEnvironment: 'sandbox' | 'production';
}): string | null {
  const { keyEnvironment, serverEnvironment, clientToken, publicEnvironment } = input;

  if (keyEnvironment && keyEnvironment !== serverEnvironment) {
    return (
      `PADDLE_API_KEY is a ${keyEnvironment} key but PADDLE_ENVIRONMENT is ` +
      `"${serverEnvironment}". Paddle would be called in the wrong environment and would ` +
      'reject the key. Set both to the same environment.'
    );
  }

  if (serverEnvironment !== publicEnvironment) {
    return (
      `PADDLE_ENVIRONMENT is "${serverEnvironment}" but NEXT_PUBLIC_PADDLE_ENVIRONMENT is ` +
      `"${publicEnvironment}". The transaction would be created in one environment and the ` +
      'checkout opened in the other, so Paddle could not find it.'
    );
  }

  // `test_` / `live_` are the documented client-token prefixes. Anything else is either the
  // API key in the wrong slot — which `describePaddleApiKey` reports separately — or a value
  // whose environment cannot be read, and an unreadable token is not a contradiction.
  const tokenEnvironment = clientToken.startsWith('live_')
    ? 'production'
    : clientToken.startsWith('test_')
      ? 'sandbox'
      : null;

  if (tokenEnvironment && tokenEnvironment !== publicEnvironment) {
    return (
      `NEXT_PUBLIC_PADDLE_CLIENT_TOKEN is a ${tokenEnvironment} token but ` +
      `NEXT_PUBLIC_PADDLE_ENVIRONMENT is "${publicEnvironment}". Paddle.js would load one ` +
      'environment and authenticate against the other.'
    );
  }

  return null;
}

export interface ServerEnv {
  firebaseAdmin: { projectId: string; clientEmail: string; privateKey: string } | null;
  storageBucket: string | undefined;
  paddle: {
    apiKey: string;
    /** Undefined until the webhook is created in the Paddle dashboard. */
    webhookSecret: string | undefined;
    environment: 'sandbox' | 'production';
    prices: { pro: string; lifetime: string };
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

  const paddleApiKey = readOpaqueToken(process.env.PADDLE_API_KEY);
  /*
   * The key is checked against Paddle's documented format before anything is built from it.
   *
   * A key that cannot possibly authenticate is not a working gateway with a bad credential;
   * it is an absent gateway. Treating it as present is what produced the failure this check
   * exists for — the checkout offered a card button, the button asked for a transaction,
   * and Paddle answered "Authentication header included, but incorrectly formatted" to
   * every customer who pressed it. Failing the configuration test instead means the
   * checkout says payments are unavailable — which is true — while the status endpoint
   * says exactly what is wrong with the key.
   */
  const paddleKeyReport = describePaddleApiKey(paddleApiKey);
  if (paddleApiKey && !paddleKeyReport.usable) {
    // Once per process, at the point the value is first read. Never the value itself.
    console.error('[paddle]', explainPaddleKeyProblem(paddleKeyReport));
  }
  const paddleWebhookSecret = readOpaqueToken(process.env.PADDLE_WEBHOOK_SECRET);
  const paddleEnvironment = (
    readOpaqueToken(process.env.PADDLE_ENVIRONMENT) || 'sandbox'
  ).toLowerCase();
  const resolvedPaddleEnvironment = paddleEnvironment === 'production' ? 'production' : 'sandbox';

  /*
   * The four switches have to agree. See `paddleEnvironmentProblem` for the two ways they
   * come apart and why a contradiction is treated as an absent gateway rather than a
   * warning nobody reads.
   */
  /*
   * The two public values are read from `process.env` here rather than from `publicEnv`.
   *
   * `publicEnv` is a module-level const, frozen the first time this file is imported. That
   * is right for it — the browser bundle carries one fixed value — but it means the
   * comparison could never be exercised: a test can move `PADDLE_ENVIRONMENT` and reset the
   * `serverEnv()` cache, and the other half of the comparison would stay at whatever it was
   * at import. An unexercised guard on a payment path is not a guard.
   *
   * Reading them lazily is equivalent in production, where both resolve to the same
   * build-time value, and it keeps every input to `serverEnv()` sourced the same way.
   */
  const paddleMismatch = paddleEnvironmentProblem({
    keyEnvironment: paddleKeyReport.environment,
    serverEnvironment: resolvedPaddleEnvironment,
    clientToken: (process.env.NEXT_PUBLIC_PADDLE_CLIENT_TOKEN ?? '').trim(),
    publicEnvironment:
      (process.env.NEXT_PUBLIC_PADDLE_ENVIRONMENT ?? '').trim().toLowerCase() === 'production'
        ? 'production'
        : 'sandbox',
  });
  if (paddleApiKey && paddleMismatch) {
    console.error('[paddle]', paddleMismatch);
  }

  /*
   * Sandbox credentials on the production deployment: refuse to build.
   *
   * This is the case that cannot be left to a log line. Everything agrees, so the checkout
   * works — it just works in an environment where the plan price can be paid by anyone with
   * Paddle's published test card, and the entitlement it grants is a real one.
   *
   * Gated on `VERCEL_ENV === 'production'` rather than `NODE_ENV`, because preview
   * deployments are also `NODE_ENV=production` and running them against sandbox is the
   * correct thing to do. Failing those would make this check something people work around.
   * On hosts that do not set `VERCEL_ENV` it degrades to a loud warning rather than guessing.
   */
  if (paddleApiKey && resolvedPaddleEnvironment === 'sandbox') {
    const message =
      'PADDLE_ENVIRONMENT is "sandbox" on a production deployment. Sandbox transactions ' +
      'take no real money, but they still satisfy the checks that grant a plan — anyone ' +
      'could pay with Paddle\'s test card and be granted Pro for free. Switch the API key, ' +
      'the price ids, the webhook secret, the client token and both environment variables ' +
      'to live together.';
    if (process.env.VERCEL_ENV === 'production') {
      throw new Error(`[env] ${message}`);
    }
    if (typeof window === 'undefined' && process.env.NODE_ENV === 'production') {
      console.warn(`\n[paddle] Warning: ${message}\n`);
    }
  }

  /*
   * One price id per paid plan. These are not secrets — they appear in the checkout the
   * customer sees — but they belong in the environment rather than in `lib/plans.ts`,
   * because sandbox and production have entirely different ids and the same build has to
   * run against both.
   */
  const paddlePrices = {
    pro: readOpaqueToken(process.env.PADDLE_PRICE_PRO),
    lifetime: readOpaqueToken(process.env.PADDLE_PRICE_LIFETIME),
  };

  cached = {
    firebaseAdmin,
    storageBucket:
      process.env.FIREBASE_STORAGE_BUCKET?.trim() || publicEnv.firebase.storageBucket || undefined,
    /*
     * Paddle is configured only when the API key *and* both price ids are present.
     * A half-configured gateway is worse than an absent one: the checkout button would
     * render, the overlay would open, and the purchase would fail after the customer had
     * already entered a card. `paymentsAvailable()` reads this, so an incomplete setup
     * shows the "payments unavailable" notice rather than a button that cannot work.
     *
     * The webhook secret is deliberately *not* part of that test. It is required to grant
     * entitlements and the webhook route refuses to run without it, but a deployment that
     * can take a payment and cannot yet confirm it is recoverable by reconciliation —
     * whereas one that cannot take a payment at all is not.
     */
    paddle:
      paddleApiKey &&
      paddleKeyReport.usable &&
      !paddleMismatch &&
      paddlePrices.pro &&
      paddlePrices.lifetime
        ? {
            apiKey: paddleApiKey,
            webhookSecret: paddleWebhookSecret,
            environment: resolvedPaddleEnvironment,
            prices: { pro: paddlePrices.pro, lifetime: paddlePrices.lifetime },
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

function clampNumber(raw: string | undefined, fallback: number, min: number, max: number): number {
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

/** True when server-side Firebase operations are possible. */
export function isFirebaseAdminConfigured(): boolean {
  return serverEnv().firebaseAdmin !== null;
}

export function isPaddleConfigured(): boolean {
  return serverEnv().paddle !== null;
}

/** Used by tests to reset memoised state between cases. */
export function __resetServerEnvCache(): void {
  cached = null;
}
