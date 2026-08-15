'use client';

import { useMemo, useState } from 'react';
import { Check, Lock, Search } from 'lucide-react';

import { useCopy } from '@/components/i18n/LocaleProvider';
import { Badge } from '@/components/ui/feedback';
import {
  ColorField,
  Field,
  Input,
  RangeField,
  SegmentedControl,
  Select,
  Switch,
} from '@/components/ui/form';
import { CV_FONTS, PAPER } from '@/lib/cv/format';
import { cn } from '@/lib/utils/cn';
import type {
  CVCustomization,
  DateFormatKey,
  FontKey,
  PaperSize,
  TemplateCategory,
} from '@/types/cv';

/**
 * Template and design controls.
 *
 * The template list arrives as plain data from the server. Importing the registry here
 * would drag all 56 template *components* into the client bundle — they are server
 * components rendered into the preview, and none of them belong in the browser's JS.
 */

export interface EditorTemplateChoice {
  id: string;
  name: string;
  slug: string;
  category: TemplateCategory;
  premium: boolean;
  atsScore: number;
  columns: 1 | 2;
  hasPhoto: boolean;
  accentDefault: string;
  /** The typeface pairing the template was designed around. */
  fonts: { heading: FontKey; body: FontKey };
}

/**
 * True when the current pair is still some template's default rather than the user's choice.
 *
 * Switching template is meant to be a non-event: your content and every other setting
 * survive it. But a template that renders in whatever face the last one used is not really
 * a different design — type does more for perceived difference than column count does. So
 * the incoming pairing is applied only when the outgoing one was never deliberately picked.
 * Matching *any* template's defaults is the test, not just the current template's, because
 * the user may have arrived here from another template that set its own pair.
 */
function usesTemplateFonts(
  templates: EditorTemplateChoice[],
  headingFont: FontKey,
  bodyFont: FontKey,
): boolean {
  return templates.some(
    (template) => template.fonts.heading === headingFont && template.fonts.body === bodyFont,
  );
}

const ACCENT_PRESETS = [
  '#1f3af5',
  '#0f4c81',
  '#0b3d3b',
  '#14532d',
  '#7c3aed',
  '#db2777',
  '#b91c1c',
  '#ea580c',
  '#a1662f',
  '#0f172a',
  '#334155',
  '#111827',
];

