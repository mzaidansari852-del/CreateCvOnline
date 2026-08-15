import { readFileSync, existsSync } from 'node:fs';
import { join } from 'node:path';

import { describe, expect, it } from 'vitest';

import { TEMPLATE_CATEGORIES } from '@/lib/cv/template-registry';

/**
 * Keeps the public site statically rendered.
 *
 * A single `cookies()` read in the root layout opts *every route in the application* out
 * of static rendering. `getSessionUser()` used to do exactly that, which turned all 56
 * template pages, the 13 landing pages and the home page into per-request renders — each
 * one rebuilding eight CV documents through `renderToStaticMarkup` — and embedded the
 * signed-in user's address, uid and role in the markup of public marketing pages.
 *
 * What made it survive review is that it is invisible in a normal local build:
 * `getSessionUser()` returns early when Firebase Admin credentials are missing, so a
 * credential-less build never reaches `cookies()` and reports every page as static.
 * Production has credentials. Measured with credentials present, the difference was
 * 6 prerendered routes before the fix versus 120 after.
 *
 * These assertions are on the source rather than the build output because the build only
 * reproduces the bug when credentials are configured, which CI generally will not do.
 */

const read = (path: string) => readFileSync(join(process.cwd(), path), 'utf8');

const rootLayout = read('app/layout.tsx');
const authProvider = read('components/auth/AuthProvider.tsx');
const siteHeader = read('components/layout/SiteHeader.tsx');

/** Anything that forces dynamic rendering when evaluated in a layout. */
const DYNAMIC_APIS = [
  'getSessionUser',
  'getViewer',
  'requireViewer',
  'requireUser',
  'requireAdmin',
  'cookies()',
  'headers()',
  'searchParams',
];

describe('static rendering of the public site', () => {
  it('keeps every dynamic API out of the root layout', () => {
    for (const api of DYNAMIC_APIS) {
      // The explanatory comment names some of these, so only code lines count.
      const code = rootLayout
        .split('\n')
        .filter((line) => !line.trimStart().startsWith('*') && !line.trimStart().startsWith('//'))
        .join('\n');
      expect(code, `root layout must not use ${api}`).not.toContain(api);
    }
  });

  it('does not make the root layout async', () => {
    // An async root layout is the shape that invites an await on a request-scoped API.
    expect(rootLayout).toMatch(/export default function RootLayout/);
    expect(rootLayout).not.toMatch(/export default async function RootLayout/);
  });

  it('gives AuthProvider no server-rendered user to accept', () => {
    expect(rootLayout).toContain('<AuthProvider>');
    expect(authProvider).not.toContain('initialUser');
  });

  it('resolves the user from the Firebase client SDK', () => {
    expect(authProvider).toContain('onIdTokenChanged');
    expect(authProvider).toContain('const sessionUser = useMemo');
  });

  it('never lets a client-derived role authorise anything', () => {
    // A role read from the browser is a display value at best. `requireAdmin` decides.
    expect(authProvider).toMatch(/role: 'user'/);
    expect(authProvider).not.toMatch(/role: *firebaseUser/);
  });

  it('waits for the SDK before the header claims the user is signed out', () => {
    // Otherwise every returning visitor sees "Sign in" flash on a static page.
    expect(siteHeader).toContain('ready');
    expect(siteHeader).toMatch(/!ready \?/);
  });

  /*
   * `/templates` is the most linked page on the site and was the only marketing page
   * rendered per request. Reading `searchParams` — in the body *or* in `generateMetadata`
   * — is what opts a route into dynamic rendering, and the filters used to be query links,
   * so it did both. Audit item 3.4.
   *
   * Asserted on the source rather than on a build artefact because the failure is silent:
   * the page keeps working, it just stops being static, and nothing in the output says so
   * until someone reads the build table.
   *
   * The French and German galleries were already static and are held to the same rule —
   * they are the likeliest place for a query-string filter to be reintroduced, since
   * whoever adds one there will be copying whatever the English page does.
   */
  const GALLERIES = [
    'app/(marketing)/templates/page.tsx',
    'app/fr/modeles-de-cv/page.tsx',
    'app/de/lebenslauf-vorlagen/page.tsx',
  ];

  it.each(GALLERIES)('keeps searchParams out of %s', (path) => {
    const gallery = readFileSync(join(process.cwd(), path), 'utf8');
    /*
     * Matched on *use*, not on mention. The page's own doc comment explains what was
     * removed and why, so it names both `searchParams` and `generateMetadata` in prose;
     * a bare `toContain` fails on the explanation rather than on the code. Excluding the
     * backticked forms draws that line exactly, and still catches every way the prop can
     * be read — destructured, typed, or reached through `props`.
     */
    expect(gallery).not.toMatch(/(?<!`)\bsearchParams\b(?!`)/);
    // Static metadata, not a `generateMetadata` that could reach for the query again.
    expect(gallery).toContain('export const metadata');
    expect(gallery).not.toMatch(/(?<!`)\bgenerateMetadata\b(?!`)/);
    // The filtering that replaced it, over cards the server already rendered.
    expect(gallery).toContain('TemplateFilterBar');
  });

  it('sends the old ?category= views to the pages written for them', () => {
    // Two addresses for one list, and only one of them has copy. The redirect has to clear
    // the query as well as move the path, or it produces a third address.
    const proxy = readFileSync(join(process.cwd(), 'proxy.ts'), 'utf8');
    expect(proxy).toContain("pathname === '/templates'");
    expect(proxy).toContain('CATEGORY_SLUGS');
    expect(proxy).toContain("url.search = ''");

    /*
     * The slug list is written out in `proxy.ts` rather than imported, because importing
     * the registry into the proxy pulls all sixty-one template components into the edge
     * bundle. That is the right call and it is also a copy that can drift silently — a
     * renamed category would stop redirecting with nothing to indicate it. So the literal
     * set is parsed back out and compared against the registry.
     */
    const literal = /const CATEGORY_SLUGS = new Set\(\[([^\]]*)\]\)/.exec(proxy);
    expect(literal, 'CATEGORY_SLUGS should be a literal Set of strings').not.toBeNull();
    const declared = [...literal![1]!.matchAll(/'([^']+)'/g)].map((m) => m[1]!);
    expect(declared.sort()).toEqual(TEMPLATE_CATEGORIES.map((c) => c.slug).sort());
  });

  it('leaves the private layouts free to read the session', () => {
    // The fix is about *where* the cookie is read, not about avoiding it entirely.
    const dashboardLayout = 'app/dashboard/layout.tsx';
    if (existsSync(join(process.cwd(), dashboardLayout))) {
      expect(read(dashboardLayout)).toMatch(/requireViewer|requireUser|getViewer/);
    }
  });
});
