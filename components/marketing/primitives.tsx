import Link from 'next/link';
import type { ReactNode } from 'react';

import { Accordion } from '@/components/ui/overlays';
import { ButtonLink } from '@/components/ui/button';
import { JsonLd } from '@/components/seo/JsonLd';
import { breadcrumbSchema, faqSchema } from '@/lib/seo/schema';
import { cn } from '@/lib/utils/cn';

/**
 * Building blocks for the public site.
 *
 * Every marketing and SEO landing page is assembled from these, which is what keeps
 * ninety-odd pages looking like one product rather than ninety separate templates — and
 * means a spacing or heading-hierarchy fix lands everywhere at once.
 */

export function Section({
  children,
  className,
  id,
  tone = 'white',
  size = 'md',
}: {
  children: ReactNode;
  className?: string;
  id?: string;
  tone?: 'white' | 'muted' | 'ink' | 'brand';
  size?: 'sm' | 'md' | 'lg';
}) {
  const tones = {
    white: 'bg-white',
    muted: 'bg-ink-50',
    ink: 'bg-ink-950 text-ink-100',
    brand: 'bg-brand-950 text-brand-50',
  } as const;

  const sizes = { sm: 'py-12 sm:py-16', md: 'py-16 sm:py-24', lg: 'py-20 sm:py-32' } as const;

  return (
    <section id={id} className={cn(tones[tone], sizes[size], className)}>
      <div className="container-page">{children}</div>
    </section>
  );
}

export function Eyebrow({ children, className }: { children: ReactNode; className?: string }) {
  return (
    <p
      className={cn(
        'text-xs font-bold tracking-[0.14em] text-brand-700 uppercase',
        className,
      )}
    >
      {children}
    </p>
  );
}

export function SectionHeading({
  eyebrow,
  title,
  description,
  align = 'center',
  as: Tag = 'h2',
  className,
}: {
  eyebrow?: string;
  title: ReactNode;
  description?: ReactNode;
  align?: 'center' | 'left';
  as?: 'h1' | 'h2' | 'h3';
  className?: string;
}) {
  return (
    <div
      className={cn(
        'flex flex-col gap-3',
        align === 'center' ? 'mx-auto max-w-3xl text-center' : 'max-w-3xl',
        className,
      )}
    >
      {eyebrow ? <Eyebrow>{eyebrow}</Eyebrow> : null}
      <Tag
        className={cn(
          'font-extrabold tracking-tight text-balance',
          Tag === 'h1' ? 'text-4xl sm:text-5xl lg:text-[3.4rem] lg:leading-[1.05]' : 'text-3xl sm:text-4xl',
        )}
      >
        {title}
      </Tag>
      {description ? (
        <div className="text-base leading-relaxed text-pretty text-ink-600 sm:text-lg">
          {description}
        </div>
      ) : null}
    </div>
  );
}

export function Prose({ children, className }: { children: ReactNode; className?: string }) {
  return (
    <div
      className={cn(
        'max-w-3xl text-[15px] leading-[1.75] text-ink-700',
        '[&_h2]:mt-10 [&_h2]:mb-3 [&_h2]:text-2xl [&_h2]:font-bold [&_h2]:text-ink-950',
        '[&_h3]:mt-8 [&_h3]:mb-2 [&_h3]:text-lg [&_h3]:font-bold [&_h3]:text-ink-950',
        '[&_p]:mb-4',
        '[&_ul]:mb-5 [&_ul]:flex [&_ul]:flex-col [&_ul]:gap-2 [&_ul]:pl-5',
        '[&_ol]:mb-5 [&_ol]:flex [&_ol]:list-decimal [&_ol]:flex-col [&_ol]:gap-2 [&_ol]:pl-5',
        '[&_li]:marker:text-brand-500',
        '[&_ul>li]:list-disc',
        '[&_a]:font-medium [&_a]:text-brand-700 [&_a]:underline [&_a]:underline-offset-2 hover:[&_a]:text-brand-800',
        '[&_strong]:font-semibold [&_strong]:text-ink-950',
        '[&_blockquote]:my-6 [&_blockquote]:border-l-3 [&_blockquote]:border-brand-300 [&_blockquote]:pl-4 [&_blockquote]:text-ink-600 [&_blockquote]:italic',
        className,
      )}
    >
      {children}
    </div>
  );
}

