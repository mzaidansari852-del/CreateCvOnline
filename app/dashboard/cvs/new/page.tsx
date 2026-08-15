import type { Metadata } from 'next';
import { cookies } from 'next/headers';

import { CVThumbnail } from '@/components/cv/CVThumbnail';
import { DashboardShell } from '@/components/dashboard/DashboardShell';
import { NewCVFlow } from '@/components/dashboard/NewCVFlow';
import type { TemplateOption } from '@/components/dashboard/TemplatePicker';
import { ButtonLink } from '@/components/ui/button';
import { Alert } from '@/components/ui/feedback';
import { requireViewer } from '@/lib/auth/guards';
import { createDefaultCustomization, createMinimalCV } from '@/lib/cv/defaults';
import {
  findTemplate,
  templateDefaults,
  DEFAULT_TEMPLATE_ID,
  TEMPLATE_CATEGORIES,
  TEMPLATES,
} from '@/lib/cv/template-registry';
import { usageSnapshot } from '@/lib/entitlements';
import { appCopy } from '@/lib/i18n/app-copy';
import { LOCALE_COOKIE, resolveLocale } from '@/lib/i18n/resolve';
import { privateMetadata } from '@/lib/seo/metadata';

export const metadata: Metadata = privateMetadata(
  'New CV',
  'Choose a starting point and a template, then start writing.',
);

export default async function NewCVPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const viewer = await requireViewer('/dashboard/cvs/new');
  const query = await searchParams;
  const usage = await usageSnapshot(viewer.profile);
  const locale = resolveLocale({
    profileLocale: viewer.profile.locale,
    cookieLocale: (await cookies()).get(LOCALE_COOKIE)?.value,
  });
  const copy = appCopy(locale);

  const requestedId = typeof query.template === 'string' ? query.template : undefined;
  const requested = requestedId ? findTemplate(requestedId) : undefined;
  const requestedIsLocked = Boolean(requested?.premium) && !viewer.limits.premiumTemplates;
  const initialTemplateId = requested && !requestedIsLocked ? requested.id : DEFAULT_TEMPLATE_ID;

  // A short, realistic document: the picker is judged on layout, and a 140px preview of
  // a three-page CV is a grey smudge.
  const previewCV = createMinimalCV();

  const templates: TemplateOption[] = TEMPLATES.map((template) => ({
    id: template.id,
    name: template.name,
    category: template.category,
    categoryLabel: copy.templates.categoryLabel[template.category],
    premium: template.premium,
    atsScore: template.atsScore,
    columns: template.columns,
    tagline: template.tagline,
    search: [
      template.name,
      template.tagline,
      // Both the id and the label the user can actually see: a French visitor types
      // "créatif", an English one types "creative", and the same haystack answers both.
      template.category,
      copy.templates.categoryLabel[template.category],
      template.premium ? 'pro premium' : 'free',
      ...template.keywords,
    ]
      .join(' ')
      .toLowerCase(),
    preview: (
      <CVThumbnail
        cv={previewCV}
        customization={createDefaultCustomization({
          ...templateDefaults(template),
        })}
        width={140}
        rounded={false}
        shadow={false}
      />
    ),
  }));

  return (
    <DashboardShell
      viewer={viewer}
      title={copy.cvs.createTitle}
      description={copy.cvs.createLede}
      actions={
        <ButtonLink href="/dashboard/cvs" variant="outline" size="sm">
          {copy.cvs.backToMyCvs}
        </ButtonLink>
      }
    >
      <div className="flex flex-col gap-5">
        {requestedIsLocked && requested ? (
          <Alert
            tone="info"
            title={copy.cvs.premiumTemplateTitle(requested.name)}
            action={
              <ButtonLink href="/pricing" size="sm">
                {copy.dashboard.seePlans}
              </ButtonLink>
            }
          >
            {copy.cvs.premiumTemplateBody(TEMPLATES.length)}
          </Alert>
        ) : null}

        {requestedId && !requested ? (
          <Alert tone="warning" title={copy.cvs.unknownTemplateTitle}>
            {copy.cvs.unknownTemplateBody}
          </Alert>
        ) : null}

        <NewCVFlow
          templates={templates}
          categories={TEMPLATE_CATEGORIES.map((category) => ({
            id: category.id,
            label: copy.templates.categoryLabel[category.id],
          }))}
          canUsePremium={viewer.limits.premiumTemplates}
          initialTemplateId={initialTemplateId}
          templateFromQuery={Boolean(requested && !requestedIsLocked)}
          cvsUsed={usage.cvs.used}
          cvLimit={usage.cvs.limit}
        />
      </div>
    </DashboardShell>
  );
}
