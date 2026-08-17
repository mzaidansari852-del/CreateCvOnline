import type { CVData } from '@/types/cv';

/**
 * Turns a server field path into something a person can act on.
 *
 * ## Why this is worth a file
 *
 * A user completed an entire CV while every autosave was refused. The editor said
 * "Some of the submitted values are not valid", which is true, unlocalised, and useless:
 * fifteen sections, no indication which one. They could not have found it by looking, and
 * retrying could never fix it.
 *
 * The server knew. `toErrorResponse` maps every Zod issue to a path and a message, so the
 * response body already said `data.experience.0.startDate — Use YYYY, YYYY-MM or
 * YYYY-MM-DD`. That reached the browser and was discarded one layer below the screen.
 *
 * ## Where the words come from
 *
 * The section name is read from the document's own `sections` array rather than from
 * interface copy. That array holds the labels the templates print — already in the CV's
 * language, and already carrying any renaming the author did — so "Expérience
 * professionnelle" comes out of the CV itself rather than out of a translation table that
 * would disagree with what is on the page.
 *
 * Nothing here is decorative. A path that cannot be resolved is shown raw, because
 * `data.projects.2.endDate` is still enormously more useful than a shrug.
 */

export interface FieldIssue {
  path: string;
  message: string;
}

/** `Use YYYY, …` is the only rule a normal author trips over, so it gets real wording. */
export interface IssueCopy {
  /** e.g. `(label, index) => "Expérience professionnelle — entrée 2"` */
  entry: (sectionLabel: string, index: number) => string;
  dateFormat: string;
  tooLong: string;
}

const DATE_FIELDS = new Set(['startDate', 'endDate', 'date', 'expiryDate']);

/**
 * Field keys, humanised as a fallback.
 *
 * Deliberately not a translation table. The per-section field labels already exist in the
 * editor copy, but reaching them from a path means mapping every section to its own copy
 * object and keeping that map in step with the schema — a table that would silently rot.
 * A camel-case key split into words is understood by anyone looking at the form beside it,
 * and it cannot go stale.
 */
function humaniseField(key: string): string {
  // Lower-cased throughout, not just at the front: splitting `expiryDate` leaves the `D`
  // capitalised mid-phrase, which reads as a typo rather than as a field name.
  return key
    .replace(/([a-z0-9])([A-Z])/g, '$1 $2')
    .toLowerCase()
    .trim();
}

/** The label the document itself gives a section, falling back to the schema key. */
function sectionLabel(data: CVData, key: string): string {
  return data.sections.find((section) => section.id === key)?.label ?? humaniseField(key);
}

/**
 * One readable line per rejected field, de-duplicated.
 *
 * Zod reports both `Too big` and the format refinement for a single bad date, which would
 * otherwise print the same field twice with two different complaints — so the lines are
 * keyed by field and the most actionable message wins.
 */
export function describeIssues(
  issues: readonly FieldIssue[],
  data: CVData,
  copy: IssueCopy,
): string[] {
  const byField = new Map<string, string>();

  for (const issue of issues) {
    // `data.experience.0.startDate` → ['experience', '0', 'startDate']
    const parts = issue.path.split('.').filter((part) => part !== 'data' && part !== '');
    if (parts.length === 0) continue;

    const field = parts[parts.length - 1] ?? '';
    const index = parts.find((part) => /^\d+$/.test(part));
    const section = parts[0] ?? '';

    const rule = DATE_FIELDS.has(field)
      ? copy.dateFormat
      : /too big|at most|<=/i.test(issue.message)
        ? copy.tooLong
        : issue.message;

    const where =
      index === undefined
        ? sectionLabel(data, section)
        : copy.entry(sectionLabel(data, section), Number(index) + 1);

    const line = `${where} · ${humaniseField(field)} — ${rule}`;
    // First writer wins per field, and the date rule is checked first, so a double-reported
    // date lands on its format message rather than on "too long".
    if (!byField.has(`${section}.${index ?? ''}.${field}`)) {
      byField.set(`${section}.${index ?? ''}.${field}`, line);
    }
  }

  return [...byField.values()];
}
