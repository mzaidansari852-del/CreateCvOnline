import { NextResponse } from 'next/server';
import { z } from 'zod';

import { authedRoute, readJson } from '@/lib/api/handler';
import { createCV, listCVs } from '@/lib/db/cvs';
import { assertCanCreateCV, assertCanUseTemplate, sanitizeCustomization } from '@/lib/entitlements';
import { createDefaultCustomization, createSampleCV } from '@/lib/cv/defaults';
import { DEFAULT_TEMPLATE_ID, findTemplate } from '@/lib/cv/template-registry';
import { setCvLanguage } from '@/lib/i18n/cv-labels';
import { cvDataSchema } from '@/types/cv';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export const GET = authedRoute({ scope: 'cvs-list' }, async ({ user }) => {
  const cvs = await listCVs(user.uid);
  return NextResponse.json({ cvs });
});

const createSchema = z.object({
  title: z.string().trim().max(120).optional(),
  templateId: z.string().trim().max(64).optional(),
  /** `sample` pre-fills a worked example; `blank` starts empty. */
  starter: z.enum(['blank', 'sample']).default('blank'),
  data: cvDataSchema.optional(),
});

export const POST = authedRoute(
  { scope: 'cvs-create', rateLimit: { max: 20, windowSeconds: 60 } },
  async ({ request, profile }) => {
    const body = await readJson(request, createSchema);

    // Order matters: quota first (cheapest, most common rejection), then template access.
    await assertCanCreateCV(profile);

    const templateId = body.templateId ?? DEFAULT_TEMPLATE_ID;
    assertCanUseTemplate(profile, templateId);

    const template = findTemplate(templateId);
    const customization = sanitizeCustomization(
      profile,
      createDefaultCustomization({
        templateId,
        accentColor: template?.accentDefault ?? '#1f3af5',
      }),
    );

    /*
     * A new CV is written in the language the account is using, so a French user gets
     * "Expérience professionnelle" rather than "Work Experience" — in the editor and,
     * more to the point, in the PDF they send to an employer. Taken from the profile
     * rather than from the request: the client should not be able to choose what language
     * somebody else's document is created in.
     *
     * The worked example is a separate case. It is written in English, so it is retitled
     * rather than merely stamped — otherwise the headings and the `language` field would
     * disagree with each other from the moment the document exists.
     */
    const language = profile.locale;
    const sample = body.starter === 'sample' ? setCvLanguage(createSampleCV(), language) : undefined;

    const cv = await createCV(profile.uid, {
      title: body.title,
      templateId,
      data: body.data ?? sample,
      language,
      customization,
    });

    return NextResponse.json({ cv }, { status: 201 });
  },
);
