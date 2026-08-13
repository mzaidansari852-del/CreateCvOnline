import type { CVData } from '@/types/cv';

/**
 * The completeness score, spelled out.
 *
 * `completenessScore()` in `lib/cv/sections.ts` returns a number; this returns the same
 * twelve checks in the same weights as sentences, so the dashboard can say *why* a CV is
 * at 62% instead of only that it is. The two must stay in step — if a check is added
 * there, add it here.
 */

export interface CompletenessCheck {
  id: string;
  /** What is still missing, phrased as an instruction. */
  todo: string;
  /** What is present, phrased as a fact. */
  done: string;
  weight: number;
  satisfied: boolean;
}

export function completenessChecklist(cv: CVData): CompletenessCheck[] {
  const skillsShort = Math.max(0, 5 - cv.skills.length);

  return [
    {
      id: 'name',
      todo: 'Add your first and last name',
      done: 'Name',
      weight: 10,
      satisfied: Boolean(cv.personal.firstName && cv.personal.lastName),
    },
    {
      id: 'headline',
      todo: 'Add a professional headline, such as “Senior Product Designer”',
      done: 'Professional headline',
      weight: 8,
      satisfied: Boolean(cv.personal.title),
    },
    {
      id: 'email',
      todo: 'Add an e-mail address recruiters can reply to',
      done: 'Contact e-mail',
      weight: 8,
      satisfied: Boolean(cv.personal.email),
    },
    {
      id: 'phone',
      todo: 'Add a phone number',
      done: 'Phone number',
      weight: 5,
      satisfied: Boolean(cv.personal.phone),
    },
    {
      id: 'location',
      todo: 'Add your city and country',
      done: 'Location',
      weight: 4,
      satisfied: Boolean(cv.personal.location),
    },
    {
      id: 'summary',
      todo: 'Write a professional summary of at least three lines',
      done: 'Professional summary',
      weight: 15,
      satisfied: cv.summary.trim().length >= 120,
    },
    {
      id: 'experience',
      todo: 'Add at least one role to Work Experience',
      done: 'Work experience',
      weight: 14,
      satisfied: cv.experience.length >= 1,
    },
    {
      id: 'achievements',
      todo: 'Describe what you achieved in a role, not just what you were responsible for',
      done: 'Achievements on a role',
      weight: 10,
      satisfied: cv.experience.some(
        (item) => item.achievements.length > 0 || item.description.length > 80,
      ),
    },
    {
      id: 'education',
      todo: 'Add an entry to Education',
      done: 'Education',
      weight: 10,
      satisfied: cv.education.length >= 1,
    },
    {
      id: 'skills',
      todo:
        skillsShort > 0
          ? `Add ${skillsShort} more skill${skillsShort === 1 ? '' : 's'} (five is the minimum that reads as deliberate)`
          : 'Add at least five skills',
      done: 'Skills',
      weight: 10,
      satisfied: cv.skills.length >= 5,
    },
    {
      id: 'languages',
      todo: 'Add at least one language and your level in it',
      done: 'Languages',
      weight: 3,
      satisfied: cv.languages.length >= 1,
    },
    {
      id: 'extras',
      todo: 'Add a project, certification, award or publication',
      done: 'Projects, certifications or awards',
      weight: 3,
      satisfied:
        cv.projects.length > 0 ||
        cv.certifications.length > 0 ||
        cv.awards.length > 0 ||
        cv.publications.length > 0,
    },
  ];
}

/** The unmet checks, heaviest first — the shortest route to a better score. */
export function topGaps(cv: CVData, limit = 4): CompletenessCheck[] {
  return completenessChecklist(cv)
    .filter((check) => !check.satisfied)
    .sort((a, b) => b.weight - a.weight)
    .slice(0, limit);
}