export function DesignPanel({
  customization,
  onChange,
  templates,
  canUsePremiumTemplates,
  canCustomise,
  onUpgradeNeeded,
}: {
  customization: CVCustomization;
  onChange: (recipe: (current: CVCustomization) => CVCustomization) => void;
  templates: EditorTemplateChoice[];
  canUsePremiumTemplates: boolean;
  canCustomise: boolean;
  onUpgradeNeeded: (reason: string) => void;
}) {
  const copy = useCopy();
  const set = (patch: Partial<CVCustomization>) =>
    onChange((current) => ({ ...current, ...patch }));

  const guarded = (patch: Partial<CVCustomization>, reason: string) => {
    if (!canCustomise) {
      onUpgradeNeeded(reason);
      return;
    }
    set(patch);
  };

  return (
    <div className="flex flex-col gap-8">
      <TemplatePicker
        templates={templates}
        selectedId={customization.templateId}
        canUsePremium={canUsePremiumTemplates}
        onSelect={(template) => {
          if (template.premium && !canUsePremium(canUsePremiumTemplates)) {
            onUpgradeNeeded(copy.editor.pro.lockedTemplate(template.name));
            return;
          }
          // The content is never touched, and neither is any setting the user chose for
          // themselves. The one thing that follows the template is its typeface pairing —
          // and only while the current pair is still a default nobody picked on purpose.
          const inherited = usesTemplateFonts(
            templates,
            customization.headingFont,
            customization.bodyFont,
          );
          set(
            inherited
              ? {
                  templateId: template.id,
                  headingFont: template.fonts.heading,
                  bodyFont: template.fonts.body,
                }
              : { templateId: template.id },
          );
        }}
      />

      <Group title={copy.editor.design.colourGroup}>
        <ColorField
          label={copy.editor.accentColour}
          value={customization.accentColor}
          onChange={(accentColor) => set({ accentColor })}
          presets={ACCENT_PRESETS}
        />
        <ColorField
          label={copy.editor.design.headingColour}
          value={customization.secondaryColor}
          onChange={(secondaryColor) => guarded({ secondaryColor }, copy.editor.pro.headingColour)}
        />
        <ColorField
          label={copy.editor.design.bodyColour}
          value={customization.textColor}
          onChange={(textColor) => guarded({ textColor }, copy.editor.pro.bodyColour)}
        />
      </Group>

      <Group title={copy.editor.design.typographyGroup}>
        <Field label={copy.editor.headingFont}>
          {({ id }) => (
            <Select
              id={id}
              value={customization.headingFont}
              onChange={(event) =>
                guarded({ headingFont: event.target.value as FontKey }, copy.editor.pro.font)
              }
            >
              {CV_FONTS.map((font) => (
                <option key={font.key} value={font.key}>
                  {font.label} ({font.kind})
                </option>
              ))}
            </Select>
          )}
        </Field>

        <Field label={copy.editor.bodyFont}>
          {({ id }) => (
            <Select
              id={id}
              value={customization.bodyFont}
              onChange={(event) =>
                guarded({ bodyFont: event.target.value as FontKey }, copy.editor.pro.font)
              }
            >
              {CV_FONTS.map((font) => (
                <option key={font.key} value={font.key}>
                  {font.label} ({font.kind})
                </option>
              ))}
            </Select>
          )}
        </Field>

        <RangeField
          label={copy.editor.fontSize}
          value={customization.fontSize}
          min={8.5}
          max={13}
          step={0.25}
          format={(value) => `${value}px`}
          onChange={(fontSize) => guarded({ fontSize }, copy.editor.pro.textSize)}
        />

        <RangeField
          label={copy.editor.lineHeight}
          value={customization.lineHeight}
          min={1.15}
          max={1.9}
          step={0.05}
          format={(value) => value.toFixed(2)}
          onChange={(lineHeight) => guarded({ lineHeight }, copy.editor.pro.lineHeight)}
        />

        <Field label={copy.editor.headingStyle}>
          {({ id }) => (
            <SegmentedControl
              label={copy.editor.headingStyle}
              value={customization.headingCase}
              size="sm"
              onChange={(headingCase) => guarded({ headingCase }, copy.editor.pro.headingStyle)}
              options={[
                { value: 'uppercase', label: copy.editor.design.caseUpper },
                { value: 'capitalize', label: copy.editor.design.caseTitle },
                { value: 'none', label: copy.editor.design.caseAsTyped },
              ]}
              className={id ? undefined : undefined}
            />
          )}
        </Field>
      </Group>

      <Group title={copy.editor.design.spacingGroup}>
        <RangeField
          label={copy.editor.sectionSpacing}
          value={customization.sectionSpacing}
          min={6}
          max={40}
          step={1}
          format={(value) => `${value}px`}
          onChange={(sectionSpacing) => guarded({ sectionSpacing }, copy.editor.pro.spacing)}
        />
        <RangeField
          label={copy.editor.pageMargin}
          value={customization.pageMargin}
          min={20}
          max={80}
          step={2}
          format={(value) => `${value}px`}
          onChange={(pageMargin) => guarded({ pageMargin }, copy.editor.pro.margins)}
        />

        <div>
          <p className="mb-1.5 text-sm font-medium text-ink-800">{copy.editor.paperSize}</p>
          <SegmentedControl
            label={copy.editor.paperSize}
            value={customization.paperSize}
            onChange={(paperSize: PaperSize) => set({ paperSize })}
            options={[
              { value: 'a4', label: 'A4', title: PAPER.a4.label },
              { value: 'letter', label: 'Letter', title: PAPER.letter.label },
            ]}
            className="w-full"
          />
          <p className="mt-1.5 text-xs text-ink-500">{copy.editor.design.paperHint}</p>
        </div>
      </Group>

      <Group title={copy.editor.design.contentGroup}>
        <Switch
          label={copy.editor.design.showPhoto}
          hint={copy.editor.design.showPhotoHint}
          checked={customization.showPhoto}
          onCheckedChange={(showPhoto) => set({ showPhoto })}
        />

        {customization.showPhoto ? (
          <div>
            <p className="mb-1.5 text-sm font-medium text-ink-800">
              {copy.editor.design.photoShape}
            </p>
            <SegmentedControl
              label={copy.editor.design.photoShape}
              value={customization.photoShape}
              size="sm"
              onChange={(photoShape) => set({ photoShape })}
              options={[
                { value: 'circle', label: copy.editor.design.photoCircle },
                { value: 'rounded', label: copy.editor.design.photoRounded },
                { value: 'square', label: copy.editor.design.photoSquare },
              ]}
              className="w-full"
            />
          </div>
        ) : null}

        <Switch
          label={copy.editor.design.showIcons}
          hint={copy.editor.design.showIconsHint}
          checked={customization.showIcons}
          onCheckedChange={(showIcons) => set({ showIcons })}
        />

        <div>
          <p className="mb-1.5 text-sm font-medium text-ink-800">
            {copy.editor.design.skillDisplay}
          </p>
          <SegmentedControl
            label={copy.editor.design.skillDisplay}
            value={customization.skillDisplay}
            size="sm"
            onChange={(skillDisplay) => guarded({ skillDisplay }, copy.editor.pro.skillDisplay)}
            options={[
              { value: 'bars', label: copy.editor.design.skillBars },
              { value: 'dots', label: copy.editor.design.skillDots },
              { value: 'tags', label: copy.editor.design.skillTags },
              { value: 'text', label: copy.editor.design.skillText },
            ]}
            className="w-full"
          />
          <p className="mt-1.5 text-xs text-ink-500">{copy.editor.design.skillHint}</p>
        </div>

        <Field label={copy.editor.dateFormat}>
          {/*
            The samples stay in English rather than following the interface. They show what
            the *document* will print, and the month names on the document come from
            `cv.language` — so translating them here would promise a French user "janv. 2024"
            on a CV they are writing in English.
          */}
          {({ id }) => (
            <Select
              id={id}
              value={customization.dateFormat}
              onChange={(event) => set({ dateFormat: event.target.value as DateFormatKey })}
            >
              <option value="month-year-short">Jan 2024</option>
              <option value="month-year-long">January 2024</option>
              <option value="numeric">01/2024</option>
              <option value="year-only">2024</option>
            </Select>
          )}
        </Field>
      </Group>
    </div>
  );
}

