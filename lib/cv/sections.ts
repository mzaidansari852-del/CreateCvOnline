import {
  BUILT_IN_SECTION_IDS,
  type BuiltInSectionId,
  type CVData,
  type SectionConfig,
} from '@/types/cv';

export interface SectionMeta {
  id: BuiltInSectionId;
  defaultLabel: string;
  /** Copy shown in the editor's section list and the "add section" sheet. */
  hint: string;
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
    defaultLabel: 'Professional Summary',
    hint: 'Three or four lines that frame who you are and the value you bring.',
    icon: 'file-text',
    defaultEnabled: true,
    compact: false,
  },
  competencies: {
    id: 'competencies',
    defaultLabel: 'Core Competencies',
    hint: 'Three to six areas of expertise, each with the achievements that prove it. This is what makes a functional CV functional — lead with it and the work history can stay short.',
    icon: 'layers',
    defaultEnabled: false,
    compact: false,
  },
  experience: {
    id: 'experience',
    defaultLabel: 'Work Experience',
    hint: 'Roles, companies, dates and the results you delivered.',
    icon: 'briefcase',
    defaultEnabled: true,
    compact: false,
  },
  education: {
    id: 'education',
    defaultLabel: 'Education',
    hint: 'Degrees, institutions and relevant coursework.',
    icon: 'graduation-cap',
    defaultEnabled: true,
    compact: false,
  },
  skills: {
    id: 'skills',
    defaultLabel: 'Skills',
    hint: 'Hard and soft skills, optionally grouped into categories.',
    icon: 'sparkles',
    defaultEnabled: true,
    compact: true,
  },
  languages: {
    id: 'languages',
    defaultLabel: 'Languages',
    hint: 'Languages you speak and your proficiency in each.',
    icon: 'languages',
    defaultEnabled: true,
    compact: true,
  },
  projects: {
    id: 'projects',
    defaultLabel: 'Projects',
    hint: 'Side projects, open-source work or client deliverables.',
    icon: 'folder-git-2',
    defaultEnabled: false,
    compact: false,
  },
  certifications: {
    id: 'certifications',
    defaultLabel: 'Certifications',
    hint: 'Professional certifications, licences and credentials.',
    icon: 'badge-check',
    defaultEnabled: false,
    compact: true,
  },
  awards: {
    id: 'awards',
    defaultLabel: 'Awards',
    hint: 'Recognition, prizes and honours.',
    icon: 'trophy',
    defaultEnabled: false,
    compact: true,
  },
  volunteer: {
    id: 'volunteer',
    defaultLabel: 'Volunteer Experience',
    hint: 'Unpaid work that demonstrates initiative and values.',
    icon: 'heart-handshake',
    defaultEnabled: false,
    compact: false,
  },
  publications: {
    id: 'publications',
    defaultLabel: 'Publications',
    hint: 'Papers, articles, books and conference talks.',
    icon: 'book-open',
    defaultEnabled: false,
    compact: false,
  },
  interests: {
    id: 'interests',
    defaultLabel: 'Interests',
    hint: 'A short, human line at the end of the document.',
    icon: 'palette',
    defaultEnabled: false,
    compact: true,
  },
  references: {
    id: 'references',
    defaultLabel: 'References',
    hint: 'Referees, or a single "available on request" line.',
    icon: 'quote',
    defaultEnabled: false,
    compact: true,
  },
};

export const ORDERED_SECTION_META: SectionMeta[] = BUILT_IN_SECTION_IDS.map(
  (id) => SECTION_META[id],
);

/** Default section order for a brand-new CV. */
export function defaultSectionConfigs(): SectionConfig[] {
  return BUILT_IN_SECTION_IDS.map((id) => ({
    id,
    label: SECTION_META[id].defaultLabel,
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
    [cv.experience.some((item) => item.achievements.length > 0 || item.description.length > 80), 10],
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
