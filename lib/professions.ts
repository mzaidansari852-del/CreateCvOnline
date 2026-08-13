import { PROFESSIONS, PROFESSIONS_BY_SLUG } from '@/content/professions';
import { findTemplate } from '@/lib/cv/template-registry';
import type { Profession } from '@/types/profession';
import type { TemplateDefinition } from '@/types/cv';

/**
 * The profession guides' read API.
 *
 * Everything the app knows about `/cv-for/[profession]` comes through here rather than
 * from `content/professions` directly. Display order, field grouping, the related-guide
 * fallback chain and the word count are all derived once, so a page never has to sort or
 * count anything at render time — which is what keeps these pages statically renderable.
 */

/**
 * Display order for the index page. Fields not listed here fall to the end,
 * alphabetically, so a new field never disappears from the page.
 */
const FIELD_ORDER = [
  'Technology & data',
  'Finance & operations',
  'Commercial & creative',
  'Public service & care',
  'Early career',
] as const;

function fieldRank(field: string): number {
  const index = (FIELD_ORDER as readonly string[]).indexOf(field);
  return index === -1 ? FIELD_ORDER.length : index;
}

/** Grouped by field, then alphabetical by role inside each field. */
const ORDERED: Profession[] = [...PROFESSIONS].sort((a, b) => {
  const byField = fieldRank(a.field) - fieldRank(b.field) || a.field.localeCompare(b.field);
  return byField !== 0 ? byField : a.role.localeCompare(b.role);
});

/* -------------------------------------------------------------------------- */
/* The collection                                                              */
/* -------------------------------------------------------------------------- */

/** Every profession guide, in display order. Returns a copy, so callers may sort it. */
export function getAllProfessions(): Profession[] {
  return [...ORDERED];
}

export function getProfession(slug: string): Profession | undefined {
  return PROFESSIONS_BY_SLUG.get(slug);
}

export function getAllProfessionSlugs(): string[] {
  return ORDERED.map((profession) => profession.slug);
}

/* -------------------------------------------------------------------------- */
/* Fields                                                                      */
/* -------------------------------------------------------------------------- */

export interface ProfessionField {
  name: string;
  professions: Profession[];
}

/** Fields in display order, each with its professions. Used by the `/cv-for` index. */
export function getProfessionFields(): ProfessionField[] {
  const fields: ProfessionField[] = [];
  for (const profession of ORDERED) {
    const existing = fields.find((field) => field.name === profession.field);
    if (existing) existing.professions.push(profession);
    else fields.push({ name: profession.field, professions: [profession] });
  }
  return fields;
}

/* -------------------------------------------------------------------------- */
/* Relationships                                                               */
/* -------------------------------------------------------------------------- */

/**
 * Related guides: the ones the author chose first, then others in the same field,
 * then whatever comes next in display order. Deterministic, so the page stays static.
 */
export function getRelatedProfessions(slug: string, limit = 3): Profession[] {
  const current = PROFESSIONS_BY_SLUG.get(slug);
  if (!current) return ORDERED.slice(0, limit);

  const picked = new Map<string, Profession>();
  const add = (profession: Profession | undefined) => {
    if (!profession || profession.slug === slug || picked.has(profession.slug)) return;
    if (picked.size < limit) picked.set(profession.slug, profession);
  };

  for (const related of current.related) add(PROFESSIONS_BY_SLUG.get(related));
  for (const profession of ORDERED) if (profession.field === current.field) add(profession);
  for (const profession of ORDERED) add(profession);

  return [...picked.values()];
}

/* -------------------------------------------------------------------------- */
/* Derived data                                                                */
/* -------------------------------------------------------------------------- */

/** The recommended templates, resolved against the registry. Unknown ids are dropped. */
export function getRecommendedTemplates(
  profession: Profession,
): { template: TemplateDefinition; reason: string }[] {
  return profession.templates.flatMap((pick) => {
    const template = findTemplate(pick.id);
    return template ? [{ template, reason: pick.reason }] : [];
  });
}

/** Every human-readable string on a profession page, in roughly reading order. */
function professionText(profession: Profession): string[] {
  return [
    profession.heading,
    profession.intro,
    ...profession.overview,
    ...profession.scanOrder.flatMap((step) => [step.title, step.description]),
    ...profession.metrics.flatMap((metric) => [metric.name, metric.detail]),
    ...profession.sectionPlan.order.flatMap((entry) => [entry.section, entry.note]),
    ...profession.sectionPlan.drop.flatMap((entry) => [entry.section, entry.note]),
    ...profession.rewrites.flatMap((rewrite) => [rewrite.before, rewrite.after, rewrite.change]),
    ...profession.ats.intro,
    ...profession.ats.groups.flatMap((group) => [group.group, ...group.examples]),
    profession.ats.caveat,
    ...profession.mistakes.flatMap((mistake) => [mistake.title, mistake.description]),
    ...profession.templates.map((pick) => pick.reason),
    ...profession.steps.flatMap((step) => [step.name, step.text]),
    profession.us.intro,
    ...profession.us.points,
    ...profession.faq.flatMap((entry) => [entry.question, entry.answer]),
  ];
}

/**
 * Words of visible advice on a profession page.
 *
 * Counted the same way `lib/blog.ts` counts an article — tokens containing a letter or
 * a digit — so the two content types can be held to comparable standards.
 */
export function getProfessionWordCount(profession: Profession): number {
  return professionText(profession)
    .join(' ')
    .split(/\s+/)
    .filter((token) => /[\p{L}\p{N}]/u.test(token)).length;
}
