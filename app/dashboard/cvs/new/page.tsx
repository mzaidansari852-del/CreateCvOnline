import type { Metadata } from 'next';

import { CVThumbnail } from '@/components/cv/CVThumbnail';
import { DashboardShell } from '@/components/dashboard/DashboardShell';
import { NewCVFlow } from '@/components/dashboard/NewCVFlow';
import type { TemplateOption } from '@/components/dashboard/TemplatePicker';
import { ButtonLink } from '@/components/ui/button';
import { Alert } from '@/components/ui/feedback';
import { requireViewer } from '@/lib/auth/guards';
import { createDefaultCustomization, createMinimalCV } from '@/lib/cv/defaults';
import {
  DEFAULT_TEMPLATE_ID,
  findTemplate,
  TEMPLATES,
  TEMPLATE_CATEGORIES,
} from '@/lib/cv/template-registry';
import { usageSnapshot } from '@/lib/entitlements';
import { privateMetadata } from '@/lib/seo/metadata';

export const metadata: Metadata = privateMetadata(
  'New CV',
  'Choose a starting point and a template, then start writing.',
);

const CATEGORY_LABELS = new Map(
  TEMPLATE_CATEGORIES.map((category) => [category.id as string, category.label]),
);

export default async function NewCVPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const viewer = await requireViewer('/dashboard/cvs/new');
  const query = await searchParams;
  const usage = await usageSnapshot(viewer.profile);

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
    categoryLabel: CATEGORY_LABELS.get(template.category) ?? template.category,
    premium: template.premium,
    atsScore: template.atsScore,
    columns: template.columns,
    tagline: template.tagline,
    search: [
      template.name,
      template.tagline,
      template.category,
      CATEGORY_LABELS.get(template.category) ?? '',
      template.premium ? 'pro premium' : 'free',
      ...template.keywords,
    ]
      .join(' ')
      .toLowerCase(),
    preview: (
      <CVThumbnail
        cv={previewCV}
        customization={createDefaultCustomization({
          templateId: template.id,
          accentColor: template.accentDefault,
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
      title="Create a new CV"
      description="Pick how you want to start and which design to use. Nothing is saved until you press Create."
      actions={
        <ButtonLink href="/dashboard/cvs" variant="outline" size="sm">
          Back to my CVs
        </ButtonLink>
      }
    >
      <div className="flex flex-col gap-5">
        {requestedIsLocked && requested ? (
          <Alert
            tone="info"
            title={`“${requested.name}” is a Pro template`}
            action={
              <ButtonLink href="/pricing" size="sm">
                See plans
              </ButtonLink>
            }
          >
            We have selected a free template instead. Upgrade to unlock all{' '}
            {TEMPLATES.length} designs, or pick any of the free ones below.
          </Alert>
        ) : null}

        {requestedId && !requested ? (
          <Alert tone="warning" title="That template does not exist">
            The link you followed points at a template we no longer publish. Pick another
            one below.
          </Alert>
        ) : null}

        <NewCVFlow
          templates={templates}
          categories={TEMPLATE_CATEGORIES.map((category) => ({
            id: category.id,
            label: category.label,
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