function canUsePremium(value: boolean): boolean {
  return value;
}

function Group({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section className="flex flex-col gap-4">
      <h3 className="text-xs font-bold tracking-[0.1em] text-ink-500 uppercase">{title}</h3>
      {children}
    </section>
  );
}

function TemplatePicker({
  templates,
  selectedId,
  canUsePremium: premiumAllowed,
  onSelect,
}: {
  templates: EditorTemplateChoice[];
  selectedId: string;
  canUsePremium: boolean;
  onSelect: (template: EditorTemplateChoice) => void;
}) {
  const copy = useCopy();
  const [query, setQuery] = useState('');
  const [category, setCategory] = useState<TemplateCategory | 'all'>('all');

  const filtered = useMemo(() => {
    const needle = query.trim().toLowerCase();
    return templates.filter((template) => {
      if (category !== 'all' && template.category !== category) return false;
      if (!needle) return true;
      return `${template.name} ${template.category}`.toLowerCase().includes(needle);
    });
  }, [templates, query, category]);

  const categories: (TemplateCategory | 'all')[] = [
    'all',
    'modern',
    'corporate',
    'creative',
    'technology',
    'classic',
    'ats',
  ];

  return (
    <section className="flex flex-col gap-3">
      <div className="flex items-center justify-between">
        <h3 className="text-xs font-bold tracking-[0.1em] text-ink-500 uppercase">
          {copy.editor.template}
        </h3>
        <span className="text-xs text-ink-500">{copy.editor.design.shown(filtered.length)}</span>
      </div>

      <div className="relative">
        <Search
          className="pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 text-ink-400"
          aria-hidden
        />
        <Input
          value={query}
          onChange={(event) => setQuery(event.target.value)}
          placeholder={copy.editor.design.searchTemplates}
          aria-label={copy.editor.design.searchTemplates}
          className="pl-9"
        />
      </div>

      <div className="flex flex-wrap gap-1.5">
        {categories.map((value) => (
          <button
            key={value}
            type="button"
            onClick={() => setCategory(value)}
            aria-pressed={category === value}
            className={cn(
              'cursor-pointer rounded-full px-2.5 py-1 text-xs font-medium transition-colors',
              category === value
                ? 'bg-ink-900 text-white'
                : 'bg-ink-100 text-ink-600 hover:bg-ink-200',
            )}
          >
            {copy.editor.design.categories[value]}
          </button>
        ))}
      </div>

      {filtered.length === 0 ? (
        <p className="rounded-lg border border-dashed border-ink-300 p-4 text-center text-[13px] text-ink-500">
          {copy.editor.design.noMatch(query)}
        </p>
      ) : (
        <ul className="grid grid-cols-2 gap-2">
          {filtered.map((template) => {
            const selected = template.id === selectedId;
            const locked = template.premium && !premiumAllowed;
            return (
              <li key={template.id}>
                <button
                  type="button"
                  onClick={() => onSelect(template)}
                  aria-pressed={selected}
                  className={cn(
                    'flex w-full cursor-pointer flex-col items-start gap-1 rounded-lg border p-2.5 text-left transition-colors',
                    selected
                      ? 'border-brand-500 bg-brand-50 ring-1 ring-brand-500'
                      : 'border-ink-200 hover:border-ink-300 hover:bg-ink-50',
                  )}
                >
                  <span className="flex w-full items-center gap-1.5">
                    <span className="min-w-0 flex-1 truncate text-[13px] font-semibold text-ink-950">
                      {template.name}
                    </span>
                    {selected ? (
                      <Check className="size-3.5 shrink-0 text-brand-600" aria-hidden />
                    ) : locked ? (
                      <Lock className="size-3 shrink-0 text-accent-600" aria-hidden />
                    ) : null}
                  </span>
                  <span className="flex items-center gap-1.5">
                    <span className="text-[11px] text-ink-500">
                      {copy.editor.design.columns(template.columns)} ·{' '}
                      {copy.editor.design.ats(template.atsScore)}
                    </span>
                    {template.premium ? (
                      <Badge tone="accent" className="px-1 py-0 text-[9px]">
                        {copy.common.pro}
                      </Badge>
                    ) : null}
                  </span>
                </button>
              </li>
            );
          })}
        </ul>
      )}
    </section>
  );
}
