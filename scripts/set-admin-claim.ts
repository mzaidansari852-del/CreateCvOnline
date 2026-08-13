/**
 * Grants or revokes administrator access.
 *
 *   npm run set-admin -- --email you@example.com
 *   npm run set-admin -- --email you@example.com --revoke
 *   npm run set-admin -- --all-from-env
 *
 * Admin access is a Firebase custom claim, which is what `authedRoute({ requireAdmin })`
 * and `requireAdmin()` check. A `role` field is also mirrored onto the user's Firestore
 * document so the admin console can display it, but the claim is the authority.
 *
 * Refresh tokens are revoked afterwards so the change takes effect on the next request
 * rather than whenever the user's current ID token happens to expire.
 */
import { auth, db, hasFlag, loadEnv, arg } from './lib/bootstrap.ts';

loadEnv();

async function apply(email: string, makeAdmin: boolean): Promise<void> {
  const user = await auth()
    .getUserByEmail(email)
    .catch(() => null);

  if (!user) {
    console.error(`✗ No account found for ${email}. They must sign up first.`);
    process.exitCode = 1;
    return;
  }

  await auth().setCustomUserClaims(user.uid, makeAdmin ? { admin: true, role: 'admin' } : {});
  await db()
    .collection('users')
    .doc(user.uid)
    .set({ role: makeAdmin ? 'admin' : 'user', updatedAt: new Date().toISOString() }, { merge: true });
  await auth().revokeRefreshTokens(user.uid);

  console.log(
    `${makeAdmin ? '✓ Granted' : '✓ Revoked'} admin for ${email} (${user.uid}). ` +
      `They must sign in again for it to take effect.`,
  );
}

async function main(): Promise<void> {
  const revoke = hasFlag('revoke');

  if (hasFlag('all-from-env')) {
    const emails = (process.env.ADMIN_EMAILS ?? '')
      .split(',')
      .map((value) => value.trim())
      .filter(Boolean);

    if (emails.length === 0) {
      console.error('✗ ADMIN_EMAILS is empty in .env.local — nothing to do.');
      process.exit(1);
    }
    for (const email of emails) await apply(email, !revoke);
    return;
  }

  const email = arg('email');
  if (!email) {
    console.error(
      'Usage:\n' +
        '  npm run set-admin -- --email you@example.com\n' +
        '  npm run set-admin -- --email you@example.com --revoke\n' +
        '  npm run set-admin -- --all-from-env\n',
    );
    process.exit(1);
  }

  await apply(email, !revoke);
}

main().catch((error: unknown) => {
  console.error('✗ Failed:', error instanceof Error ? error.message : error);
  process.exit(1);
});
