import { NextResponse } from 'next/server';
import { z } from 'zod';

import { authedRoute, readJson } from '@/lib/api/handler';
import { deleteCV, getCV, updateCV } from '@/lib/db/cvs';
import {
  assertCanUseTemplate,
  sanitizeCustomization,
  sanitizeData,
} from '@/lib/entitlements';
import { cvCustomizationSchema, cvDataSchema } from '@/types/cv';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

type Params = { id: string };

export const GET = authedRoute<Params>({ scope: 'cv-read' }, async ({ user, params }) => {
  const cv = await getCV(user.uid, params.id);
  return NextResponse.json({ cv });
});

const patchSchema = z
  .object({
    title: z.string().trim().max(120).optional(),
    data: cvDataSchema.optional(),
    customization: cvCustomizationSchema.optional(),
  })
  .refine(
    (value) => value.title !== undefined || value.data !== undefined || value.customization !== undefined,
    { message: 'Nothing to update.' },
  );

/**
 * The autosave endpoint.
 *
 * Generous rate limit because the editor debounces to roughly one write every 1.2s while
 * someone is actively typing; anything tighter would drop real edits.
 */
export const PATCH = authedRoute<Params>(
  { scope: 'cv-update', rateLimit: { max: 180, windowSeconds: 60 } },
  async ({ request, profile, params }) => {
    const body = await readJson(request, patchSchema);

    // Confirm the document exists and belongs to the caller before doing any work.
    await getCV(profile.uid, params.id);

    if (body.customization) {
      assertCanUseTemplate(profile, body.customization.templateId);
    }

    const cv = await updateCV(profile.uid, params.id, {
      title: body.title,
      data: body.data ? sanitizeData(profile, body.data) : undefined,
      customization: body.customization
        ? sanitizeCustomization(profile, body.customization)
        : undefined,
    });

    return NextResponse.json({ cv });
  },
);

export const DELETE = authedRoute<Params>(
  { scope: 'cv-delete', rateLimit: { max: 30, windowSeconds: 60 } },
  async ({ user, params }) => {
    await deleteCV(user.uid, params.id);
    return NextResponse.json({ ok: true });
  },
);
