import Image from 'next/image';

import { PREVIEW_SLUGS } from '@/lib/cv/previews';
import { cn } from '@/lib/utils/cn';
import type { Locale } from '@/lib/i18n/locales';
import type { TemplateMeta } from '@/types/cv';

/**
 * A template preview as a real image.
 *
 * This is the marketing-side counterpart to `CVThumbnail`, which renders a live CV as DOM.
 * Both are needed and they are not interchangeable:
 *
 *   `CVThumbnail`   — the user's own CV, which has no pre-rendered file. Must stay live.
 *   `TemplateImage` — one of the 56 fixed templates showing the sample CV, which does.
 *
 * The distinction matters for three reasons. An image crawler can index an `<img>` with an
 * `alt`; it cannot index a `<div>` of styled text, which is why the site was absent from
 * Google Images despite being a gallery of pictures of documents. A gallery of live
 * previews also ships one full CV document per card — a template page carried eight of
 * them, about 650KB of markup — where a WebP is 37KB. And an `<img>` is one element to
 * assistive technology rather than a tree of hundreds that has to be hidden behind
 * `role="img"` and heading demotion to avoid drowning the page.
 *
 * Falls back to rendering nothing rather than a broken image when a preview is missing,
 * so a template added without regenerating the assets degrades quietly. `npm run previews`
 * regenerates them; a test asserts the set stays complete.
 */

/** A4 at the ratio the previews are generated to. */
const PAGE_RATIO = 1123 / 794;

export function hasPreview(slug: string): boolean {
  return PREVIEW_SLUGS.includes(slug);
}

/**
 * Where a template's preview image lives, per language.
 *
 * The French set is generated from the same route with `?lang=fr`, into a `fr/`
 * subdirectory, so the two never collide and either can be regenerated alone. The English
 * path is unchanged, which matters: it is the one in the sitemap's image entries and in
 * every `og:image` already crawled.
 */
export function previewSrc(
  slug: string,
  variant: 'card' | 'full' = 'card',
  locale: Locale = 'en',
): string {
  const suffix = variant === 'card' ? '-card' : '';
  return locale === 'en' ? `/previews/${slug}${suffix}.webp` : `/previews/fr/${slug}${suffix}.webp`;
}

export function TemplateImage({
  template,
  width,
  variant = 'card',
  priority = false,
  className,
  sizes,
  locale = 'en',
}: {
  template: Pick<TemplateMeta, 'slug' | 'name' | 'category'>;
  width: number;
  /** `card` is the 520px grid asset; `full` the 1000px detail asset. */
  variant?: 'card' | 'full';
  /** Set on the one image above the fold; never on a grid. */
  priority?: boolean;
  className?: string;
  sizes?: string;
  locale?: Locale;
}) {
  if (!hasPreview(template.slug)) return null;

  const src = previewSrc(template.slug, variant, locale);
  const height = Math.round(width * PAGE_RATIO);

  return (
    <Image
      src={src}
      width={width}
      height={height}
      sizes={sizes}
      // `priority` on more than the hero costs more than it saves: every preload competes
      // with the others and with the font stylesheet.
      priority={priority}
      loading={priority ? undefined : 'lazy'}
      /*
       * The alt text is what Google Images matches against, and it is the only description
       * a screen-reader user gets. It names the template and says what the picture is,
       * rather than repeating the filename or the word "image".
       */
      alt={
        locale === 'fr'
          ? `Aperçu du modèle de CV ${template.name} — une mise en page ${template.category}`
          : `${template.name} CV template preview — a ${template.category} résumé layout`
      }
      className={cn('block h-auto w-full bg-white', className)}
    />
  );
}
