'use client';

import { useEffect, useMemo, useState } from 'react';
import type { ReactNode } from 'react';
import { Lock, Search, Check } from 'lucide-react';

import { ButtonLink } from '@/components/ui/button';
import { Alert } from '@/components/ui/feedback';
import { Input, SegmentedControl } from '@/components/ui/form';
import { trackEvent } from '@/lib/analytics/events';
import { cn } from '@/lib/utils/cn';

/**
 * A template gallery that selects instead of navigating.
 *
 * The previews are rendered on the server and handed in as `preview` nodes, so choosing
 * a design costs no extra JavaScript beyond the filtering itself. Pro templates stay
 * visible to free users — hiding them would make the plan boundary invisible — but they
 * cannot be selected, and tapping one explains why.
 */

export interface TemplateOption {
  id: string;
  name: string;
  categoryLabel: string;
  category: string;
  premium: boolean;
  atsScore: number;
  columns: 1 | 2;
  tagline: string;
  /** Pre-lowercased haystack: name, tagline, category and keywords. */
  search: string;
  preview: ReactNode;
}

export type PlanFilter = 'all' | 'free' | 'pro';

export function TemplatePicker({
  templates,
  categories,
  canUsePremium,
  value,
  onChange,
  className,
}: {
  templates: TemplateOption[];
  categories: { id: string; label: string }[];
  canUsePremium: boolean;
  value: string;
  onChange: (templateId: string) => void;
  className?: string;
}) {
  const [query, setQuery] = useState('');
  const [category, setCategory] = useState('all');
  const [planFilter, setPlanFilter] = useState<PlanFilter>('all');
  const [blockedId, setBlockedId] = useState<string | null>(null);

  useEffect(() => {
    const needle = query.trim();
    if (needle.length < 3) return;
    const timer = setTimeout(() => trackEvent('search_templates', { length: needle.length }), 700);
    return () => clearTimeout(timer);
  }, [query]);

  const visible = useMemo(() => {
    const needle = query.trim().toLowerCase();
    return templates.filter((template) => {
      if (category !== 'all' && template.category !== category) return false;
      if (planFilter === 'free' && template.premium) return false;
      if (planFilter === 'pro' && !template.premium) return false;
      if (needle && !template.search.includes(needle)) return false;
      return true;
    });
  }, [templates, query, category, planFilter]);

  const chips = [{ id: 'all', label: 'All' }, ...categories];

  return (
    <div className={cn('flex flex-col gap-4', className)}>
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
        <div className="relative flex-1">
          <Search
            size={16}
            aria-hidden
            className="pointer-events-none absolute top-1/2 left-3 -translate-y-1/2 text-ink-400"
          />
          <Input
            type="search"
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder="Search templates — “ats”, “executive”, “designer”…"
            aria-label="Search templates"
            className="pl-9"
          />
        </div>
        <SegmentedControl<PlanFilter>
          label="Filter by plan"
          value={planFilter}
          onChange={setPlanFilter}
          size="sm"
          options={[
            { value: 'all', label: 'All' },
            { value: 'free', label: 'Free' },
            { value: 'pro', label: 'Pro' },
          ]}
        />
      </div>

      <div className="scroll-thin -mx-1 flex gap-1.5 overflow-x-auto px-1 pb-1">
        {chips.map((chip) => {
          const active = chip.id === category;
          return (
            <button
              key={chip.id}
              type="button"
              aria-pressed={active}
              onClick={() => setCategory(chip.id)}
              className={cn(
                'shrink-0 cursor-pointer rounded-full border px-3 py-1.5 text-[13px] font-medium transition-colors',
                active
                  ? 'border-brand-600 bg-brand-600 text-white'
                  : 'border-ink-200 bg-white text-ink-700 hover:border-ink-300 hover:bg-ink-50',
              )}
            >
              {chip.label}
            </button>
          );
        })}
      </div>

      {blockedId ? (
        <Alert
          tone="info"
          title="That is a Pro template"
          action={
            <ButtonLink href="/pricing" size="sm">
              See plans
            </ButtonLink>
          }
        >
          Upgrade to unlock every design, or keep going with one of the free templates —
          the free set includes every ATS-safe layout.
        </Alert>
      ) : null}

      <p className="text-xs text-ink-500" role="status">
        {visible.length} of {templates.length} templates
      </p>

      {visible.length === 0 ? (
        <div className="rounded-xl border border-dashed border-ink-200 bg-ink-50/60 px-6 py-10 text-center">
          <p className="text-sm font-semibold text-ink-900">No template matches that</p>
          <p className="mt-1 text-sm text-ink-600">
            Try a shorter search, or clear the category and plan filters.
          </p>
        </div>
      ) : (
        <ul className="grid grid-cols-2 gap-2.5 sm:grid-cols-3 md:grid-cols-4 xl:grid-cols-5">
          {visible.map((template) => {
            const selected = template.id === value;
            const locked = template.premium && !canUsePremium;

            return (
              <li key={template.id}>
                <button
                  type="button"
                  aria-pressed={selected}
                  onClick={() => {
                    if (locked) {
                      setBlockedId(template.id);
                      trackEvent('upgrade_prompt_shown', { reason: 'premium-template' });
                      return;
                    }
                    setBlockedId(null);
                    onChange(template.id);
                    trackEvent('template_selected', { template_id: template.id });
                  }}
                  className={cn(
                    'group relative flex w-full cursor-pointer flex-col rounded-xl border bg-white p-2 text-left transition-all duration-200',
                    'focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand-600',
                    selected
                      ? 'border-brand-600 ring-2 ring-brand-600/25'
                      : 'border-ink-200 hover:border-brand-300 hover:shadow-card-hover',
                  )}
                >
                  <span
                    className={cn(
                      'relative block overflow-hidden rounded-lg bg-ink-100',
                      locked && 'opacity-60',
                    )}
                  >
                    <span className="mx-auto block w-fit">{template.preview}</span>
                    {locked ? (
                      <span className="absolute top-1.5 right-1.5 grid size-6 place-items-center rounded-full bg-ink-950/75 text-white">
                        <Lock size={12} aria-hidden />
                      </span>
                    ) : null}
                    {selected ? (
                      <span className="absolute top-1.5 right-1.5 grid size-6 place-items-center rounded-full bg-brand-600 text-white">
                        <Check size={13} aria-hidden />
                      </span>
                    ) : null}
                  </span>

                  <span className="mt-2 flex items-center justify-between gap-1.5">
                    <span className="truncate text-[13px] font-semibold text-ink-950">
                      {template.name}
                    </span>
                    <span
                      className={cn(
                        'shrink-0 rounded-full px-1.5 py-0.5 text-[10px] font-bold',
                        template.premium
                          ? 'bg-accent-50 text-accent-700'
                          : 'bg-success-50 text-success-700',
                      )}
                    >
                      {template.premium ? 'PRO' : 'FREE'}
                    </span>
                  </span>
                  <span className="mt-0.5 truncate text-[11px] text-ink-500">
                    {template.categoryLabel} · ATS {template.atsScore}/5
                  </span>
                </button>
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}
