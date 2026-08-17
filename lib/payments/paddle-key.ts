/**
 * What a Paddle API key looks like, and what to say when one does not.
 *
 * ## Why this file exists
 *
 * A deployment with a mistyped key does not fail at start-up. It fails once, per customer,
 * at the worst possible moment: the checkout offers a card button, the button asks the
 * server for a transaction, and Paddle answers
 *
 *     "Authentication header included, but incorrectly formatted."
 *
 * — which our own code turned into a 502 and a "please try again in a moment" that no
 * amount of trying would fix. The key was not rejected because it was the wrong key; it was
 * rejected because it was not shaped like a key at all. Paddle validates the *pattern*
 * before it ever looks the value up, so a truncated paste and a revoked credential produce
 * completely different errors — and only one of them is worth retrying.
 *
 * That distinction is checkable before a single request goes out, which is the point of
 * this module. Two things follow from it:
 *
 *  1. a structurally impossible key means Paddle is *not configured*, so the checkout shows
 *     PayPal instead of a button guaranteed to fail, and
 *  2. the diagnostic endpoint can say which part of the key is wrong without ever printing
 *     the key.
 *
 * ## The format
 *
 * Paddle documents API keys as 69 characters with five underscores:
 *
 *     pdl_(live|sdbx)_apikey_[a-z0-9]{26}_[a-zA-Z0-9]{22}_[a-zA-Z0-9]{3}
 *
 * The three leading segments are meaningful — `pdl_` marks it as Paddle's, `live`/`sdbx`
 * picks the environment, and `apikey_` separates it from the *client-side* token, which is
 * a different credential with a different prefix (`live_` / `test_`) and is safe to publish.
 * Confusing the two in either direction is the single most common Paddle misconfiguration,
 * and it is the one worth naming loudly: an API key in the public token's slot ships a
 * server secret to every browser.
 */

/** Paddle's documented format for keys issued from 6 May 2025 onwards. */
const PADDLE_API_KEY = /^pdl_(live|sdbx)_apikey_[a-z\d]{26}_[a-zA-Z\d]{22}_[a-zA-Z\d]{3}$/;

/** The client-side token — publishable, and not this credential. */
const PADDLE_CLIENT_TOKEN = /^(live|test)_[a-zA-Z\d]{10,}$/;

export const PADDLE_API_KEY_LENGTH = 69;

export type PaddleKeyProblem =
  | 'missing'
  | 'client-token-in-api-key-slot'
  | 'missing-prefix'
  | 'truncated'
  | 'too-long'
  | 'wrong-shape'
  | 'invisible-characters';

export interface PaddleKeyReport {
  /** Whether this value can be used. Legacy keys are accepted — see `looksLegacy`. */
  usable: boolean;
  problem: PaddleKeyProblem | null;
  /** Character count. Safe to publish: it is a property of the format, not of the secret. */
  length: number;
  /**
   * The fixed leading segments only — `pdl_sdbx_apikey_` — never the random part. This is
   * a type marker shared by every key Paddle has ever issued for that environment, so it
   * identifies the *kind* of credential without narrowing which one it is.
   */
  prefix: string | null;
  environment: 'sandbox' | 'production' | null;
  /**
   * Keys issued before 6 May 2025 are 50-character random strings with no prefix. They
   * still work, so they must not be rejected — but they cannot be validated either.
   */
  looksLegacy: boolean;
}

/**
 * Characters that survive a `trim()` and a `\s` strip but are illegal in an HTTP header —
 * zero-width spaces and the like, pasted invisibly from a dashboard or a chat message.
 * JavaScript's `\s` does not match U+200B, so nothing upstream removes them and nothing
 * on screen shows them; the only symptom is a credential that is "obviously correct" and
 * does not work.
 */
const INVISIBLE = /[\u200b-\u200d\u2060\ufeff\u00ad]/;

/** The fixed part of a well-formed key, up to and including `apikey_`. */
function prefixOf(key: string): string | null {
  const match = /^pdl_(live|sdbx)_apikey_/.exec(key);
  return match ? match[0] : null;
}

/**
 * Describes a candidate API key without revealing it.
 *
 * Every field of the result is either a fixed literal shared by all keys of that kind, or a
 * count. Nothing derived from the random portion crosses the boundary — no prefix of it, no
 * suffix, no hash — because a diagnostic that leaks four characters of a credential is a
 * worse bug than the one it was added to find.
 */
