import { NextResponse } from 'next/server';
import { z } from 'zod';

import { authedRoute, readJson } from '@/lib/api/handler';
import { setCVSharing } from '@/lib/db/cvs';
import { assertCanShare } from '@/lib/entitlements';
import { absoluteUrl } from '@/lib/site';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

type Params = { id: string };

const bodySchema = z.object({ isPublic: z.boolean() });

export const POST = authedRoute<Params>(
  { scope: 'cv-share', rateLimit: { max: 30, windowSeconds: 60 } },
  async ({ request, profile, params }) => {
    const { isPublic } = await readJson(request, bodySchema);

    // Turning sharing *off* must always be possible, even after a downgrade — otherwise a
    // lapsed subscription would leave a CV published with no way to unpublish it.
    if (isPublic) assertCanShare(profile);

    const shareId = await setCVSharing(profile.uid, params.id, isPublic);

    return NextResponse.json({
      isPublic,
      shareId,
      shareUrl: shareId ? absoluteUrl(`/cv/${shareId}`) : null,
    });
  },
);
