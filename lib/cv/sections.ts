import {
  BUILT_IN_SECTION_IDS,
  type BuiltInSectionId,
  type CVData,
  type SectionConfig,
} from '@/types/cv';
import { defaultSectionLabels } from '@/lib/i18n/cv-labels';
import { DEFAULT_LOCALE, type Locale } from '@/lib/i18n/locales';

export interface SectionMeta {
  id: BuiltInSectionId;
  /*
   * No `defaultLabel` here. The English headings live in `cv-labels.ts` alongside the
   * French and German ones, because a CV can be written in any of the three and the
   * heading for a section is one fact with three spellings, not an English constant with
   * translations bolted on.
   */
  icon: SectionIconName;
  /** Sections a fresh CV starts with. */
  defaultEnabled: boolean;
  /** Sections templates usually place in a sidebar when they have one. */
  compact: boolean;
}

export type SectionIconName =
  | 'user'
  | 'file-text'
  | 'briefcase'
  | 'graduation-cap'
  | 'sparkles'
  | 'languages'
  | 'folder-git-2'
  | 'badge-check'
  | 'trophy'
  | 'heart-handshake'
  | 'book-open'
  | 'palette'
  | 'quote'
  | 'layers';

export const SECTION_META: Record<BuiltInSectionId, SectionMeta> = {
  summary: {
    id: 'summary',
    icon: 'file-text',
    defaultEnabled: true,
    compact: false,
  },
  competencies: {
    id: 'competencies',
    icon: 'layers',
    defaultEnabled: false,
    compact: false,
  },
  experience: {
    id: 'experience',
    icon: 'briefcase',
    defaultEnabled: true,
    compact: false,
  },
  education: {
    id: 'education',
    icon: 'graduation-cap',
    defaultEnabled: true,
    compact: false,
  },
  skills: {
    id: 'skills',
    icon: 'sparkles',
    defaultEnabled: true,
    compact: true,
  },
  languages: {
    id: 'languages',
    icon: 'languages',
    defaultEnabled: true,
    compact: true,
  },
  projects: {
    id: 'projects',
    icon: 'folder-git-2',
    defaultEnabled: false,
    compact: false,
  },
  certifications: {
    id: 'certifications',
    icon: 'badge-check',
    defaultEnabled: false,
    compact: true,
  },
  awards: {
    id: 'awards',
    icon: 'trophy',
    defaultEnabled: false,
    compact: true,
  },
  volunteer: {
    id: 'volunteer',
    icon: 'heart-handshake',
    defaultEnabled: false,
    compact: false,
  },
  publications: {
    id: 'publications',
    icon: 'book-open',
    defaultEnabled: false,
    compact: false,
  },
  interests: {
    id: 'interests',
    icon: 'palette',
    defaultEnabled: false,
    compact: true,
  },
  references: {
    id: 'references',
    icon: 'quote',
    defaultEnabled: false,
    compact: true,
  },
};

export const ORDERED_SECTION_META: SectionMeta[] = BUILT_IN_SECTION_IDS.map(
  (id) => SECTION_META[id],
);

/** Default section order for a brand-new CV. */
/**
 * The sections a fresh CV starts with, headed in `locale`.
 *
 * A French user signing up used to get a document headed "Work Experience", "Education",
 * "Skills" — and that is what printed in the PDF they sent to employers, which is a worse
 * failure than any untranslated button. The labels already existed; nothing passed them a
 * language.
 */
export function defaultSectionConfigs(locale: Locale = DEFAULT_LOCALE): SectionConfig[] {
  const labels = defaultSectionLabels(locale);
  return BUILT_IN_SECTION_IDS.map((id) => ({
    id,
    label: labels[id],
    enabled: SECTION_META[id].defaultEnabled,
  }));
}

export function isCustomSectionId(id: string): boolean {
  return id.startsWith('custom:');
}

export function customSectionKey(id: string): string {
  return id.slice('custom:'.length);
}

