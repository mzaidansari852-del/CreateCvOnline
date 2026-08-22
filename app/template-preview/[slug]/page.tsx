import { notFound } from 'next/navigation';
import type { Metadata } from 'next';

import { CVDocument } from '@/components/cv/CVDocument';
import { PAPER } from '@/lib/cv/format';
import { getTemplateBySlug, templateDefaults, TEMPLATES } from '@/lib/cv/template-registry';
import { createDefaultCustomization } from '@/lib/cv/defaults';
import { sampleCvFor } from '@/lib/cv/samples';
import { localiseCv } from '@/lib/i18n/cv-labels';
import { DEFAULT_LOCALE, type Locale } from '@/lib/i18n/locales';
import { parseLocale } from '@/lib/i18n/resolve';
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
  searchParams: Promise<{ lang?: string }>;
}) {
  const { slug } = await props.params;
  const { lang } = await props.searchParams;
  const template = getTemplateBySlug(slug);
  if (!template) notFound();

  /*
   * `?lang=fr` renders the same document with French section headings.
   *
   * This route exists only to be screenshotted, and the screenshots are what the gallery
   * shows. Without this the French pages display sixty-one pictures of a CV headed
   * `WORK EXPERIENCE` — the copy around them can be as French as you like and the product
   * still looks English, because the picture is the product.
   *
   * Validated against `LOCALES` rather than a hardcoded pair. It read
   * `lang === 'fr' || lang === 'de'`, so adding Dutch did not extend it — `?lang=nl` fell
   * through to English and the generator would have written 122 files under
   * `public/previews/nl/` containing English documents. Nothing would have failed: the
   * script would report success, the Dutch gallery would fill with correct-looking
   * screenshots, and the headings inside them would be wrong. A list that must be edited in
   * two places to add a language is a list that will be edited in one.
   */
  const locale: Locale = parseLocale(lang) ?? DEFAULT_LOCALE;
  const cv = localiseCv(sampleCvFor(template.id), locale);
  const customization = createDefaultCustomization({
    ...templateDefaults(template),
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
