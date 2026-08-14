import { readFileSync } from 'node:fs';
import { join } from 'node:path';

import { describe, expect, it } from 'vitest';

/**
 * Getting the first administrator into the console.
 *
 * This is a bootstrap problem with a nasty circularity. Admin access is a Firebase custom
 * claim; a claim only reaches a session cookie through a fresh sign-in; and the claim is
 * granted during the first *authenticated* request, which is necessarily after that
 * sign-in. Grant it only via the claim and the first admin needs two sign-ins with no way
 * to know that — it simply looks broken.
 *
 * The escape hatch is `ADMIN_EMAILS`, honoured directly when the role is resolved. It is
 * server-only configuration set by whoever controls the deployment, so trusting it is no
 * weaker than trusting the claim it mirrors.
 *
 * The original build had a worse version of this: `ADMIN_EMAILS` was consulted only in
 * the "profile does not exist" branch, so it worked if set before signing up and silently
 * did nothing afterwards. A deployment could be live with no reachable admin console and
 * no error anywhere.
 */

const read = (path: string) => readFileSync(join(process.cwd(), path), 'utf8');

const session = read('lib/auth/session.ts');
const users = read('lib/db/users.ts');
const guards = read('lib/auth/guards.ts');
const readme = read('README.md');

describe('admin bootstrap', () => {
  it('resolves the role from the custom claim first', () => {
    // The claim stays the durable authority — it is what Firestore rules can see.
    expect(session).toMatch(/claims\?\.admin === true \|\| claims\?\.role === 'admin'/);
  });

  it('also honours ADMIN_EMAILS when resolving the role', () => {
    expect(session).toContain('serverEnv().adminEmails.includes');
  });

  it('passes the email into every role resolution', () => {
    // A call site that forgets the email silently loses the env-var path.
    const calls = session.match(/roleFromClaims\(/g) ?? [];
    // One definition plus three call sites.
    expect(calls.length).toBeGreaterThanOrEqual(4);
    expect(session).toContain('roleFromClaims(record.customClaims, record.email');
  });

  it('lower-cases the address before comparing', () => {
    expect(session).toContain('address.toLowerCase()');
  });

  it('never treats an empty email as a match', () => {
    // `adminEmails` could contain '' from a trailing comma in the variable.
    expect(session).toContain('address.length > 0');
  });

  it('reconciles the claim on every sign-in, not only at account creation', () => {
    expect(users).toContain('shouldBeAdmin');
    expect(users).toContain('user.role !== ');
    expect(users).toContain('setCustomUserClaims');
  });

  it('still guards /admin behind the resolved role', () => {
    expect(guards).toContain("redirect('/dashboard?error=admin-only')");
    expect(guards).toContain("user.role !== 'admin'");
  });

  it('documents that removing the variable does not demote', () => {
    // Claims persist until revoked. Leaving that implicit invites a false sense of
    // having removed someone's access.
    expect(readme).toMatch(/does \*\*not\*\* demote/);
    expect(readme).toContain('--revoke');
  });
});
