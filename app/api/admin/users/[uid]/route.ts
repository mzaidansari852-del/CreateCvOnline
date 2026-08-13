import { NextResponse } from 'next/server';

import { apiError, authedRoute } from '@/lib/api/handler';
import { deleteUserCompletely, getUserProfile } from '@/lib/db/users';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

type Params = { uid: string };

/**
 * Erases an account: the Firebase Auth record, the profile document, every CV and every
 * payment record beneath it. Irreversible, and deliberately so — this is also the route
 * that answers a GDPR erasure request.
 *
 * An administrator may not delete their own account through the console. It would destroy
 * the session performing the request halfway through, and it is indistinguishable from a
 * misclick on the row that happens to be yours. Another administrator can do it, or the
 * account can be removed from the Firebase console.
 */
export const DELETE = authedRoute<Params>(
  {
    scope: 'admin-user-delete',
    requireAdmin: true,
    rateLimit: { max: 10, windowSeconds: 60 },
  },
  async ({ user, params }) => {
    if (params.uid === user.uid) {
      return apiError(
        409,
        'self-delete',
        'You cannot delete the account you are signed in with. Ask another administrator, or remove it from the Firebase console.',
      );
    }

    const target = await getUserProfile(params.uid);
    if (!target) {
      return apiError(404, 'not-found', 'There is no account with that identifier.');
    }

    await deleteUserCompletely(params.uid);

    return NextResponse.json({ ok: true, uid: params.uid });
  },
);
