import type { CSSProperties } from 'react';

import { fontStack, PAPER } from '@/lib/cv/format';
import { getTemplate } from '@/lib/cv/template-registry';
import { cn } from '@/lib/utils/cn';
import type { CVCustomization, CVData } from '@/types/cv';

/**
 * Applies the document-level customization and renders the selected template.
 *
 * Templates never set page geometry, base font size or line height themselves — those
 * live here as CSS custom properties consumed by `.cv-page` in `globals.css`. That is
 * what lets a user switch templates and keep every customization intact.
 */
export function CVDocument({
  cv,
  customization,
  className,
  style,
  /** Rendered inside the page box (used by the preview to overlay page-break guides). */
  overlay,
}: {
  cv: CVData;
  customization: CVCustomization;
  className?: string;
  style?: CSSProperties;
  overlay?: React.ReactNode;
}) {
  const template = getTemplate(customization.templateId);
  const Template = template.component;
  const paper = PAPER[customization.paperSize];
  const background = template.pageBackground?.(customization, cv);

  const cssVars = {
    '--cv-page-width': `${paper.width}px`,
    '--cv-page-height': `${paper.height}px`,
    '--cv-print-size': paper.cssSize,
    '--cv-font-body': fontStack(customization.bodyFont),
    '--cv-font-heading': fontStack(customization.headingFont),
    '--cv-font-size': String(customization.fontSize),
    '--cv-line-height': String(customization.lineHeight),
    '--cv-accent': customization.accentColor,
    '--cv-secondary': customization.secondaryColor,
  } as CSSProperties;

  return (
    <div
      className={cn('cv-page', className)}
      style={{
        ...cssVars,
        color: customization.textColor,
        background: background ?? '#ffffff',
        ...style,
      }}
      data-template={template.id}
    >
      <Template cv={cv} customization={customization} />
      {overlay}
    </div>
  );
}

/** The `background` value the print route must copy onto `<body>` for multi-page fidelity. */
export function documentPageBackground(
  customization: CVCustomization,
  cv: CVData,
): string | undefined {
  return getTemplate(customization.templateId).pageBackground?.(customization, cv);
}
