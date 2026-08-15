import type { Metadata } from 'next';
import Link from 'next/link';
import { cookies } from 'next/headers';

import { CVThumbnail } from '@/components/cv/CVThumbnail';
import { DashboardShell } from '@/components/dashboard/DashboardShell';
import { UpgradeCard } from '@/components/dashboard/UpgradeCard';
import { UseTemplateButton } from '@/components/dashboard/UseTemplateButton';
import { Badge } from '@/components/ui/feedback';
import { requireViewer } from '@/lib/auth/guards';
import { createDefaultCustomization } from '@/lib/cv/defaults';
import { sampleCvFor } from '@/lib/cv/samples';
import {
  templateDefaults,
  FREE_TEMPLATE_COUNT,
  TEMPLATE_CATEGORIES,
  TEMPLATE_COUNT,
  TEMPLATES,
} from '@/lib/cv/template-registry';
import { appCopy } from '@/lib/i18n/app-copy';
import { LOCALE_COOKIE, resolveLocale } from '@/lib/i18n/resolve';
import { privateMetadata } from '@/lib/seo/metadata';
import { cn } from '@/lib/utils/cn';
import type { TemplateDefinition } from '@/types/cv';

export const metadata: Metadata = privateMetadata(
  'Templates',
  `All ${TEMPLATE_COUNT} CV templates, ready to start a new CV from.`,
);

export default async function DashboardTemplatesPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const viewer = await requireViewer('/dashboard/templates');
  const query = await searchParams;
  const locale = resolveLocale({
    profileLocale: viewer.profile.locale,
    cookieLocale: (await cookies()).get(LOCALE_COOKIE)?.value,
  });
  const copy = appCopy(locale);

  const requested = typeof query.category === 'string' ? query.category : 'all';
  const category = TEMPLATE_CATEGORIES.some((entry) => entry.id === requested) ? requested : 'all';

  const templates =
    category === 'all' ? TEMPLATES : TEMPLATES.filter((template) => template.category === category);

  const canUsePremium = viewer.limits.premiumTemplates;

  const chips = [
    { id: 'all', label: copy.templates.allFilter, count: TEMPLATE_COUNT },
    ...TEMPLATE_CATEGORIES.map((entry) => ({
      id: entry.id as string,
      label: copy.templates.categoryLabel[entry.id],
      count: TEMPLATES.filter((template) => template.category === entry.id).length,
    })),
  ];

  const activeCategory = TEMPLATE_CATEGORIES.find((entry) => entry.id === category);

  return (
    <DashboardShell
      viewer={viewer}
      title={copy.nav.templates}
      description={
        canUsePremium
          ? copy.templates.allAvailable(TEMPLATE_COUNT)
          : copy.templates.freeSubset(FREE_TEMPLATE_COUNT, TEMPLATE_COUNT)
      }
    >
      <div className="flex flex-col gap-5">
        <nav
          aria-label={copy.templates.filterAria}
          className="scroll-thin -mx-1 flex gap-1.5 overflow-x-auto px-1 pb-1"
        >
          {chips.map((chip) => {
            const active = chip.id === category;
            return (
              <Link
                key={chip.id}
                href={
                  chip.id === 'all'
                    ? '/dashboard/templates'
                    : `/dashboard/templates?category=${chip.id}`
                }
                aria-current={active ? 'true' : undefined}
                scroll={false}
                className={cn(
                  'shrink-0 rounded-full border px-3 py-1.5 text-[13px] font-medium transition-colors',
                  active
                    ? 'border-brand-600 bg-brand-600 text-white'
                    : 'border-ink-200 bg-white text-ink-700 hover:border-ink-300 hover:bg-ink-50',
                )}
              >
                {chip.label}
                <span
                  className={cn('ml-1.5 text-[11px]', active ? 'text-white/75' : 'text-ink-400')}
                >
                  {chip.count}
                </span>
              </Link>
            );
          })}
        </nav>

        {/*
          Still English in every language: the blurb belongs to the registry, which is shared
          with the marketing site and holds one copy of it. Duplicating six paragraphs here to
          translate them would put the same prose in two places and guarantee they drift; the
          fix is a locale-aware registry, which is a change beyond this page.
        */}
        {activeCategory ? (
          <p className="max-w-3xl text-sm leading-relaxed text-ink-600">{activeCategory.blurb}</p>
        ) : null}

        <p className="text-xs text-ink-500" role="status">
          {copy.templates.showing(templates.length, TEMPLATE_COUNT)}
        </p>

        <ul className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 2xl:grid-cols-4">
          {templates.map((template: TemplateDefinition) => (
            <li
              key={template.id}
              className="flex flex-col rounded-xl border border-ink-200 bg-white p-3 shadow-card transition-shadow hover:shadow-card-hover"
            >
              <div className="overflow-hidden rounded-lg bg-ink-100">
                <CVThumbnail
                  cv={sampleCvFor(template.id)}
                  customization={createDefaultCustomization({
                    ...templateDefaults(template),
                  })}
                  width={220}
                  crop={1.15}
                  rounded={false}
                  shadow={false}
                  className="mx-auto"
                />
              </div>

              <div className="mt-3 flex items-start justify-between gap-2">
                <div className="min-w-0">
                  <h2 className="truncate text-sm font-semibold text-ink-950">{template.name}</h2>
                  <p className="mt-0.5 truncate text-xs text-ink-500">
                    {copy.templates.categoryLabel[template.category]} ·{' '}
                    {template.columns === 1 ? copy.templates.oneColumn : copy.templates.twoColumns}{' '}
                    · ATS {template.atsScore}/5
                  </p>
                </div>
                {template.premium ? (
                  <Badge tone="accent">{copy.common.pro}</Badge>
                ) : (
                  <Badge tone="success">{copy.common.free}</Badge>
                )}
              </div>

              <p className="mt-2 line-clamp-2 text-xs leading-relaxed text-ink-600">
                {template.tagline}
              </p>

              <div className="mt-3 flex items-center gap-2">
                <UseTemplateButton
                  templateId={template.id}
                  templateName={template.name}
                  premium={template.premium}
                  canUsePremium={canUsePremium}
                />
                <Link
                  href={`/templates/${template.slug}`}
                  className="shrink-0 rounded-lg px-2 py-1.5 text-[13px] font-semibold text-ink-600 transition-colors hover:bg-ink-100 hover:text-ink-900"
                >
                  {copy.templates.details}
                </Link>
              </div>
            </li>
          ))}
        </ul>

        <UpgradeCard plan={viewer.plan} />
      </div>
    </DashboardShell>
  );
}
