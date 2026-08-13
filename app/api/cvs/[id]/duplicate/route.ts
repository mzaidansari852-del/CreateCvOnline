import { NextResponse } from 'next/server';

import { authedRoute } from '@/lib/api/handler';
import { duplicateCV } from '@/lib/db/cvs';
import { assertCanCreateCV } from '@/lib/entitlements';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

type Params = { id: string };

/** A duplicate counts against the plan's CV quota, exactly like a new CV. */
export const POST = authedRoute<Params>(
  { scope: 'cv-duplicate', rateLimit: { max: 20, windowSeconds: 60 } },
  async ({ profile, params }) => {
    await assertCanCreateCV(profile);
    const cv = await duplicateCV(profile.uid, params.id);
    return NextResponse.json({ cv }, { status: 201 });
  },
);
