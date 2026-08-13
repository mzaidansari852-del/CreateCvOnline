'use client';

import { useState } from 'react';
import { FilePlus2, Sparkles } from 'lucide-react';

import { Button, ButtonLink } from '@/components/ui/button';
import { Alert, Badge } from '@/components/ui/feedback';
import { Field, Input } from '@/components/ui/form';
import { TemplatePicker, type TemplateOption } from './TemplatePicker';
import { useCreateCV } from './create-cv';
import { usePreferences, type DashboardPreferences } from './preferences';
import { PAPER } from '@/lib/cv/format';
import { cn } from '@/lib/utils/cn';
import type { PaperSize } from '@/types/cv';

/**
 * The new-CV flow.
 *
 * Three decisions in one screen — starting content, template, name — because splitting
 * them across steps would hide the template gallery behind a click, and the template is
 * the thing people actually come here to choose.
 */

type Starter = 'blank' | 'sample';

export function NewCVFlow({
  templates,
  categories,
  canUsePremium,
  initialTemplateId,
  templateFromQuery,
  cvsUsed,
  cvLimit,
}: {
  templates: TemplateOption[];
  categories: { id: string; label: string }[];
  canUsePremium: boolean;
  initialTemplateId: string;
  /** True when the id came from `?template=`, which then wins over the saved default. */
  templateFromQuery: boolean;
  cvsUsed: number;
  cvLimit: number | null;
}) {
  const { create, creating } = useCreateCV();

  const [starter, setStarter] = useState<Starter>('blank');
  const [title, setTitle] = useState('');
  const [templateId, setTemplateId] = useState(initialTemplateId);
  const [paperSize, setPaperSize] = useState<PaperSize>('a4');

  // Stored defaults arrive one render after hydration (localStorage is not readable on
  // the server). Applying them during render rather than in an effect avoids a visible
  // flash of the wrong paper size. The saved template only applies when the URL did not
  // already ask for a specific one.
  const preferences = usePreferences();
  const [appliedPreferences, setAppliedPreferences] = useState<DashboardPreferences | null>(null);
  if (appliedPreferences !== preferences) {
    setAppliedPreferences(preferences);
    setPaperSize(preferences.paperSize);
    if (!templateFromQuery) {
      const preferred = templates.find((template) => template.id === preferences.templateId);
      if (preferred && (!preferred.premium || canUsePremium)) setTemplateId(preferred.id);
    }
  }

  const selected = templates.find((template) => template.id === templateId);
  const atLimit = cvLimit !== null && cvsUsed >= cvLimit;

  const starterOptions: { value: Starter; label: string; hint: string; icon: typeof FilePlus2 }[] = [
    {
      value: 'blank',
      label: 'Start blank',
      hint: 'An empty document. Best if you already have your history written down.',
      icon: FilePlus2,
    },
    {
      value: 'sample',
      label: 'Start from a worked example',
      hint: 'A complete, realistic CV to edit down. Best if you are staring at a blank page.',
      icon: Sparkles,
    },
  ];

  return (
    <div className="flex flex-col gap-6 pb-28 lg:pb-0">
      {cvLimit !== null ? (
        <Alert
          tone={atLimit ? 'warning' : 'info'}
          title={
            atLimit
              ? `You are using all ${cvLimit} CVs your plan allows`
              : `${cvsUsed} of ${cvLimit} CVs used on the Free plan`
          }
          action={
            <ButtonLink href="/pricing" size="sm" variant={atLimit ? 'primary' : 'outline'}>
              See plans
            </ButtonLink>
          }
        >
          {atLimit
            ? 'Delete a CV to make room, or upgrade to Pro for unlimited CVs.'
            : 'Pro removes the limit and unlocks every template.'}
        </Alert>
      ) : null}

      <section aria-labelledby="starter-heading">
        <h2 id="starter-heading" className="text-base font-semibold text-ink-950">
          1. Choose a starting point
        </h2>
        <div
          role="radiogroup"
          aria-labelledby="starter-heading"
          className="mt-3 grid gap-3 sm:grid-cols-2"
        >
          {starterOptions.map((option) => {
            const active = option.value === starter;
            const Icon = option.icon;
            return (
              <button
                key={option.value}
                type="button"
                role="radio"
                aria-checked={active}
                onClick={() => setStarter(option.value)}
                className={cn(
                  'flex cursor-pointer flex-col items-start gap-2 rounded-xl border bg-white p-4 text-left transition-all duration-200',
                  'focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand-600',
                  active
                    ? 'border-brand-600 ring-2 ring-brand-600/20'
                    : 'border-ink-200 hover:border-brand-300 hover:shadow-card-hover',
                )}
              >
                <span
                  className={cn(
                    'grid size-9 place-items-center rounded-lg',
                    active ? 'bg-brand-600 text-white' : 'bg-ink-100 text-ink-600',
                  )}
                >
                  <Icon size={18} aria-hidden />
                </span>
                <span className="text-sm font-semibold text-ink-950">{option.label}</span>
                <span className="text-xs leading-relaxed text-ink-600">{option.hint}</span>
              </button>
            );
          })}
        </div>
      </section>

      <section aria-labelledby="template-heading">
        <h2 id="template-heading" className="text-base font-semibold text-ink-950">
          2. Pick a template
        </h2>
        <p className="mt-1 text-sm text-ink-600">
          You can change it later without losing anything you have written.
        </p>
        <TemplatePicker
          className="mt-4"
          templates={templates}
          categories={categories}
          canUsePremium={canUsePremium}
          value={templateId}
          onChange={setTemplateId}
        />
      </section>

      <section aria-labelledby="name-heading">
        <h2 id="name-heading" className="text-base font-semibold text-ink-950">
          3. Name it and create
        </h2>
        <div className="mt-3 rounded-xl border border-ink-200 bg-white p-4">
          <Field
            label="CV name"
            hint="Only you see this. Leave it blank to call it “Untitled CV”."
            className="max-w-md"
          >
            {({ id, describedBy }) => (
              <Input
                id={id}
                aria-describedby={describedBy}
                value={title}
                maxLength={120}
                placeholder="e.g. Product designer — Atlas Cloud"
                onChange={(event) => setTitle(event.target.value)}
              />
            )}
          </Field>

          <dl className="mt-4 flex flex-wrap gap-x-6 gap-y-2 text-xs text-ink-600">
            <div className="flex items-center gap-1.5">
              <dt className="font-medium text-ink-500">Template:</dt>
              <dd className="flex items-center gap-1.5 font-semibold text-ink-900">
                {selected?.name ?? 'None selected'}
                {selected?.premium ? <Badge tone="accent">Pro</Badge> : null}
              </dd>
            </div>
            <div className="flex items-center gap-1.5">
              <dt className="font-medium text-ink-500">Paper:</dt>
              <dd className="font-semibold text-ink-900">{PAPER[paperSize].label}</dd>
            </div>
            <div className="flex items-center gap-1.5">
              <dt className="font-medium text-ink-500">Content:</dt>
              <dd className="font-semibold text-ink-900">
                {starter === 'sample' ? 'Worked example' : 'Empty'}
              </dd>
            </div>
          </dl>
        </div>
      </section>

      <div className="fixed inset-x-0 bottom-14 z-60 border-t border-ink-200 bg-white/95 p-3 backdrop-blur-lg lg:static lg:z-auto lg:border-0 lg:bg-transparent lg:p-0 lg:backdrop-blur-none">
        <div className="flex items-center justify-end gap-3">
          <ButtonLink href="/dashboard/cvs" variant="ghost" size="lg" className="hidden sm:inline-flex">
            Cancel
          </ButtonLink>
          <Button
            size="lg"
            loading={creating}
            disabled={atLimit || !selected}
            className="flex-1 sm:flex-none"
            onClick={() =>
              void create({ title, templateId, starter })
            }
          >
            Create CV
          </Button>
        </div>
      </div>
    </div>
  );
}
