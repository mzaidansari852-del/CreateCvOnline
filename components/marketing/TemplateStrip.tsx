import Link from 'next/link';

import { CVThumbnail } from '@/components/cv/CVThumbnail';
import { Badge } from '@/components/ui/feedback';
import { createDefaultCustomization, createSampleCV } from '@/lib/cv/defaults';
import { cn } from '@/lib/utils/cn';
import type { TemplateDefinition } from '@/types/cv';

/**
 * A grid of template previews.
 *
 * Shared by the homepage, the gallery, the SEO landing pages and every template detail
 * page's "related templates" block, so a design change to a template card lands in one
 * place. Server component — 56 live CV previews and zero client JavaScript.
 */
export function TemplateCard({
  template,
  width = 260,
  crop,
  className,
}: {
  template: TemplateDefinition;
  width?: number;
  crop?: number;
  className?: string;
}) {
  const cv = createSampleCV();
  const customization = createDefaultCustomization({
    templateId: template.id,
    accentColor: template.accentDefault,
  });

  return (
    <Link
      href={`/templates/${template.slug}`}
      className={cn(
        'group flex flex-col rounded-xl border border-ink-200 bg-white p-3 transition-all duration-200',
        'hover:-translate-y-1 hover:border-brand-300 hover:shadow-card-hover',
        'focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand-600',
        className,
      )}
    >
      <div className="relative overflow-hidden rounded-lg bg-ink-100">
        <CVThumbnail
          cv={cv}
          customization={customization}
          width={width}
          crop={crop}
          rounded={false}
          shadow={false}
          className="w-full"
        />
        <div
          aria-hidden
          className="pointer-events-none absolute inset-0 bg-gradient-to-t from-ink-950/55 via-transparent to-transparent opacity-0 transition-opacity duration-200 group-hover:opacity-100"
        />
        <span
          aria-hidden
          className="pointer-events-none absolute inset-x-0 bottom-0 translate-y-2 p-3 text-center text-[13px] font-semibold text-white opacity-0 transition-all duration-200 group-hover:translate-y-0 group-hover:opacity-100"
        >
          View template
        </span>
      </div>

      <div className="flex flex-1 items-start justify-between gap-2 px-1 pt-3">
        <div className="min-w-0">
          <h3 className="truncate text-sm font-semibold text-ink-950 group-hover:text-brand-700">
            {template.name}
          </h3>
          <p className="mt-0.5 text-xs text-ink-500 capitalize">
            {template.category === 'ats' ? 'ATS-friendly' : template.category} ·{' '}
            {template.columns === 1 ? 'one column' : 'two columns'}
          </p>
        </div>
        {template.premium ? (
          <Badge tone="accent">Pro</Badge>
        ) : (
          <Badge tone="success">Free</Badge>
        )}
      </div>
    </Link>
  );
}

export function TemplateGrid({
  templates,
  columns = 4,
  width = 260,
  className,
}: {
  templates: TemplateDefinition[];
  columns?: 3 | 4 | 5;
  width?: number;
  className?: string;
}) {
  const cols = {
    3: 'grid-cols-2 md:grid-cols-3',
    4: 'grid-cols-2 md:grid-cols-3 lg:grid-cols-4',
    5: 'grid-cols-2 md:grid-cols-3 lg:grid-cols-5',
  } as const;

  if (templates.length === 0) return null;

  return (
    <div className={cn('grid gap-4 sm:gap-5', cols[columns], className)}>
      {templates.map((template) => (
        <TemplateCard key={template.id} template={template} width={width} />
      ))}
    </div>
  );
}
