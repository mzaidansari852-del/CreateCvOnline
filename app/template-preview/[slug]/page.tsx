import { notFound } from 'next/navigation';
import type { Metadata } from 'next';

import { CVDocument } from '@/components/cv/CVDocument';
import { PAPER } from '@/lib/cv/format';
import { TEMPLATES, getTemplateBySlug } from '@/lib/cv/template-registry';
import { createDefaultCustomization } from '@/lib/cv/defaults';
import { sampleCvFor } from '@/lib/cv/samples';
import { privateMetadata } from '@/lib/seo/metadata';

/**
 * The source `scripts/generate-previews.mjs` screenshots.
 *
 * This route exists because the obvious approach eats itself. The generator used to
 * screenshot the live preview on `/templates/[slug]`, which was appealingly honest — the
 * picture was literally the page. Then those pages started showing the generated image
 * instead of the live preview, and the generator could no longer find a CV to photograph.
 * Regenerating after a template change became impossible, which is the one moment it is
 * needed.
 *
 * So the render target is its own page: one CV, at exact page pixels, no chrome, cropped
 * to the first sheet. That also removes the guesswork the generator previously needed —
 * finding the visible copy of a preview rendered twice, and clipping a `min-height` box
 * that grows past one page. Here the element *is* the shot.
 *
 * It is prerendered like any other template page, excluded from the sitemap because
 * nothing links to it, and blocked in `robots.txt`. Being reachable is harmless: it shows
 * the same sample CV as the public gallery.
 */

export const metadata: Metadata = privateMetadata(
  'Template preview',
  'Internal render target for generating template preview images.',
);

export function generateStaticParams() {
  return TEMPLATES.map((template) => ({ slug: template.slug }));
}

export default async function TemplatePreviewPage(props: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await props.params;
  const template = getTemplateBySlug(slug);
  if (!template) notFound();

  // The CV this template is for, not the one every template used to show.
  const cv = sampleCvFor(template.id);
  const customization = createDefaultCustomization({
    templateId: template.id,
    accentColor: template.accentDefault,
  });
  const paper = PAPER[customization.paperSize];

  return (
    <div
      // The sample CV runs past one sheet on most templates. Cropping here rather than in
      // the screenshot keeps the generator free of layout arithmetic.
      style={{
        width: paper.width,
        height: paper.height,
        overflow: 'hidden',
        position: 'relative',
      }}
      data-template-preview={template.slug}
    >
      <CVDocument cv={cv} customization={customization} />
    </div>
  );
}
