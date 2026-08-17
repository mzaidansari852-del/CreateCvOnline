/**
 * Getting a human's idea of a date into the one shape the schema accepts.
 *
 * ## The failure this exists for
 *
 * CV dates are stored as `YYYY`, `YYYY-MM` or `YYYY-MM-DD` — partial on purpose, because
 * "2019" is a truthful thing to say about a degree and a full date is not. `partialDateSchema`
 * enforces exactly that, and the editor collects it with `<input type="month">`, which by
 * definition can only produce `YYYY-MM`.
 *
 * Except when it can't. A browser without a month picker renders `type="month"` as a plain
 * text box, and then it collects whatever a person types. A user on Firefox filled in their
 * education, wrote the date the way a date is written, and every autosave from that moment
 * was refused with a 422 — the value went back up unchanged on every retry, so the editor
 * could never recover on its own. It cost them a complete CV.
 *
 * Rejecting the input was correct and useless. This is the missing half: understand what
 * they meant.
 *
 * ## What it will and will not guess
 *
 * It normalises the forms people actually write — `01/2022`, `2022/01`, `Jan 2022`,
 * `janvier 2022`, `March 2019`, `2023 - 2024` — and it refuses to invent precision. A value
 * carrying only a year comes back as a year. An input it cannot read comes back as `null`,
 * which the caller treats as "leave the field empty" rather than as a date, because a wrong
 * date on a CV is worse than a missing one.
 *
 * Month names are matched in the three languages the product ships in. Not a locale library:
 * the whole task is a three-letter prefix match against thirty-six words, and pulling in a
 * date library to do it would ship more code than the CV templates.
 */

/** The shape `partialDateSchema` accepts. Kept here so the editor can check before sending. */
const VALID = /^\d{4}(-(0[1-9]|1[0-2])(-(0[1-9]|[12]\d|3[01]))?)?$/;

/** Three-letter prefixes are enough to separate all twelve in en, fr and de. */
const MONTH_PREFIXES: Record<string, number> = {
  jan: 1,
  fév: 2,
  fev: 2,
  feb: 2,
  mar: 3,
  mär: 3,
  avr: 4,
  apr: 4,
  mai: 5,
  may: 5,
  jun: 6,
  jui: 6,
  jul: 7,
  aug: 8,
  aoû: 8,
  aou: 8,
  sep: 9,
  okt: 10,
  oct: 10,
  nov: 11,
  déc: 12,
  dec: 12,
  dez: 12,
};

/**
 * `juin` and `juillet` both start `jui`, so the generic table cannot separate them.
 * Checked first, and only for French, where the ambiguity exists.
 */
function frenchJune(text: string): number | null {
  if (/\bjuil/.test(text)) return 7;
  if (/\bjuin\b/.test(text)) return 6;
  return null;
}

export function isValidPartialDate(value: string): boolean {
  return value === '' || VALID.test(value);
}

/**
 * Best reading of a hand-typed date, or `null` when there isn't one.
 *
 * Returns `''` for empty input — an empty date is valid and means "not stated", which is a
 * different answer from "could not be understood".
 */
export function normalisePartialDate(input: string): string | null {
  const raw = input.trim();
  if (raw === '') return '';
  if (VALID.test(raw)) return raw;

  const text = raw.toLowerCase();

  /*
   * A range in one box — "2023 - 2024", "2023 à 2024". Two years were typed into a field
   * that holds one, so the field takes the one it is: a start date means the first.
   * The caller knows which end it asked for; here, taking the first year is right for
   * `startDate` and the user can correct an end date, which is strictly better than
   * refusing to save at all.
   */
  const years = [...text.matchAll(/\b(19|20)\d{2}\b/g)].map((m) => Number(m[0]));
  const year = years[0];
  if (year === undefined) return null;

  // A month, if one was named or written as a number beside the year.
  let month: number | null = frenchJune(text);
  if (month === null) {
    for (const [prefix, value] of Object.entries(MONTH_PREFIXES)) {
      if (text.includes(prefix)) {
        month = value;
        break;
      }
    }
  }
  if (month === null) {
    // `01/2022`, `2022-01`, `1.2022` — a 1–2 digit number adjacent to the year.
    const numeric =
      /\b(\d{1,2})\s*[/.\-]\s*(?:19|20)\d{2}\b/.exec(text) ??
      /\b(?:19|20)\d{2}\s*[/.\-]\s*(\d{1,2})\b/.exec(text);
    if (numeric?.[1]) {
      const candidate = Number(numeric[1]);
      // 13 is not a month. Two years separated by a dash land here too, and are left alone.
      if (candidate >= 1 && candidate <= 12) month = candidate;
    }
  }

  return month === null ? String(year) : `${year}-${String(month).padStart(2, '0')}`;
}
