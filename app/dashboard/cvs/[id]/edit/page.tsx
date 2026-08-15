import type { Metadata } from 'next';
import { notFound } from 'next/navigation';

import { CVEditor } from '@/components/editor/CVEditor';
import type { EditorTemplateChoice } from '@/components/editor/DesignPanel';
import { requireViewer } from '@/lib/auth/guards';
import { findCV } from '@/lib/db/cvs';
import { TEMPLATES } from '@/lib/cv/template-registry';
import { privateMetadata } from '@/lib/seo/metadata';

export const metadata: Metadata = privateMetadata(
  'Edit CV',
  'Write, design and export your CV.',
);

/**
 * The editor route.
 *
 * `app/dashboard/layout.tsx` deliberately renders no chrome, so this page gets the whole
 * viewport — an editor competing with a sidebar and a top bar has nowhere to put a page
 * preview.
 *
 * Only the *metadata* of each template crosses to the client. Passing the registry itself
 * would pull all 56 template components into the browser bundle; they are server
 * components that render into the preview and have no business being shipped.
 */
const TEMPLATE_CHOICES: EditorTemplateChoice[] = TEMPLATES.map((template) => ({
  id: template.id,
  name: template.name,
  slug: template.slug,
  category: template.category,
  premium: template.premium,
  atsScore: template.atsScore,
  columns: template.columns,
  hasPhoto: template.hasPhoto,
  accentDefault: template.accentDefault,
  fonts: template.fonts,
}));

export default async function EditCVPage(props: { params: Promise<{ id: string }> }) {
  const { id } = await props.params;
  const viewer = await requireViewer(`/dashboard/cvs/${id}/edit`);

  const cv = await findCV(viewer.user.uid, id);
  if (!cv) notFound();

  return (
    <CVEditor
      document={cv}
      templates={TEMPLATE_CHOICES}
      permissions={{
        canUsePremiumTemplates: viewer.limits.premiumTemplates,
        canCustomise: viewer.limits.advancedCustomization,
        canShare: viewer.limits.shareLinks,
        canUseCustomSections: viewer.limits.customSections,
        planName: viewer.plan.name,
      }}
    />
  );
}
