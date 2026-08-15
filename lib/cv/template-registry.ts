import { GENERATED_TEMPLATES } from './templates.generated';
import type {
  CVCustomization,
  TemplateCategory,
  TemplateDefinition,
  TemplateMeta,
} from '@/types/cv';

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

const CATEGORY_BY_ID = new Map(TEMPLATE_CATEGORIES.map((category) => [category.id, category]));

export function findCategory(category: TemplateCategory) {
  return CATEGORY_BY_ID.get(category);
}

/**
 * The canonical URL of a category.
 *
 * `/templates/modern` is a real page — prerendered, in the sitemap, with its own title,
 * lede, FAQ and copy. `/templates?category=modern` is the gallery filtering itself in the
 * browser: same URL as far as a crawler is concerned, no copy of its own, and any link
 * equity it earns is spent on the gallery instead of the page written to rank.
 *
 * Every link to a category goes through here so the two can never diverge again.
 */
export function categoryPath(category: TemplateCategory): string {
  return `/templates/${CATEGORY_BY_ID.get(category)?.slug ?? category}`;
}

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

  /*
   * Siblings are taken as a *cycle* starting after this template, not as the first six in
   * registry order.
   *
   * Taking the first six looks reasonable and quietly orphans a third of the catalogue. A
   * category holds ten templates, the grid shows six, and every one of the ten was picking
   * from the same front of the list — so positions seven, eight and nine were linked to by
   * nobody. Eighteen of the fifty-six pages received no internal link from any related grid,
   * which on a domain with no external links is most of the PageRank they were ever going
   * to get.
   *
   * Rotating makes in-degree equal out-degree: every template links to the six after it and
   * is linked to by the six before it. Still deterministic, so the pages stay prerenderable.
   */
  const siblings = TEMPLATES.filter((template) => template.category === current.category);
  const at = siblings.findIndex((template) => template.id === current.id);
  const rotated = at === -1 ? siblings : [...siblings.slice(at + 1), ...siblings.slice(0, at)];

  if (rotated.length >= limit) return rotated.slice(0, limit);

  // Small category: top up from the closest ATS scores elsewhere, offset so that those
  // templates are not all pointing at the same handful either.
  const others = TEMPLATES.filter(
    (template) => template.category !== current.category && template.id !== current.id,
  ).sort(
    (a, b) => Math.abs(a.atsScore - current.atsScore) - Math.abs(b.atsScore - current.atsScore),
  );
  const offset = Math.max(0, at) % Math.max(1, others.length);
  const topUp = [...others.slice(offset), ...others.slice(0, offset)];

  return [...rotated, ...topUp].slice(0, limit);
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

/**
 * Free templates that score full marks for machine readability.
 *
 * Exported because the free plan's feature list quotes it, and a hand-typed figure there
 * had already drifted: it advertised "five built for applicant tracking systems" when
 * eighteen of the twenty free designs score 5/5. Understating the offer is the expensive
 * direction to be wrong in, so the number is now counted rather than remembered.
 */
export const FREE_ATS_TEMPLATE_COUNT = TEMPLATES.filter(
  (template) => !template.premium && template.atsScore === 5,
).length;

/**
 * The starting customization for a template: accent, typeface pairing and page metrics.
 *
 * Call sites used to pass `{ templateId, accentColor: template.accentDefault }` by hand,
 * which is how the fonts would have been forgotten in nineteen places. One function, so a
 * template's design defaults arrive together or not at all.
 */
export function templateDefaults(
  template: TemplateDefinition | TemplateMeta,
): Pick<
  CVCustomization,
  'templateId' | 'accentColor' | 'headingFont' | 'bodyFont' | 'lineHeight' | 'pageMargin'
> {
  return {
    templateId: template.id,
    accentColor: template.accentDefault,
    headingFont: template.fonts.heading,
    bodyFont: template.fonts.body,
    lineHeight: template.metrics.lineHeight,
    pageMargin: template.metrics.pageMargin,
  };
}