export function FeatureGrid({
  items,
  columns = 3,
}: {
  items: { title: string; description: string; icon?: ReactNode }[];
  columns?: 2 | 3 | 4;
}) {
  const cols = {
    2: 'sm:grid-cols-2',
    3: 'sm:grid-cols-2 lg:grid-cols-3',
    4: 'sm:grid-cols-2 lg:grid-cols-4',
  } as const;

  return (
    <div className={cn('grid gap-6', cols[columns])}>
      {items.map((item) => (
        <div
          key={item.title}
          className="rounded-xl border border-ink-200 bg-white p-5 transition-shadow hover:shadow-card"
        >
          {item.icon ? (
            <div className="mb-3 grid size-10 place-items-center rounded-lg bg-brand-50 text-brand-600">
              {item.icon}
            </div>
          ) : null}
          <h3 className="text-base font-semibold text-ink-950">{item.title}</h3>
          <p className="mt-1.5 text-sm leading-relaxed text-ink-600">{item.description}</p>
        </div>
      ))}
    </div>
  );
}

export function StepList({
  steps,
}: {
  steps: { title: string; description: string }[];
}) {
  return (
    <ol className="grid gap-8 sm:grid-cols-2 lg:grid-cols-4">
      {steps.map((step, index) => (
        <li key={step.title} className="relative">
          <div className="mb-3 flex size-9 items-center justify-center rounded-full bg-brand-600 text-sm font-bold text-white">
            {index + 1}
          </div>
          <h3 className="text-base font-semibold text-ink-950">{step.title}</h3>
          <p className="mt-1.5 text-sm leading-relaxed text-ink-600">{step.description}</p>
        </li>
      ))}
    </ol>
  );
}

export interface FaqEntry {
  question: string;
  answer: string;
}

/** FAQ block that renders the accordion *and* the matching FAQPage structured data. */
export function FaqSection({
  entries,
  title = 'Frequently asked questions',
  description,
  id = 'faq',
  emitSchema = true,
}: {
  entries: FaqEntry[];
  title?: string;
  description?: string;
  id?: string;
  emitSchema?: boolean;
}) {
  if (entries.length === 0) return null;
  return (
    <>
      <div id={id} className="mx-auto max-w-3xl scroll-mt-28">
        <SectionHeading title={title} description={description} />
        <Accordion
          className="mt-8"
          defaultOpenIndex={0}
          items={entries.map((entry) => ({ question: entry.question, answer: entry.answer }))}
        />
      </div>
      {emitSchema ? <JsonLd nodes={[faqSchema(entries)]} /> : null}
    </>
  );
}

