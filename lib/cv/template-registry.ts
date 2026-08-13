import { GENERATED_TEMPLATES } from './templates.generated';
import type { TemplateCategory, TemplateDefinition } from '@/types/cv';

/**
 * The template registry.
 *
 * The array itself is generated from the filesystem (`npm run generate:templates`), so a
 * new template is registered simply by existing. Everything the app needs to look one up —
 * by id, by slug, by category, by plan — lives here.
 */

export const TEMPLATES: TemplateDefinition[] = GENERATED_TEMPLATES;

export const DEFAULT_TEMPLATE_ID = 'modern-01';

const BY_ID = new Map(TEMPLATES.map((template) => [template.id, template]));
const BY_SLUG = new Map(TEMPLATES.map((template) => [template.slug, template]));

export const TEMPLATE_CATEGORIES: {
  id: TemplateCategory;
  label: string;
  slug: string;
  blurb: string;
}[] = [
  {
    id: 'modern',
    label: 'Modern',
    slug: 'modern',
    blurb:
      'Contemporary layouts with generous whitespace and a single accent colour. The safest place to start if you are not sure what your industry expects.',
  },
  {
    id: 'corporate',
    label: 'Corporate',
    slug: 'corporate',
    blurb:
      'Structured, restrained designs built for finance, consulting, management and other environments where a CV is judged on rigour before personality.',
  },
  {
    id: 'creative',
    label: 'Creative',
    slug: 'creative',
    blurb:
      'Expressive layouts for design, art direction, photography and content roles — where the document itself is a work sample.',
  },
  {
    id: 'technology',
    label: 'Technology',
    slug: 'technology',
    blurb:
      'Engineering-oriented templates with room for a stack, projects and open-source work, without turning your CV into a keyword dump.',
  },
  {
    id: 'classic',
    label: 'Classic',
    slug: 'classic',
    blurb:
      'Traditional, serif-friendly formats for academia, law, government and any employer that still expects a conventional document.',
  },
  {
    id: 'ats',
    label: 'ATS-friendly',
    slug: 'ats',
    blurb:
      'Stripped-back, single-column layouts engineered to be parsed correctly by applicant tracking systems. No columns, no graphics, no surprises.',
  },
];

/** Never throws: an unknown id falls back to the default template. */
export function getTemplate(id: string): TemplateDefinition {
  return BY_ID.get(id) ?? BY_ID.get(DEFAULT_TEMPLATE_ID) ?? TEMPLATES[0]!;
}

export function findTemplate(id: string): TemplateDefinition | undefined {
  return BY_ID.get(id);
}

export function getTemplateBySlug(slug: string): TemplateDefinition | undefined {
  return BY_SLUG.get(slug);
}

export function templatesByCategory(category: TemplateCategory): TemplateDefinition[] {
  return TEMPLATES.filter((template) => template.category === category);
}

export function freeTemplates(): TemplateDefinition[] {
  return TEMPLATES.filter((template) => !template.premium);
}

export function premiumTemplates(): TemplateDefinition[] {
  return TEMPLATES.filter((template) => template.premium);
}

export function isPremiumTemplate(id: string): boolean {
  return findTemplate(id)?.premium ?? false;
}

/** Highest-scoring ATS-safe templates, used by the /ats-cv and /ats-resume pages. */
export function atsSafeTemplates(minimumScore = 5): TemplateDefinition[] {
  return TEMPLATES.filter((template) => template.atsScore >= minimumScore);
}

/**
 * Related templates for a given template page: same category first, then the closest
 * ATS score from other categories. Deterministic, so pages stay statically cacheable.
 */
export function relatedTemplates(id: string, limit = 6): TemplateDefinition[] {
  const current = findTemplate(id);
  if (!current) return TEMPLATES.slice(0, limit);

  const sameCategory = TEMPLATES.filter(
    (template) => template.category === current.category && template.id !== current.id,
  );
  const others = TEMPLATES.filter(
    (template) => template.category !== current.category && template.id !== current.id,
  ).sort(
    (a, b) => Math.abs(a.atsScore - current.atsScore) - Math.abs(b.atsScore - current.atsScore),
  );

  return [...sameCategory, ...others].slice(0, limit);
}

/** Free-text search across name, tagline, keywords and category. */
export function searchTemplates(query: string): TemplateDefinition[] {
  const needle = query.trim().toLowerCase();
  if (!needle) return TEMPLATES;
  return TEMPLATES.filter((template) =>
    [template.name, template.tagline, template.category, ...template.keywords]
      .join(' ')
      .toLowerCase()
      .includes(needle),
  );
}

export const TEMPLATE_COUNT = TEMPLATES.length;
export const FREE_TEMPLATE_COUNT = TEMPLATES.filter((template) => !template.premium).length;
