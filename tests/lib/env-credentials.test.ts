import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

/**
 * Credential reading, and the two paste accidents that produce an authentication failure.
 *
 * Both are invisible: the value looks right in the hosting dashboard, `trim()` reports
 * nothing wrong, and the only symptom is a 401 from an endpoint that will not tell you
 * which half was wrong.
 *
 *  1. A dashboard wraps a long key over two lines. Select-and-copy embeds a newline;
 *     `trim()` only touches the ends.
 *  2. `FIREBASE_PRIVATE_KEY` must keep its wrapping quotes, so whoever just pasted it
 *     quotes the next value too. The provider then authenticates as `"pdl_…"` including
 *     the quote characters.
 *
 * These were written against PayPal's credentials and survive it: the hazard is the
 * hosting dashboard, not the gateway, so the cases moved to Paddle's variables when PayPal
 * was removed rather than being deleted with it.
 */

/** A syntactically valid sandbox key: the fixed prefix plus 53 random characters. */
const API_KEY = `pdl_sdbx_apikey_${'01abcdefghijklmnopqrstuvwx'}_${'AbCdEfGhIjKlMnOpQrStUv'}_xY9`;
const PRICE_PRO = 'pri_01hv8x9k2m3n4p5q6r7s8t9u0v';
const PRICE_LIFETIME = 'pri_01hv8x9k2m3n4p5q6r7s8t9u0w';

/** Re-imports `lib/env` so the module-level cache is rebuilt from the current process.env. */
async function loadEnv(vars: Record<string, string | undefined>) {
  vi.resetModules();
  for (const [key, value] of Object.entries(vars)) {
    if (value === undefined) delete process.env[key];
    else process.env[key] = value;
  }
  return import('@/lib/env');
}

const ORIGINAL = { ...process.env };

beforeEach(() => {
  process.env.PADDLE_API_KEY = API_KEY;
  process.env.PADDLE_PRICE_PRO = PRICE_PRO;
  process.env.PADDLE_PRICE_LIFETIME = PRICE_LIFETIME;
  process.env.PADDLE_ENVIRONMENT = 'sandbox';
});

afterEach(() => {
  process.env = { ...ORIGINAL };
  vi.resetModules();
});

describe('Paddle credential reading', () => {
  it('reads a clean set unchanged', async () => {
    const { serverEnv } = await loadEnv({});
    expect(serverEnv().paddle).toMatchObject({
      apiKey: API_KEY,
      environment: 'sandbox',
      prices: { pro: PRICE_PRO, lifetime: PRICE_LIFETIME },
    });
  });

  it('repairs a key copied across the dashboard’s line wrap', async () => {
    const wrapped = `${API_KEY.slice(0, 41)}\n${API_KEY.slice(41)}`;
    expect(wrapped.trim()).not.toBe(API_KEY); // trim() alone does not save you

    const { serverEnv } = await loadEnv({ PADDLE_API_KEY: wrapped });
    expect(serverEnv().paddle?.apiKey).toBe(API_KEY);
  });

  it('strips quotes carried over from the Firebase private key', async () => {
    const { serverEnv } = await loadEnv({
      PADDLE_API_KEY: `"${API_KEY}"`,
      PADDLE_PRICE_PRO: `"${PRICE_PRO}"`,
    });
    expect(serverEnv().paddle).toMatchObject({ apiKey: API_KEY, prices: { pro: PRICE_PRO } });
  });

  it('handles single quotes and stray surrounding whitespace', async () => {
    const { serverEnv } = await loadEnv({
      PADDLE_API_KEY: `  '${API_KEY}'  `,
      PADDLE_PRICE_LIFETIME: `\t${PRICE_LIFETIME}\r\n`,
    });
    expect(serverEnv().paddle).toMatchObject({
      apiKey: API_KEY,
      prices: { lifetime: PRICE_LIFETIME },
    });
  });

  it('normalises the environment flag rather than silently going live', async () => {
    const { serverEnv } = await loadEnv({ PADDLE_ENVIRONMENT: ' "Sandbox" ' });
    expect(serverEnv().paddle?.environment).toBe('sandbox');
  });

  /*
   * `production`, not `live`. PayPal spelled it `live` and the habit outlived the
   * integration, so anything that is not exactly `production` has to mean sandbox — the
   * failure of guessing the other way is charging real cards from a test deployment.
   */
  it('treats PayPal’s spelling of “live” as sandbox', async () => {
    const { serverEnv } = await loadEnv({ PADDLE_ENVIRONMENT: 'live' });
    expect(serverEnv().paddle?.environment).toBe('sandbox');
  });

  it('treats a whitespace-only value as absent, not as an empty credential', async () => {
    const { serverEnv } = await loadEnv({ PADDLE_PRICE_PRO: '   ' });
    // Half-configured must read as unconfigured: a 503 "not configured" is a far better
    // signal than a checkout that opens and then fails on the customer's card.
    expect(serverEnv().paddle).toBeNull();
  });

  it('cleans the webhook secret too', async () => {
    const { serverEnv } = await loadEnv({ PADDLE_WEBHOOK_SECRET: '"pdl_ntfset_01abcdef" ' });
    expect(serverEnv().paddle?.webhookSecret).toBe('pdl_ntfset_01abcdef');
  });

  /*
   * A key that cannot possibly authenticate is an absent gateway, not a present one with a
   * bad credential. Reporting it as configured is what let a checkout render a button that
   * failed for every customer who pressed it.
   */
  it('treats a malformed API key as no gateway at all', async () => {
    const { serverEnv, isPaddleConfigured } = await loadEnv({
      PADDLE_API_KEY: API_KEY.slice(0, 42),
    });
    expect(serverEnv().paddle).toBeNull();
    expect(isPaddleConfigured()).toBe(false);
  });
});