/** True when the section has anything worth rendering. */
export function sectionHasContent(cv: CVData, id: string): boolean {
  if (isCustomSectionId(id)) {
    const key = customSectionKey(id);
    const section = cv.customSections.find((entry) => entry.id === key);
    return Boolean(
      section &&
      section.items.some(
        (item) => item.heading || item.subheading || item.description || item.date,
      ),
    );
  }

  switch (id as BuiltInSectionId) {
    case 'summary':
      return cv.summary.trim().length > 0;
    case 'experience':
      return cv.experience.some((item) => item.role || item.company || item.description);
    case 'education':
      return cv.education.some((item) => item.degree || item.institution);
    case 'skills':
      return cv.skills.some((item) => item.name);
    case 'languages':
      return cv.languages.some((item) => item.name);
    case 'projects':
      return cv.projects.some((item) => item.name || item.description);
    case 'certifications':
      return cv.certifications.some((item) => item.name);
    case 'awards':
      return cv.awards.some((item) => item.title);
    case 'volunteer':
      return cv.volunteer.some((item) => item.role || item.organization);
    case 'publications':
      return cv.publications.some((item) => item.title);
    case 'competencies':
      return cv.competencies.some(
        (item) => item.name || item.description || item.achievements.length > 0,
      );
    case 'interests':
      return cv.interests.some((item) => item.name);
    case 'references':
      return cv.references.some((item) => item.name);
    default:
      return false;
  }
}

export interface ResolvedSection {
  id: string;
  label: string;
  /** True for sections templates typically render in a narrow column. */
  compact: boolean;
}

/**
 * The ordered list of sections a template should render: enabled, non-empty and
 * de-duplicated. Templates never inspect `cv.sections` directly.
 */
export function visibleSections(cv: CVData): ResolvedSection[] {
  const seen = new Set<string>();
  const resolved: ResolvedSection[] = [];

  for (const config of cv.sections) {
    if (!config.enabled) continue;
    if (seen.has(config.id)) continue;
    if (!sectionHasContent(cv, config.id)) continue;
    seen.add(config.id);
    resolved.push({
      id: config.id,
      label: config.label,
      compact: isCustomSectionId(config.id)
        ? false
        : (SECTION_META[config.id as BuiltInSectionId]?.compact ?? false),
    });
  }

  return resolved;
}

/**
 * Splits the visible sections into a main column and a sidebar column for
 * two-column templates. `sidebarIds` wins over the `compact` heuristic.
 */
export function splitSections(
  sections: ResolvedSection[],
  sidebarIds: readonly string[],
): { main: ResolvedSection[]; aside: ResolvedSection[] } {
  const wanted = new Set(sidebarIds);
  const main: ResolvedSection[] = [];
  const aside: ResolvedSection[] = [];
  for (const section of sections) {
    if (wanted.has(section.id)) aside.push(section);
    else main.push(section);
  }
  return { main, aside };
}

/** 0–100 completeness score used by the dashboard and the editor sidebar. */
export function completenessScore(cv: CVData): number {
  const checks: [boolean, number][] = [
    [Boolean(cv.personal.firstName && cv.personal.lastName), 10],
    [Boolean(cv.personal.title), 8],
    [Boolean(cv.personal.email), 8],
    [Boolean(cv.personal.phone), 5],
    [Boolean(cv.personal.location), 4],
    [cv.summary.trim().length >= 120, 15],
    [cv.experience.length >= 1, 14],
    [
      cv.experience.some((item) => item.achievements.length > 0 || item.description.length > 80),
      10,
    ],
    [cv.education.length >= 1, 10],
    [cv.skills.length >= 5, 10],
    [cv.languages.length >= 1, 3],
    [
      cv.projects.length > 0 ||
        cv.certifications.length > 0 ||
        cv.awards.length > 0 ||
        cv.publications.length > 0,
      3,
    ],
  ];

  const total = checks.reduce((sum, [, weight]) => sum + weight, 0);
  const earned = checks.reduce((sum, [passed, weight]) => sum + (passed ? weight : 0), 0);
  return Math.round((earned / total) * 100);
}
