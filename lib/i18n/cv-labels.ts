import { BUILT_IN_SECTION_IDS, type BuiltInSectionId, type CVData } from '@/types/cv';
import { LOCALES, type Locale } from './locales';

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

/**
 * The English headings — the source of truth, not a copy of one.
 *
 * `localiseCv` could get away with "no entry means leave it alone", because it only ever
 * ran on marketing samples written in English to begin with. `retitleSections` cannot:
 * switching a CV *back* to English has to know what English looks like, and recognising a
 * heading as untouched means comparing it against every language, including this one.
 *
 * `SECTION_META` used to carry its own `defaultLabel` for each section. Two tables of the
 * same thirteen strings is a drift waiting to happen — and it had already happened, by one
 * word, before a test caught it. `sections.ts` now reads these.
 */
const EN_LABELS: Record<BuiltInSectionId, string> = {
  summary: 'Professional Summary',
  competencies: 'Core Competencies',
  experience: 'Work Experience',
  education: 'Education',
  skills: 'Skills',
  languages: 'Languages',
  projects: 'Projects',
  certifications: 'Certifications',
  awards: 'Awards',
  volunteer: 'Volunteer Experience',
  publications: 'Publications',
  interests: 'Interests',
  references: 'References',
};

/**
 * Dutch headings, in the words a Dutch cv uses.
 *
 * `Werkervaring` and `Opleiding` are the standard pair — not `Werkzaamheden` or
 * `Onderwijs`, which are the literal translations and read as a document run through a
 * dictionary. `Vaardigheden` for skills rather than the English loanword `Skills`, which
 * some Dutch job boards use but which looks careless on the document itself.
 */
const NL_LABELS: Record<BuiltInSectionId, string> = {
  summary: 'Profiel',
  competencies: 'Kerncompetenties',
  experience: 'Werkervaring',
  education: 'Opleiding',
  skills: 'Vaardigheden',
  languages: 'Talen',
  projects: 'Projecten',
  certifications: 'Certificaten',
  awards: 'Onderscheidingen',
  volunteer: 'Vrijwilligerswerk',
  publications: 'Publicaties',
  interests: 'Interesses',
  references: 'Referenties',
};

const LABELS: Record<Locale, Record<BuiltInSectionId, string>> = {
  en: EN_LABELS,
  fr: FR_LABELS,
  de: DE_LABELS,
  nl: NL_LABELS,
};

/** Every heading this section is known to print, in any language. */
function knownLabels(id: BuiltInSectionId): string[] {
  return LOCALES.map((locale) => LABELS[locale][id]);
}

/** The default headings for a CV written in `locale`. */
export function defaultSectionLabels(locale: Locale): Record<BuiltInSectionId, string> {
  return LABELS[locale];
}

/**
 * The same CV with its built-in headings switched to `locale` — but only the ones the
 * user has not renamed.
 *
 * This is the difference between this and `localiseCv`, and it matters because this runs
 * on documents people have written. Someone who renamed "Work Experience" to "Selected
 * Engagements" and then switches the CV to French must keep their wording; silently
 * reverting it would destroy work with no undo.
 *
 * A heading counts as untouched when it matches that section's default in *any* language.
 * That reads oddly at first — why check French when leaving French? — but it is the only
 * way to recognise a heading that arrived from a previous switch. The alternative is
 * storing a "renamed" flag, which every CV written before this feature would lack.
 *
 * A user who deliberately renames their section to the exact French default and then
 * switches to German will see it translate. That is the acknowledged false positive, and
 * it is the harmless direction to be wrong in.
 */
export function retitleSections(cv: CVData, locale: Locale): CVData {
  const labels = LABELS[locale];

  return {
    ...cv,
    sections: cv.sections.map((section) => {
      if (!(BUILT_IN_SECTION_IDS as readonly string[]).includes(section.id)) return section;
      const id = section.id as BuiltInSectionId;
      const renamed = !knownLabels(id).includes(section.label);
      return renamed ? section : { ...section, label: labels[id] };
    }),
  };
}

/** The same CV, retitled and stamped with its new language. */
export function setCvLanguage(cv: CVData, locale: Locale): CVData {
  return { ...retitleSections(cv, locale), language: locale };
}

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
  if (locale === 'en') return cv;

  return {
    ...cv,
    sections: cv.sections.map((section) => {
      const translated = sectionLabel(section.id, locale);
      return translated ? { ...section, label: translated } : section;
    }),
  };
}
