/**
 * Where to send someone after they sign in, derived from an untrusted `?next=`.
 *
 * ## Why this is its own module
 *
 * Two places decide this: the auth forms, and `proxy.ts` when it bounces an already
 * signed-in visitor off `/login`. They used to hold two copies of the rule, and the copies
 * were not equivalent — which is the whole reason this file exists.
 *
 * The proxy's copy did this:
 *
 *     url.pathname = next && next.startsWith('/') ? next : '/dashboard';
 *     url.search = '';
 *
 * `next` is a *path with a query* — `/payment/checkout?plan=pro`. Assigning that to
 * `URL.pathname` percent-encodes the `?`, so the redirect went to
 * `/payment/checkout%3Fplan=pro`: one path segment, matching no route, **404**. A visitor
 * who clicked "Get Pro" while signed out was sent to sign in, signed in, and landed on a
 * page-not-found — the entire purchase funnel, for every new customer, and only for new
 * customers, because anyone already signed in never took that branch.
 *
 * The proxy's own comment claimed it mirrored the form's rule. It nearly did. Nearly is how
 * a duplicated rule fails: close enough to look right, different where it mattered.
 *
 * So the rule lives here once, with no imports, so that both the Node-runtime proxy and the
 * React forms can use the same function — and `resolveNextUrl` below owns the URL
 * construction too, because the construction is where the bug actually was.
 */

/** Where a successful sign-in lands when nothing better is asked for. */
export const AFTER_AUTH_PATH = '/dashboard';

/**
 * Turns an untrusted `?next=` value into a path we are willing to navigate to.
 *
 * Only a same-origin *path* survives: it must begin with a single `/`, and must not begin
 * with `//` or `/\` — a browser resolves both as protocol-relative URLs, which would let
 * `?next=//evil.example` bounce a freshly signed-in user off-site. Control characters are
 * rejected because a smuggled newline turns one header into two once something re-parses it.
 *
 * The query string is preserved deliberately. It is the part that carries *which plan the
 * customer is buying*, and dropping it is indistinguishable from dropping the sale.
 */
export function safeNextPath(
  value: string | string[] | null | undefined,
  fallback: string = AFTER_AUTH_PATH,
): string {
  const raw = Array.isArray(value) ? value[0] : value;
  if (typeof raw !== 'string') return fallback;

  const candidate = raw.trim();
  if (!candidate.startsWith('/')) return fallback;
  if (candidate.startsWith('//') || candidate.startsWith('/\\')) return fallback;

  for (const character of candidate) {
    const code = character.codePointAt(0) ?? 0;
    if (code < 0x20 || code === 0x7f) return fallback;
  }

  return candidate;
}

/**
 * The absolute URL to redirect a signed-in visitor to, given an untrusted `?next=`.
 *
 * `new URL(path, origin)` rather than assigning to `.pathname` and `.search` by hand: the
 * constructor parses a path-with-query into its parts, which is exactly the step the old
 * code skipped. Passing the origin explicitly also means a `next` that somehow survived
 * sanitisation as an absolute URL cannot escape — `new URL('/a', origin)` is origin-locked,
 * and anything not starting with a single `/` never reaches here.
 */
export function resolveNextUrl(
  value: string | string[] | null | undefined,
  origin: string,
  fallback: string = AFTER_AUTH_PATH,
): URL {
  return new URL(safeNextPath(value, fallback), origin);
}
