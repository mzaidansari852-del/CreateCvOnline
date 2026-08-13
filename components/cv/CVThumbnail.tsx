import { CVDocument } from './CVDocument';
import { demoteHeadings } from './decorative';
import { PAPER } from '@/lib/cv/format';
import { getTemplate } from '@/lib/cv/template-registry';
import { cn } from '@/lib/utils/cn';
import type { CVCustomization, CVData } from '@/types/cv';

/**
 * A CV rendered small enough to sit in a card.
 *
 * The document is always laid out at true page pixels and scaled with a CSS transform,
 * never re-flowed at a smaller width. That is what makes a thumbnail an honest preview:
 * what you see in the gallery is the same layout you get in the PDF, just smaller.
 *
 * A preview is a *picture of a document*, not a document, so its headings are demoted to
 * plain elements and the whole thing is exposed to assistive technology as a single
 * labelled image. Without that, a gallery of twenty templates would put twenty `<h1>`
 * elements on the page and drown out its real heading.
 *
 * Server component: 56 live previews, zero client JavaScript.
 */
async function renderDecorative(cv: CVData, customization: CVCustomization): Promise<string> {
  // Next.js forbids a static import of `react-dom/server` from the App Router; here it is
  // only ever reached on the server, at render time.
  const { renderToStaticMarkup } = await import('react-dom/server');
  return demoteHeadings(renderToStaticMarkup(<CVDocument cv={cv} customization={customization} />));
}

export async function CVThumbnail({
  cv,
  customization,
  width = 260,
  className,
  rounded = true,
  shadow = true,
  /** Crops to this aspect ratio instead of showing the whole page. */
  crop,
  label,
}: {
  cv: CVData;
  customization: CVCustomization;
  width?: number;
  className?: string;
  rounded?: boolean;
  shadow?: boolean;
  crop?: number;
  label?: string;
}) {
  const paper = PAPER[customization.paperSize];
  const scale = width / paper.width;
  const height = crop ? Math.round(width / crop) : Math.round(paper.height * scale);
  const markup = await renderDecorative(cv, customization);
  const templateName = getTemplate(customization.templateId).name;

  return (
    <div
      className={cn(
        'relative overflow-hidden bg-white',
        rounded && 'rounded-lg',
        shadow && 'shadow-page',
        className,
      )}
      style={{ width, height }}
      role="img"
      aria-label={label ?? `Preview of the ${templateName} CV template`}
    >
      <div
        style={{
          transform: `scale(${scale})`,
          transformOrigin: 'top left',
          width: paper.width,
          height: paper.height,
        }}
        dangerouslySetInnerHTML={{ __html: markup }}
      />
    </div>
  );
}

/** Full-page preview used on template detail pages, scaled to the container width. */
export async function CVPagePreview({
  cv,
  customization,
  maxWidth = 620,
  className,
  label,
}: {
  cv: CVData;
  customization: CVCustomization;
  maxWidth?: number;
  className?: string;
  label?: string;
}) {
  const paper = PAPER[customization.paperSize];
  const scale = maxWidth / paper.width;
  const markup = await renderDecorative(cv, customization);
  const templateName = getTemplate(customization.templateId).name;

  return (
    <div
      className={cn('relative overflow-hidden rounded-xl bg-white shadow-page', className)}
      style={{ width: maxWidth, height: Math.round(paper.height * scale) }}
      role="img"
      aria-label={label ?? `Full-page preview of the ${templateName} CV template`}
    >
      <div
        style={{
          transform: `scale(${scale})`,
          transformOrigin: 'top left',
          width: paper.width,
          height: paper.height,
        }}
        dangerouslySetInnerHTML={{ __html: markup }}
      />
    </div>
  );
}
