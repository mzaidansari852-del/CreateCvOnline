import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

/**
 * Credential reading, and the two paste accidents that produce a PayPal 401.
 *
 * Both are invisible: the value looks right in the hosting dashboard, `trim()` reports
 * nothing wrong, and the only symptom is `invalid_client` from an endpoint that will not
 * tell you which half was wrong.
 *
 *  1. PayPal's console wraps a long client id over two lines. Select-and-copy embeds a
 *     newline; `trim()` only touches the ends.
 *  2. `FIREBASE_PRIVATE_KEY` must keep its wrapping quotes, so whoever just pasted it
 *     quotes the next value too. PayPal then authenticates as `"EBQ4…"` including the
 *     quote characters.
 */

const CLIENT_ID = 'BAAut_Y-X0rh9Jakc9WORvwcbxBR95Lt1wnJmTrUJkrjaUPTF2PhyiZ2uWTvE-iBCWzLBA3Vby1teHFKJA';
const SECRET = 'EBQ4vm99i1tRNGoJ5Po957MTs1TOMB0dVmJaiEYm94S42Mx2_Kwl4t9YETd9ojPR6EnM3ZHIpaTV5A7Q';

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
  process.env.PAYPAL_CLIENT_ID = CLIENT_ID;
  process.env.PAYPAL_CLIENT_SECRET = SECRET;
  process.env.PAYPAL_ENVIRONMENT = 'sandbox';
});

afterEach(() => {
  process.env = { ...ORIGINAL };
  vi.resetModules();
});

describe('PayPal credential reading', () => {
  it('reads a clean pair unchanged', async () => {
    const { serverEnv } = await loadEnv({});
    expect(serverEnv().paypal).toMatchObject({
      clientId: CLIENT_ID,
      clientSecret: SECRET,
      environment: 'sandbox',
    });
  });

  it('repairs a client id copied across the console’s line wrap', async () => {
    const wrapped = `${CLIENT_ID.slice(0, 41)}\n${CLIENT_ID.slice(41)}`;
    expect(wrapped.trim()).not.toBe(CLIENT_ID); // trim() alone does not save you

    const { serverEnv } = await loadEnv({ PAYPAL_CLIENT_ID: wrapped });
    expect(serverEnv().paypal?.clientId).toBe(CLIENT_ID);
  });

  it('strips quotes carried over from the Firebase private key', async () => {
    const { serverEnv } = await loadEnv({
      PAYPAL_CLIENT_ID: `"${CLIENT_ID}"`,
      PAYPAL_CLIENT_SECRET: `"${SECRET}"`,
    });
    expect(serverEnv().paypal).toMatchObject({ clientId: CLIENT_ID, clientSecret: SECRET });
  });

  it('handles single quotes and stray surrounding whitespace', async () => {
    const { serverEnv } = await loadEnv({
      PAYPAL_CLIENT_ID: `  '${CLIENT_ID}'  `,
      PAYPAL_CLIENT_SECRET: `\t${SECRET}\r\n`,
    });
    expect(serverEnv().paypal).toMatchObject({ clientId: CLIENT_ID, clientSecret: SECRET });
  });

  it('normalises the environment flag rather than silently going live', async () => {
    const { serverEnv } = await loadEnv({ PAYPAL_ENVIRONMENT: ' "Sandbox" ' });
    expect(serverEnv().paypal?.environment).toBe('sandbox');
  });

  it('treats a whitespace-only value as absent, not as an empty credential', async () => {
    const { serverEnv } = await loadEnv({ PAYPAL_CLIENT_SECRET: '   ' });
    // Half-configured must read as unconfigured: a 503 "not configured" is a far better
    // signal than a 401 from PayPal.
    expect(serverEnv().paypal).toBeNull();
  });

  it('cleans the webhook id too', async () => {
    const { serverEnv } = await loadEnv({ PAYPAL_WEBHOOK_ID: '"5FR12345AB678901C" ' });
    expect(serverEnv().paypal?.webhookId).toBe('5FR12345AB678901C');
  });

  it('reports missing PayPal configuration by variable name', async () => {
    const { requirePayPalEnv, MissingEnvError } = await loadEnv({
      PAYPAL_CLIENT_ID: undefined,
      PAYPAL_CLIENT_SECRET: undefined,
    });
    expect(() => requirePayPalEnv()).toThrow(MissingEnvError);
    expect(() => requirePayPalEnv()).toThrow(/PAYPAL_CLIENT_ID/);
  });
});
