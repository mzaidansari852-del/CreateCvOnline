'use client';

import { useMemo, useState } from 'react';
import { Check, Lock, Search } from 'lucide-react';

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

const CATEGORY_LABELS: Record<TemplateCategory | 'all', string> = {
  all: 'All',
  modern: 'Modern',
  corporate: 'Corporate',
  creative: 'Creative',
  technology: 'Tech',
  classic: 'Classic',
  ats: 'ATS',
};

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
  const set = (patch: Partial<CVCustomization>) => onChange((current) => ({ ...current, ...patch }));

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
            onUpgradeNeeded(`“${template.name}” is a Pro template.`);
            return;
          }
          // Only the template id changes — every other setting, and all of the content,
          // is untouched. That is what makes switching template a non-event.
          set({ templateId: template.id });
        }}
      />

      <Group title="Colour">
        <ColorField
          label="Accent colour"
          value={customization.accentColor}
          onChange={(accentColor) => set({ accentColor })}
          presets={ACCENT_PRESETS}
        />
        <ColorField
          label="Heading colour"
          value={customization.secondaryColor}
          onChange={(secondaryColor) => guarded({ secondaryColor }, 'Heading colour is a Pro control.')}
        />
        <ColorField
          label="Body text"
          value={customization.textColor}
          onChange={(textColor) => guarded({ textColor }, 'Body text colour is a Pro control.')}
        />
      </Group>

      <Group title="Typography">
        <Field label="Heading font">
          {({ id }) => (
            <Select
              id={id}
              value={customization.headingFont}
              onChange={(event) =>
                guarded({ headingFont: event.target.value as FontKey }, 'Font choice is a Pro control.')
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

        <Field label="Body font">
          {({ id }) => (
            <Select
              id={id}
              value={customization.bodyFont}
              onChange={(event) =>
                guarded({ bodyFont: event.target.value as FontKey }, 'Font choice is a Pro control.')
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
          label="Text size"
          value={customization.fontSize}
          min={8.5}
          max={13}
          step={0.25}
          format={(value) => `${value}px`}
          onChange={(fontSize) => guarded({ fontSize }, 'Text sizing is a Pro control.')}
        />

        <RangeField
          label="Line height"
          value={customization.lineHeight}
          min={1.15}
          max={1.9}
          step={0.05}
          format={(value) => value.toFixed(2)}
          onChange={(lineHeight) => guarded({ lineHeight }, 'Line height is a Pro control.')}
        />

        <Field label="Section heading style">
          {({ id }) => (
            <SegmentedControl
              label="Section heading style"
              value={customization.headingCase}
              size="sm"
              onChange={(headingCase) =>
                guarded({ headingCase }, 'Heading style is a Pro control.')
              }
              options={[
                { value: 'uppercase', label: 'CAPS' },
                { value: 'capitalize', label: 'Title' },
                { value: 'none', label: 'As typed' },
              ]}
              className={id ? undefined : undefined}
            />
          )}
        </Field>
      </Group>

      <Group title="Spacing and page">
        <RangeField
          label="Space between sections"
          value={customization.sectionSpacing}
          min={6}
          max={40}
          step={1}
          format={(value) => `${value}px`}
          onChange={(sectionSpacing) => guarded({ sectionSpacing }, 'Spacing is a Pro control.')}
        />
        <RangeField
          label="Page margin"
          value={customization.pageMargin}
          min={20}
          max={80}
          step={2}
          format={(value) => `${value}px`}
          onChange={(pageMargin) => guarded({ pageMargin }, 'Margins are a Pro control.')}
        />

        <div>
          <p className="mb-1.5 text-sm font-medium text-ink-800">Paper size</p>
          <SegmentedControl
            label="Paper size"
            value={customization.paperSize}
            onChange={(paperSize: PaperSize) => set({ paperSize })}
            options={[
              { value: 'a4', label: 'A4', title: PAPER.a4.label },
              { value: 'letter', label: 'Letter', title: PAPER.letter.label },
            ]}
            className="w-full"
          />
          <p className="mt-1.5 text-xs text-ink-500">
            A4 for the UK, Europe and most of the world. Letter for the US and Canada.
          </p>
        </div>
      </Group>

      <Group title="Content display">
        <Switch
          label="Show profile photo"
          hint="Only affects templates that support one."
          checked={customization.showPhoto}
          onCheckedChange={(showPhoto) => set({ showPhoto })}
        />

        {customization.showPhoto ? (
          <div>
            <p className="mb-1.5 text-sm font-medium text-ink-800">Photo shape</p>
            <SegmentedControl
              label="Photo shape"
              value={customization.photoShape}
              size="sm"
              onChange={(photoShape) => set({ photoShape })}
              options={[
                { value: 'circle', label: 'Circle' },
                { value: 'rounded', label: 'Rounded' },
                { value: 'square', label: 'Square' },
              ]}
              className="w-full"
            />
          </div>
        ) : null}

        <Switch
          label="Show contact icons"
          hint="Turn off for the strictest ATS compatibility."
          checked={customization.showIcons}
          onCheckedChange={(showIcons) => set({ showIcons })}
        />

        <div>
          <p className="mb-1.5 text-sm font-medium text-ink-800">Skills display</p>
          <SegmentedControl
            label="Skills display"
            value={customization.skillDisplay}
            size="sm"
            onChange={(skillDisplay) =>
              guarded({ skillDisplay }, 'Skill display is a Pro control.')
            }
            options={[
              { value: 'bars', label: 'Bars' },
              { value: 'dots', label: 'Dots' },
              { value: 'tags', label: 'Tags' },
              { value: 'text', label: 'Text' },
            ]}
            className="w-full"
          />
          <p className="mt-1.5 text-xs text-ink-500">
            Plain text parses most reliably. Bars and dots are a visual claim a recruiter
            cannot verify — use them sparingly.
          </p>
        </div>

        <Field label="Date format">
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
        <h3 className="text-xs font-bold tracking-[0.1em] text-ink-500 uppercase">Template</h3>
        <span className="text-xs text-ink-500">{filtered.length} shown</span>
      </div>

      <div className="relative">
        <Search
          className="pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 text-ink-400"
          aria-hidden
        />
        <Input
          value={query}
          onChange={(event) => setQuery(event.target.value)}
          placeholder="Search templates"
          aria-label="Search templates"
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
            {CATEGORY_LABELS[value]}
          </button>
        ))}
      </div>

      {filtered.length === 0 ? (
        <p className="rounded-lg border border-dashed border-ink-300 p-4 text-center text-[13px] text-ink-500">
          No template matches “{query}”.
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
                      {template.columns === 1 ? '1 col' : '2 col'} · ATS {template.atsScore}/5
                    </span>
                    {template.premium ? (
                      <Badge tone="accent" className="px-1 py-0 text-[9px]">
                        Pro
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