/** Visible breadcrumb trail plus the matching BreadcrumbList structured data. */
export function Breadcrumbs({ items }: { items: { name: string; path: string }[] }) {
  if (items.length === 0) return null;
  return (
    <>
      <nav aria-label="Breadcrumb" className="mb-6">
        <ol className="flex flex-wrap items-center gap-1.5 text-[13px] text-ink-500">
          {items.map((item, index) => {
            const isLast = index === items.length - 1;
            return (
              <li key={item.path} className="flex items-center gap-1.5">
                {isLast ? (
                  <span aria-current="page" className="font-medium text-ink-700">
                    {item.name}
                  </span>
                ) : (
                  <Link href={item.path} className="transition-colors hover:text-brand-700">
                    {item.name}
                  </Link>
                )}
                {!isLast ? (
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" aria-hidden className="text-ink-300">
                    <path d="m9 6 6 6-6 6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                ) : null}
              </li>
            );
          })}
        </ol>
      </nav>
      <JsonLd nodes={[breadcrumbSchema(items)]} />
    </>
  );
}

export function CtaBanner({
  title,
  description,
  primaryHref = '/register',
  primaryLabel = 'Create your CV — free',
  secondaryHref,
  secondaryLabel,
  note,
}: {
  title: string;
  description: string;
  primaryHref?: string;
  primaryLabel?: string;
  secondaryHref?: string;
  secondaryLabel?: string;
  note?: string;
}) {
  return (
    <div className="relative overflow-hidden rounded-2xl bg-ink-950 px-6 py-12 text-center sm:px-12 sm:py-16">
      <div
        aria-hidden
        className="pointer-events-none absolute -top-32 -right-24 size-96 rounded-full bg-brand-600/25 blur-3xl"
      />
      <div
        aria-hidden
        className="pointer-events-none absolute -bottom-40 -left-24 size-96 rounded-full bg-accent-500/15 blur-3xl"
      />
      <div className="relative mx-auto max-w-2xl">
        <h2 className="text-3xl font-extrabold tracking-tight text-balance text-white sm:text-4xl">
          {title}
        </h2>
        <p className="mt-4 text-base leading-relaxed text-pretty text-ink-300 sm:text-lg">
          {description}
        </p>
        <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
          <ButtonLink href={primaryHref} size="lg">
            {primaryLabel}
          </ButtonLink>
          {secondaryHref && secondaryLabel ? (
            <ButtonLink
              href={secondaryHref}
              size="lg"
              variant="outline"
              className="border-white/25 bg-transparent text-white hover:border-white/50 hover:bg-white/10 hover:text-white"
            >
              {secondaryLabel}
            </ButtonLink>
          ) : null}
        </div>
        {note ? <p className="mt-4 text-[13px] text-ink-400">{note}</p> : null}
      </div>
    </div>
  );
}

/** A block of contextual internal links. Good for users, good for crawl depth. */
export function RelatedLinks({
  title,
  links,
  columns = 3,
}: {
  title: string;
  links: { label: string; href: string; description?: string }[];
  columns?: 2 | 3;
}) {
  if (links.length === 0) return null;
  return (
    <div>
      <h2 className="text-xl font-bold text-ink-950">{title}</h2>
      <ul
        className={cn(
          'mt-5 grid gap-3',
          columns === 2 ? 'sm:grid-cols-2' : 'sm:grid-cols-2 lg:grid-cols-3',
        )}
      >
        {links.map((link) => (
          <li key={link.href}>
            <Link
              href={link.href}
              className="group flex h-full flex-col rounded-xl border border-ink-200 bg-white p-4 transition-all hover:-translate-y-0.5 hover:border-brand-300 hover:shadow-card"
            >
              <span className="flex items-center gap-1.5 text-sm font-semibold text-ink-950 group-hover:text-brand-700">
                {link.label}
                <svg
                  width="14"
                  height="14"
                  viewBox="0 0 24 24"
                  fill="none"
                  aria-hidden
                  className="transition-transform group-hover:translate-x-0.5"
                >
                  <path d="M5 12h14m-6-6 6 6-6 6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              </span>
              {link.description ? (
                <span className="mt-1 text-[13px] leading-relaxed text-ink-600">
                  {link.description}
                </span>
              ) : null}
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );
}

export function StatRow({ stats }: { stats: { value: string; label: string }[] }) {
  return (
    <dl className="grid grid-cols-2 gap-6 sm:grid-cols-4">
      {stats.map((stat) => (
        <div key={stat.label} className="text-center">
          <dt className="sr-only">{stat.label}</dt>
          <dd>
            <span className="block text-3xl font-extrabold tracking-tight text-ink-950 sm:text-4xl">
              {stat.value}
            </span>
            <span className="mt-1 block text-sm text-ink-600">{stat.label}</span>
          </dd>
        </div>
      ))}
    </dl>
  );
}
