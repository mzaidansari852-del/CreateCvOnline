import { BUILT_IN_SECTION_IDS, type BuiltInSectionId, type CVData } from '@/types/cv';
import type { Locale } from './locales';

/**
 * The section headings a CV prints, per language.
 *
 * Every preview on the French pages was rendering `WORK EXPERIENCE`, `EDUCATION`, `SKILLS`
 * — a French page selling French CV templates, showing an English document. It is the most
 * visible thing on the page and the one a visitor judges the product on.
 *
 * The labels live on the CV data (`cv.sections[].label`), not on the template, because a
 * user can rename any of them. So localising a preview means rewriting those labels, not
 * changing how the template renders. `localiseCv()` does exactly that and nothing else: it
 * never touches the content, which is written per profile and is a separate question.
 *
 * It overwrites a *renamed* label too — the marketing sample calls its skills section
 * "Channels & Tools", and on the French page that becomes "Compétences". Losing the
 * author's phrasing is the lesser problem: an English heading in the middle of a French
 * document is the thing a visitor notices. This only ever runs on the sample CVs the
 * marketing pages render; nobody's saved document passes through it.
 */

const FR_LABELS: Record<BuiltInSectionId, string> = {
  summary: 'Profil',
  competencies: 'Compétences clés',
  experience: 'Expérience professionnelle',
  education: 'Formation',
  skills: 'Compétences',
  languages: 'Langues',
  projects: 'Projets',
  certifications: 'Certifications',
  awards: 'Distinctions',
  volunteer: 'Bénévolat',
  publications: 'Publications',
  interests: 'Centres d’intérêt',
  references: 'Références',
};

/**
 * German headings, in the words a Lebenslauf uses.
 *
 * `Berufserfahrung` rather than a literal rendering of "work experience", `Ausbildung`
 * rather than "education" — these are the standard section names on a tabellarischer
 * Lebenslauf, and using anything else marks the document as a translation.
 */
const DE_LABELS: Record<BuiltInSectionId, string> = {
  summary: 'Profil',
  competencies: 'Kernkompetenzen',
  experience: 'Berufserfahrung',
  education: 'Ausbildung',
  skills: 'Kenntnisse',
  languages: 'Sprachen',
  projects: 'Projekte',
  certifications: 'Zertifikate',
  awards: 'Auszeichnungen',
  volunteer: 'Ehrenamt',
  publications: 'Publikationen',
  interests: 'Interessen',
  references: 'Referenzen',
};

const LABELS: Partial<Record<Locale, Record<BuiltInSectionId, string>>> = {
  fr: FR_LABELS,
  de: DE_LABELS,
};

/** The heading this section prints in `locale`, or `undefined` to leave it alone. */
export function sectionLabel(id: string, locale: Locale): string | undefined {
  if (!(BUILT_IN_SECTION_IDS as readonly string[]).includes(id)) return undefined;
  return LABELS[locale]?.[id as BuiltInSectionId];
}

/**
 * The same CV with its section headings in `locale`.
 *
 * Returns the original object for the default locale, so an English page pays nothing and
 * React sees the identical reference.
 */
export function localiseCv(cv: CVData, locale: Locale): CVData {
  const labels = LABELS[locale];
  if (!labels) return cv;

  return {
    ...cv,
    sections: cv.sections.map((section) => {
      const translated = sectionLabel(section.id, locale);
      return translated ? { ...section, label: translated } : section;
    }),
  };
}
