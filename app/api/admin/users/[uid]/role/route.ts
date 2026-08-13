import { NextResponse } from 'next/server';
import { z } from 'zod';

import { apiError, authedRoute, readJson } from '@/lib/api/handler';
import { getUserProfile, setUserRole } from '@/lib/db/users';
import { userRoleSchema } from '@/types/user';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

type Params = { uid: string };

const bodySchema = z.object({ role: userRoleSchema });

/**
 * Grants or revokes administrator access.
 *
 * `setUserRole` writes the Firebase custom claim — the authoritative source — mirrors it
 * onto the profile document for display, and revokes the target's refresh tokens so the
 * change lands on their very next request rather than whenever their token happens to
 * expire.
 *
 * An administrator may not remove their own claim. Doing so is the one mistake that
 * cannot be undone from inside the product: with no admin left, the console is
 * unreachable and the only way back is a service-account script on a trusted machine.
 * Another administrator can always demote them, which keeps at least one operator.
 */
export const POST = authedRoute<Params>(
  {
    scope: 'admin-user-role',
    requireAdmin: true,
    rateLimit: { max: 20, windowSeconds: 60 },
  },
  async ({ request, user, params }) => {
    const { role } = await readJson(request, bodySchema);

    if (params.uid === user.uid && role !== 'admin') {
      return apiError(
        409,
        'self-lockout',
        'You cannot remove your own administrator access — that would lock you out of the console. Ask another administrator to do it.',
      );
    }

    const target = await getUserProfile(params.uid);
    if (!target) {
      return apiError(404, 'not-found', 'There is no account with that identifier.');
    }

    await setUserRole(params.uid, role);

    return NextResponse.json({ ok: true, uid: params.uid, role });
  },
);
