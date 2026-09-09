/**
 * Shape checks for Polar credentials.
 *
 * The counterpart to `paddle-key.ts`, and deliberately more modest than it, because Polar
 * gives us less to check.
 *
 * ## What Polar does not tell us
 *
 * A Paddle API key announces its own environment: `pdl_sdbx_apikey_` or `pdl_live_apikey_`.
 * That is what made `paddleEnvironmentProblem` possible — four independent switches could
 * be compared against each other and a half-finished go-live caught before a customer met
 * it.
 *
 * Polar's tokens carry no such marker. `polar_oat_…` is the prefix for an organization
 * access token in *both* sandbox and production, so a sandbox token pasted into a
 * production deployment is indistinguishable from the right one until Polar answers 401 —
 * or, far worse, until it answers 200 for a sandbox order that grants a real plan.
 *
 * Two consequences, both deliberate:
 *
 *   1. There is no cross-check to write, so this file does not pretend to offer one. It
 *      validates the things that *are* checkable — the token looks like a token at all,
 *      and the product ids look like UUIDs — and says nothing it cannot know.
 *   2. The one guard that survives is the important one, and it lives in `lib/env.ts`:
 *      `POLAR_ENVIRONMENT=sandbox` on a production deployment refuses to build. With no
 *      prefix to catch the mistake, that check is no longer a belt-and-braces nicety —
 *      it is the only thing standing between a mis-set variable and free Pro accounts.
 */

/** Polar access-token prefixes, and what each one is. */
const TOKEN_KINDS = {
  polar_oat_: 'organization',
  polar_pat_: 'personal',
} as const;

export type PolarTokenKind = (typeof TOKEN_KINDS)[keyof typeof TOKEN_KINDS];

export interface PolarTokenReport {
  present: boolean;
  /** Whether the value can plausibly authenticate. `false` means "treat as absent". */
  usable: boolean;
  kind: PolarTokenKind | 'unknown';
  /** A sentence naming the problem, or `null` when there is none. Never contains the token. */
  problem: string | null;
}

/**
 * Describes an access token without ever revealing it.
 *
 * A token that cannot possibly authenticate is not a working gateway with a bad
 * credential; it is an absent gateway. Reporting it as unusable makes the checkout say
 * "payments are unavailable" — which is true — rather than render a button that fails
 * after the customer has committed to buying.
 */
export function describePolarAccessToken(token: string | undefined): PolarTokenReport {
  if (!token) {
    return { present: false, usable: false, kind: 'unknown', problem: null };
  }

  const entry = Object.entries(TOKEN_KINDS).find(([prefix]) => token.startsWith(prefix));

  if (!entry) {
    /*
     * The specific mistake worth naming: a webhook secret in the token slot. Both are
     * long opaque strings from the same dashboard, and `whsec_` is the one people reach
     * for by accident because it is the value they generated most recently.
     */
    if (token.startsWith('whsec_')) {
      return {
        present: true,
        usable: false,
        kind: 'unknown',
        problem:
          'POLAR_ACCESS_TOKEN holds a value starting "whsec_", which is a webhook signing ' +
          'secret, not an access token. Put it in POLAR_WEBHOOK_SECRET and create an ' +
          'organization access token (polar_oat_…) under Polar → Settings → Developers.',
      };
    }

    return {
      present: true,
      usable: false,
      kind: 'unknown',
      problem:
        'POLAR_ACCESS_TOKEN does not start with "polar_oat_" or "polar_pat_". Polar would ' +
        'reject every request. Create an organization access token under ' +
        'Polar → Settings → Developers.',
    };
  }

  const [prefix, kind] = entry;

  // Prefix plus a body. Polar's tokens are far longer than this; the bound only catches a
  // truncated paste, which is the realistic failure.
  if (token.length <= prefix.length + 8) {
    return {
      present: true,
      usable: false,
      kind,
      problem:
        `POLAR_ACCESS_TOKEN starts with "${prefix}" but is too short to be a whole token. ` +
        'It was probably truncated when it was copied.',
    };
  }

  if (kind === 'personal') {
    /*
     * Usable, but flagged. A personal access token is scoped to a human rather than to the
     * organization: it works, and it stops working the day that person leaves or rotates
     * it, taking the checkout down with it. Worth a log line, not worth refusing.
     */
    return {
      present: true,
      usable: true,
      kind,
      problem:
        'POLAR_ACCESS_TOKEN is a personal access token (polar_pat_…). It will work, but it ' +
        'is tied to one user account rather than to the organization — if that user rotates ' +
        'it or leaves, checkout stops. Prefer an organization access token (polar_oat_…).',
    };
  }

  return { present: true, usable: true, kind, problem: null };
}

/** Formats a report for a log line. Returns `null` when there is nothing to say. */
export function explainPolarTokenProblem(report: PolarTokenReport): string | null {
  return report.problem;
}

const UUID_PATTERN = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

/**
 * Whether a value looks like a Polar product id.
 *
 * Polar product ids are UUIDs. This matters more than it looks: the ids are not secret and
 * are easy to confuse with the *price* ids, the organization id, or a Paddle `pri_…` left
 * over from the previous integration. A non-UUID in this slot means `checkouts.create`
 * fails for every customer, so it is caught at configuration time instead.
 */
export function isPolarProductId(value: string | undefined): boolean {
  return Boolean(value && UUID_PATTERN.test(value));
}

/**
 * Names what is wrong with a configured product id, or `null` when it is fine.
 *
 * Called for each paid plan, so the message names the variable rather than the plan.
 */
export function explainPolarProductIdProblem(
  variable: string,
  value: string | undefined,
): string | null {
  if (!value) return null;
  if (isPolarProductId(value)) return null;

  if (value.startsWith('pri_') || value.startsWith('pro_')) {
    return (
      `${variable} looks like a Paddle id ("${value.slice(0, 4)}…"). Polar product ids are ` +
      'UUIDs, found on the product page in the Polar dashboard.'
    );
  }

  return (
    `${variable} is not a UUID, so it cannot be a Polar product id. Copy the id from the ` +
    'product page in the Polar dashboard.'
  );
}
