import 'server-only';

import { uid } from '@/lib/utils/id';
import type { BuiltInSectionId, CVData, LanguageLevel } from '@/types/cv';
import type { AiCv } from './ai';
import type { ParseReport } from './parse';

/**
 * Turning what the model read into a CV this application will store.
 *
 * ## Why the model's output is not simply spread into the document
 *
 * Because it is untrusted input that happens to be well-formed. The schema constrains its
 * *shape*, not its contents: nothing in a JSON Schema stops `startDate` coming back as
 * "summer 2019", a proficiency as "very good", or an achievements array with four hundred
 * entries in it. Every value below is therefore narrowed to something the stored schema will
 * accept, and `cvDataSchema` runs afterwards regardless.
 *
 * Ids are minted here rather than requested. Asking a model for identifiers invites collisions
 * and gains nothing — they are ours, they mean something to the editor, and it has no way to
 * know what a good one looks like.
 */

/** Fields the model may fill on the contact block, in the order the review screen lists them. */
const CONTACT_FIELDS = [
  'firstName',
  'lastName',
  'title',
  'email',
  'phone',
  'location',
  'linkedin',
  'website',
] as const;

export function cvFromModel(
  model: AiCv,
  options: { likelyMultiColumn?: boolean } = {},
): { data: Partial<CVData>; report: ParseReport } {
  const personal = {
    firstName: text(model.personal?.firstName, 60),
    lastName: text(model.personal?.lastName, 60),
    title: text(model.personal?.title, 120),
    email: text(model.personal?.email, 160),
    phone: text(model.personal?.phone, 40),
    location: text(model.personal?.location, 120),
    website: text(model.personal?.website, 200),
    linkedin: text(model.personal?.linkedin, 200),
    github: '',
    photoUrl: '',
    links: [],
  };

  const data: Partial<CVData> = { personal };
  const found: BuiltInSectionId[] = [];
  const partial: BuiltInSectionId[] = [];

  const summary = text(model.summary, 3000);
  if (summary) {
    data.summary = summary;
    found.push('summary');
  }

  const experience = (model.experience ?? []).slice(0, 40).map((job) => ({
    id: uid(),
    role: text(job.role, 160),
    company: text(job.company, 160),
    location: text(job.location, 120),
    startDate: date(job.startDate),
    endDate: job.current ? '' : date(job.endDate),
    current: job.current === true,
    description: '',
    achievements: (job.achievements ?? [])
      .slice(0, 20)
      .map((line) => text(line, 500))
      .filter(Boolean),
    // Not asked for, and deliberately not inferred: tags are the author's own labelling.
    tags: [],
  }));
  if (experience.length) {
    data.experience = experience;
    found.push('experience');
  }

  const education = (model.education ?? []).slice(0, 20).map((entry) => ({
    id: uid(),
    degree: text(entry.degree, 160),
    field: '',
    institution: text(entry.institution, 160),
    location: text(entry.location, 120),
    startDate: date(entry.startDate),
    endDate: date(entry.endDate),
    current: false,
    grade: '',
    description: text(entry.description, 2000),
  }));
  if (education.length) {
    data.education = education;
    found.push('education');
  }

  const skills = (model.skills ?? [])
    .slice(0, 80)
    .map((skill) => ({
      id: uid(),
      name: text(skill.name, 80),
      // Intermediate, not "advanced": the level is almost never stated on the page, and
      // claiming expertise on someone's behalf is the kind of invention this module refuses.
      level: 'intermediate' as const,
      category: text(skill.category, 60),
    }))
    .filter((skill) => skill.name);
  if (skills.length) {
    data.skills = skills;
    found.push('skills');
  }

  const languages = (model.languages ?? [])
    .slice(0, 20)
    .map((language) => ({
      id: uid(),
      name: text(language.name, 60),
      level: languageLevel(language.level),
    }))
    .filter((language) => language.name);
  if (languages.length) {
    data.languages = languages;
    found.push('languages');
  }

  const custom = (model.customSections ?? [])
    .slice(0, 6)
    .map((section) => ({
      id: uid(),
      title: text(section.title, 80),
      items: (section.items ?? [])
        .slice(0, 30)
        .map((item) => ({
          id: uid(),
          heading: text(item.heading, 160),
          subheading: text(item.subheading, 160),
          date: text(item.date, 60),
          description: text(item.description, 2000),
        }))
        .filter((item) => item.heading || item.subheading || item.description),
    }))
    .filter((section) => section.title && section.items.length > 0);
  if (custom.length) data.customSections = custom;

  return {
    data,
    report: {
      found,
      partial,
      custom: custom.map((section) => section.title),
      contact: CONTACT_FIELDS.filter((field) => personal[field]),
      likelyMultiColumn: options.likelyMultiColumn ?? false,
    },
  };
}

/** A string, trimmed, length-capped, and never anything else. */
function text(value: unknown, max: number): string {
  return typeof value === 'string' ? value.replace(/\s+/g, ' ').trim().slice(0, max) : '';
}

/**
 * A date the stored schema will accept, or nothing.
 *
 * The prompt asks for `YYYY-MM` or `YYYY`, and mostly gets it. "Summer 2019", "2019-13" and
 * "01/2019" are what happens the rest of the time — the first two are discarded rather than
 * coerced into a plausible-looking lie, and only the unambiguous forms are rescued.
 */
function date(value: unknown): string {
  const raw = text(value, 30);
  if (!raw) return '';

  const iso = raw.match(/^(\d{4})-(\d{1,2})$/);
  if (iso) {
    const month = Number(iso[2]);
    return month >= 1 && month <= 12 ? `${iso[1]}-${String(month).padStart(2, '0')}` : iso[1]!;
  }

  const slashed = raw.match(/^(\d{1,2})\/(\d{4})$/);
  if (slashed) {
    const month = Number(slashed[1]);
    return month >= 1 && month <= 12
      ? `${slashed[2]}-${String(month).padStart(2, '0')}`
      : slashed[2]!;
  }

  const year = raw.match(/^(19|20)\d{2}$/);
  return year ? year[0] : '';
}

/** Whatever the model called the proficiency, mapped onto the five levels the editor has. */
function languageLevel(value: unknown): LanguageLevel {
  const raw = text(value, 60).normalize('NFD').replace(/[̀-ͯ]/g, '').toLowerCase();

  if (/native|maternelle|mother|mutter|moedertaal|bilingu/.test(raw)) return 'native';
  if (/fluent|courant|full|verhandlungssicher|vloeiend|c[12]\b/.test(raw))
    return 'full-professional';
  if (/intermediate|intermediaire|limited|mittel|redelijk|b1\b/.test(raw)) return 'limited-working';
  if (/basic|notions|elementary|debutant|grund|basis|a[12]\b/.test(raw)) return 'elementary';
  return 'professional-working';
}