export function describePaddleApiKey(raw: string | undefined | null): PaddleKeyReport {
  const key = raw ?? '';
  const base: PaddleKeyReport = {
    usable: false,
    problem: null,
    length: key.length,
    prefix: prefixOf(key),
    environment: null,
    looksLegacy: false,
  };

  if (!key) return { ...base, problem: 'missing' };
  if (INVISIBLE.test(key)) return { ...base, problem: 'invisible-characters' };

  if (PADDLE_CLIENT_TOKEN.test(key)) {
    return { ...base, problem: 'client-token-in-api-key-slot' };
  }

  if (PADDLE_API_KEY.test(key)) {
    return {
      ...base,
      usable: true,
      environment: key.startsWith('pdl_live_') ? 'production' : 'sandbox',
    };
  }

  /*
   * The prefix is present, so the rest of the value is what is wrong. Length first, because
   * it is the fact that tells someone what to do: too short means the copy stopped early,
   * too long means something came along with it, and the right length means the characters
   * themselves are wrong.
   */
  if (key.startsWith('pdl_')) {
    if (key.length < PADDLE_API_KEY_LENGTH) return { ...base, problem: 'truncated' };
    if (key.length > PADDLE_API_KEY_LENGTH) return { ...base, problem: 'too-long' };
    return { ...base, problem: 'wrong-shape' };
  }

  /*
   * A current-format key that lost its leading segments — which happens far more often in
   * practice than a wholesale mistype. The real value that broke this deployment for two
   * days read `apikey_01m03…`: the `pdl_sdbx_` in front of it had simply not been copied,
   * and Paddle answered "incorrectly formatted" to every request.
   *
   * This has to be tested *before* the legacy branch below. `apikey_01m03…` has no `pdl_`
   * prefix and is comfortably over forty characters, so the first version of this function
   * waved it through as a pre-2025 legacy key: the gateway reported itself configured, the
   * checkout offered a card button, and the module written to prevent that failure produced
   * it instead. Found by running it against the real broken value rather than only against
   * the cases it had been designed around.
   */
  if (key.includes('apikey_') || /^(sdbx|live)_/.test(key)) {
    return { ...base, problem: 'missing-prefix' };
  }

  /*
   * A legacy key: a 50-character random string, issued before 6 May 2025. It cannot be
   * validated, so it is accepted — refusing to start a checkout because a *working*
   * credential predates a format change would be this module causing the outage it exists
   * to prevent.
   *
   * The underscore test is what keeps that leniency narrow. Legacy keys are plain random
   * strings; every current-format key and every mangled fragment of one carries the
   * underscores of the segment structure, so "no underscores at all" separates "cannot be
   * checked" from "checked and wrong" without a length guess doing the work.
   */
  if (!key.includes('_') && /^[a-zA-Z\d]{40,60}$/.test(key)) {
    return { ...base, usable: true, looksLegacy: true };
  }

  return { ...base, problem: 'wrong-shape' };
}

/** One sentence naming what is wrong, for a log line or a diagnostic endpoint. */
export function explainPaddleKeyProblem(report: PaddleKeyReport): string | null {
  switch (report.problem) {
    case null:
      return null;
    case 'missing':
      return 'PADDLE_API_KEY is not set.';
    case 'client-token-in-api-key-slot':
      return (
        'PADDLE_API_KEY holds a client-side token (it starts with test_ or live_), not an API ' +
        'key. The API key starts pdl_sdbx_apikey_ or pdl_live_apikey_ and is shown once, when ' +
        'you create it in Paddle > Developer tools > Authentication.'
      );
    case 'missing-prefix':
      return (
        'PADDLE_API_KEY is missing the start of the key. The value begins at "apikey_"; a ' +
        'Paddle API key begins "pdl_sdbx_apikey_" (sandbox) or "pdl_live_apikey_" (live). ' +
        'Add the missing prefix to the front of the value — if the rest was copied intact, ' +
        `that is the whole fix, and the result is ${PADDLE_API_KEY_LENGTH} characters.`
      );
    case 'truncated':
      return (
        `PADDLE_API_KEY is ${report.length} characters; a Paddle API key is ` +
        `${PADDLE_API_KEY_LENGTH}. The value was cut short when it was copied — Paddle shows ` +
        'the key only at the moment it is created, so it has to be generated again.'
      );
    case 'too-long':
      return (
        `PADDLE_API_KEY is ${report.length} characters; a Paddle API key is ` +
        `${PADDLE_API_KEY_LENGTH}. Something extra was pasted with it.`
      );
    case 'invisible-characters':
      return (
        'PADDLE_API_KEY contains invisible characters (a zero-width space or similar) that ' +
        'came in with the paste. Retype or re-paste the value as plain text.'
      );
    case 'wrong-shape':
      return (
        'PADDLE_API_KEY does not match the format of a Paddle API key: ' +
        'pdl_sdbx_apikey_… (sandbox) or pdl_live_apikey_… (live).'
      );
  }
}
