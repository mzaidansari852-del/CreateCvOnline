import { readFileSync, existsSync } from 'node:fs';
import { join } from 'node:path';

import { describe, expect, it } from 'vitest';

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

  it('leaves the private layouts free to read the session', () => {
    // The fix is about *where* the cookie is read, not about avoiding it entirely.
    const dashboardLayout = 'app/dashboard/layout.tsx';
    if (existsSync(join(process.cwd(), dashboardLayout))) {
      expect(read(dashboardLayout)).toMatch(/requireViewer|requireUser|getViewer/);
    }
  });
});
