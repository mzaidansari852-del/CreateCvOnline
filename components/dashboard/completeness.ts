import {
  DASHBOARD_COPY,
  type CompletenessCheckId,
  type DashboardCopy,
} from '@/lib/i18n/copy/dashboard';
import { DEFAULT_LOCALE } from '@/lib/i18n/locales';
import type { CVData } from '@/types/cv';

/**
 * The completeness score, spelled out.
 *
 * `completenessScore()` in `lib/cv/sections.ts` returns a number; this returns the same
 * twelve checks in the same weights as sentences, so the dashboard can say *why* a CV is
 * at 62% instead of only that it is. The two must stay in step — if a check is added
 * there, add it here.
 *
 * Only the ids and the weights live here. The sentences are in `copy/dashboard.ts` keyed
 * by id, which is what makes them translatable at all: this is a plain module, so it has
 * no hook to reach the reader's language with, and the checks are consumed by server
 * components that resolve the language themselves.
 */

export interface CompletenessCheck {
  id: CompletenessCheckId;
  /** What is still missing, phrased as an instruction. */
  todo: string;
  /** What is present, phrased as a fact. */
  done: string;
  weight: number;
  satisfied: boolean;
}

/**
 * The twelve checks against `cv`, each already worded in `copy`'s language.
 *
 * `copy` is optional so that a caller with no language to hand still gets sentences: the
 * fallback is English, the same trade `useCopy()` makes outside a provider, and for the
 * same reason — a checklist in the wrong language is worth less than a page that renders.
 * Every caller that has `copy` should pass it.
 */
export function completenessChecklist(
  cv: CVData,
  copy: DashboardCopy = DASHBOARD_COPY[DEFAULT_LOCALE],
): CompletenessCheck[] {
  const { checkTodo, checkDone, skillsShortTodo } = copy.cvs;
  const skillsShort = Math.max(0, 5 - cv.skills.length);

  return [
    {
      id: 'name',
      todo: checkTodo.name,
      done: checkDone.name,
      weight: 10,
      satisfied: Boolean(cv.personal.firstName && cv.personal.lastName),
    },
    {
      id: 'headline',
      todo: checkTodo.headline,
      done: checkDone.headline,
      weight: 8,
      satisfied: Boolean(cv.personal.title),
    },
    {
      id: 'email',
      todo: checkTodo.email,
      done: checkDone.email,
      weight: 8,
      satisfied: Boolean(cv.personal.email),
    },
    {
      id: 'phone',
      todo: checkTodo.phone,
      done: checkDone.phone,
      weight: 5,
      satisfied: Boolean(cv.personal.phone),
    },
    {
      id: 'location',
      todo: checkTodo.location,
      done: checkDone.location,
      weight: 4,
      satisfied: Boolean(cv.personal.location),
    },
    {
      id: 'summary',
      todo: checkTodo.summary,
      done: checkDone.summary,
      weight: 15,
      satisfied: cv.summary.trim().length >= 120,
    },
    {
      id: 'experience',
      todo: checkTodo.experience,
      done: checkDone.experience,
      weight: 14,
      satisfied: cv.experience.length >= 1,
    },
    {
      id: 'achievements',
      todo: checkTodo.achievements,
      done: checkDone.achievements,
      weight: 10,
      satisfied: cv.experience.some(
        (item) => item.achievements.length > 0 || item.description.length > 80,
      ),
    },
    {
      id: 'education',
      todo: checkTodo.education,
      done: checkDone.education,
      weight: 10,
      satisfied: cv.education.length >= 1,
    },
    {
      id: 'skills',
      todo: skillsShort > 0 ? skillsShortTodo(skillsShort) : checkTodo.skills,
      done: checkDone.skills,
      weight: 10,
      satisfied: cv.skills.length >= 5,
    },
    {
      id: 'languages',
      todo: checkTodo.languages,
      done: checkDone.languages,
      weight: 3,
      satisfied: cv.languages.length >= 1,
    },
    {
      id: 'extras',
      todo: checkTodo.extras,
      done: checkDone.extras,
      weight: 3,
      satisfied:
        cv.projects.length > 0 ||
        cv.certifications.length > 0 ||
        cv.awards.length > 0 ||
        cv.publications.length > 0,
    },
  ];
}

/**
 * The unmet checks, heaviest first — the shortest route to a better score.
 *
 * `copy` trails `limit` rather than following `cv`, so that the argument order callers
 * already write keeps meaning what it did.
 */
export function topGaps(cv: CVData, limit = 4, copy?: DashboardCopy): CompletenessCheck[] {
  return completenessChecklist(cv, copy)
    .filter((check) => !check.satisfied)
    .sort((a, b) => b.weight - a.weight)
    .slice(0, limit);
}
