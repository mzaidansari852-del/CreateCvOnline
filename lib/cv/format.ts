import type {
  CVCustomization,
  CVData,
  DateFormatKey,
  FontKey,
  LanguageLevel,
  PaperSize,
  SkillLevel,
} from '@/types/cv';
import { DEFAULT_LOCALE, type Locale } from '@/lib/i18n/locales';

/* -------------------------------------------------------------------------- */
/* Fonts                                                                       */
/* -------------------------------------------------------------------------- */

export interface FontDefinition {
  key: FontKey;
  label: string;
  stack: string;
  /** Google Fonts family + axis spec; `null` for web-safe system fonts. */
  googleSpec: string | null;
  kind: 'sans' | 'serif' | 'mono';
}

export const CV_FONTS: readonly FontDefinition[] = [
  {
    key: 'inter',
    label: 'Inter',
    stack: "'Inter', system-ui, -apple-system, 'Segoe UI', sans-serif",
    googleSpec: 'Inter:wght@300;400;500;600;700',
    kind: 'sans',
  },
  {
    key: 'roboto',
    label: 'Roboto',
    stack: "'Roboto', system-ui, Arial, sans-serif",
    googleSpec: 'Roboto:wght@300;400;500;700',
    kind: 'sans',
  },
  {
    key: 'open-sans',
    label: 'Open Sans',
    stack: "'Open Sans', system-ui, Arial, sans-serif",
    googleSpec: 'Open+Sans:wght@300;400;600;700',
    kind: 'sans',
  },
  {
    key: 'lato',
    label: 'Lato',
    stack: "'Lato', system-ui, Arial, sans-serif",
    googleSpec: 'Lato:wght@300;400;700;900',
    kind: 'sans',
  },
  {
    key: 'poppins',
    label: 'Poppins',
    stack: "'Poppins', system-ui, sans-serif",
    googleSpec: 'Poppins:wght@300;400;500;600;700',
    kind: 'sans',
  },
  {
    key: 'ibm-plex-sans',
    label: 'IBM Plex Sans',
    stack: "'IBM Plex Sans', system-ui, sans-serif",
    googleSpec: 'IBM+Plex+Sans:wght@300;400;500;600;700',
    kind: 'sans',
  },
  {
    key: 'source-serif',
    label: 'Source Serif 4',
    stack: "'Source Serif 4', Georgia, 'Times New Roman', serif",
    googleSpec: 'Source+Serif+4:opsz,wght@8..60,300;8..60,400;8..60,600;8..60,700',
    kind: 'serif',
  },
  {
    key: 'merriweather',
    label: 'Merriweather',
    stack: "'Merriweather', Georgia, serif",
    googleSpec: 'Merriweather:wght@300;400;700',
    kind: 'serif',
  },
  {
    key: 'lora',
    label: 'Lora',
    stack: "'Lora', Georgia, serif",
    googleSpec: 'Lora:wght@400;500;600;700',
    kind: 'serif',
  },
  {
    key: 'playfair',
    label: 'Playfair Display',
    stack: "'Playfair Display', Georgia, serif",
    googleSpec: 'Playfair+Display:wght@400;500;600;700',
    kind: 'serif',
  },
  {
    key: 'libre-baskerville',
    label: 'Libre Baskerville',
    stack: "'Libre Baskerville', Georgia, serif",
    googleSpec: 'Libre+Baskerville:wght@400;700',
    kind: 'serif',
  },
  {
    key: 'georgia',
    label: 'Georgia',
    stack: "Georgia, 'Times New Roman', serif",
    googleSpec: null,
    kind: 'serif',
  },
  {
    key: 'garamond',
    label: 'EB Garamond',
    stack: "'EB Garamond', Garamond, Georgia, serif",
    googleSpec: 'EB+Garamond:wght@400;500;600;700',
    kind: 'serif',
  },
  {
    key: 'arial',
    label: 'Arial',
    stack: "Arial, Helvetica, 'Liberation Sans', sans-serif",
    googleSpec: null,
    kind: 'sans',
  },
  {
    key: 'times',
    label: 'Times New Roman',
    stack: "'Times New Roman', Times, serif",
    googleSpec: null,
    kind: 'serif',
  },
] as const;

const FONT_BY_KEY = new Map<FontKey, FontDefinition>(CV_FONTS.map((font) => [font.key, font]));

export function fontStack(key: FontKey): string {
  return FONT_BY_KEY.get(key)?.stack ?? CV_FONTS[0]!.stack;
}

export function fontLabel(key: FontKey): string {
  return FONT_BY_KEY.get(key)?.label ?? key;
}

/**
 * The weights a face can actually render, read off the same `googleSpec` that loads it.
 *
 * This exists because the catalogue was asking for weights that do not exist. Twenty-six
 * of the fifty-six templates requested a weight their face never loads — `fontWeight: 800`
 * appeared twenty-nine times and *no* family in the picker ships an 800 — so the browser
 * synthesised it by smearing the 700 outline. Faux bold is why 700 and 800 looked the same
 * on the page: 800 was 700, blurred. The same happened to `600` on Roboto, Lato,
 * Merriweather, Libre Baskerville and the three system faces.
 *
 * A face's real weights are not a detail a template can hardcode, because the user can put
 * any of the fifteen faces on any template. So the weight has to be resolved at render time
 * against whichever face is actually active — the same shape as `contrastAgainst()`
 * resolving a colour against whatever surface it lands on.
 *
 * System faces get `[400, 700]`: regular and bold are the two cuts of Arial, Georgia and
 * Times that can be relied on to exist locally.
 */
const SYSTEM_WEIGHTS: readonly number[] = [400, 700];

export const FONT_WEIGHTS: Record<FontKey, readonly number[]> = Object.fromEntries(
  CV_FONTS.map((font) => {
    if (!font.googleSpec) return [font.key, SYSTEM_WEIGHTS];
    // `Source+Serif+4:opsz,wght@8..60,300;8..60,400;…` — the weight is the last number in
    // each tuple, so read the axis list rather than every number in the string.
    const axes = font.googleSpec.split('@')[1] ?? '';
    const weights = axes
      .split(';')
      .map((tuple) => Number(tuple.split(',').pop()))
      .filter((weight) => Number.isFinite(weight) && weight >= 100 && weight <= 900);
    return [font.key, weights.length ? [...new Set(weights)].sort((a, b) => a - b) : SYSTEM_WEIGHTS];
  }),
) as Record<FontKey, readonly number[]>;

/**
 * The closest weight `face` can really draw.
 *
 * Ties resolve toward 700, the canonical bold. That single rule gets both awkward cases
 * right: 600 on a face that has only 400 and 700 wants the bold, because the intent was
 * emphasis — while 800 on Lato, which has 700 and 900, wants the bold too, because Black
 * overshoots by more than Bold undershoots.
 */
export function weightOn(face: FontKey, desired: number): number {
  const available = FONT_WEIGHTS[face] ?? SYSTEM_WEIGHTS;
  let best = available[0]!;
  for (const weight of available) {
    const gap = Math.abs(weight - desired);
    const bestGap = Math.abs(best - desired);
    const closer = gap < bestGap;
    const tieNearerBold = gap === bestGap && Math.abs(weight - 700) < Math.abs(best - 700);
    if (closer || tieNearerBold) best = weight;
  }
  return best;
}

/**
 * Resolve a weight against the heading face. Use inside `h1`–`h6`, which `document-css.ts`
 * sets to `--cv-font-heading`.
 */
export function headingWeight(c: { headingFont: FontKey }, desired: number): number {
  return weightOn(c.headingFont, desired);
}

/** Resolve a weight against the body face — everything that is not a heading element. */
export function bodyWeight(c: { bodyFont: FontKey }, desired: number): number {
  return weightOn(c.bodyFont, desired);
}

/** Google Fonts stylesheet URL covering exactly the families a document needs. */
export function googleFontsHref(keys: FontKey[]): string | null {
  const specs = Array.from(new Set(keys))
    .map((key) => FONT_BY_KEY.get(key)?.googleSpec)
    .filter((spec): spec is string => Boolean(spec));
  if (specs.length === 0) return null;
  return `https://fonts.googleapis.com/css2?${specs
    .map((spec) => `family=${spec}`)
    .join('&')}&display=swap`;
}

/* -------------------------------------------------------------------------- */
/* Paper                                                                       */
/* -------------------------------------------------------------------------- */

export interface PaperGeometry {
  /** CSS px at 96 dpi. */
  width: number;
  height: number;
  /** Value for the CSS `size` descriptor / Puppeteer `format`. */
  cssSize: string;
  puppeteerFormat: 'A4' | 'Letter';
  label: string;
}

export const PAPER: Record<PaperSize, PaperGeometry> = {
  a4: { width: 794, height: 1123, cssSize: 'A4', puppeteerFormat: 'A4', label: 'A4 (210 × 297 mm)' },
  letter: {
    width: 816,
    height: 1056,
    cssSize: 'Letter',
    puppeteerFormat: 'Letter',
    label: 'US Letter (8.5 × 11 in)',
  },
};

/* -------------------------------------------------------------------------- */
/* Dates                                                                       */
/* -------------------------------------------------------------------------- */

/**
 * Month names, written out rather than taken from `Intl`.
 *
 * `toLocaleDateString` would be the obvious source and is the wrong one here. These strings
 * are printed into a PDF rendered by headless Chromium, and ICU data differs between the
 * local Chromium, the one on Vercel and the Lambda build — so the same CV could come out
 * with different month names depending on where it was exported. A CV is a document
 * somebody archives and re-downloads a year later; it has to be byte-stable.
 *
 * French and German lower-case their months. That is correct, not an oversight: only
 * German nouns are capitalised and month names in running text follow the sentence, while
 * French never capitalises them. Getting this wrong is a visible tell that a document was
 * translated by someone who did not speak the language.
 */
const MONTHS_SHORT: Record<Locale, string[]> = {
  en: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'],
  fr: ['janv.', 'févr.', 'mars', 'avr.', 'mai', 'juin', 'juil.', 'août', 'sept.', 'oct.', 'nov.', 'déc.'],
  de: ['Jan.', 'Feb.', 'März', 'Apr.', 'Mai', 'Juni', 'Juli', 'Aug.', 'Sep.', 'Okt.', 'Nov.', 'Dez.'],
  nl: ['jan.', 'feb.', 'mrt.', 'apr.', 'mei', 'jun.', 'jul.', 'aug.', 'sep.', 'okt.', 'nov.', 'dec.'],
};

const MONTHS_LONG: Record<Locale, string[]> = {
  en: [
    'January',
    'February',
    'March',
    'April',
    'May',
    'June',
    'July',
    'August',
    'September',
    'October',
    'November',
    'December',
  ],
  fr: [
    'janvier',
    'février',
    'mars',
    'avril',
    'mai',
    'juin',
    'juillet',
    'août',
    'septembre',
    'octobre',
    'novembre',
    'décembre',
  ],
  de: [
    'Januar',
    'Februar',
    'März',
    'April',
    'Mai',
    'Juni',
    'Juli',
    'August',
    'September',
    'Oktober',
    'November',
    'Dezember',
  ],
  // Dutch lower-cases its months too, for the same reason French does.
  nl: [
    'januari',
    'februari',
    'maart',
    'april',
    'mei',
    'juni',
    'juli',
    'augustus',
    'september',
    'oktober',
    'november',
    'december',
  ],
};

/**
 * What an ongoing role is called.
 *
 * `heute` rather than a literal rendering of "present" — that is what a Lebenslauf says.
 * French uses `aujourd'hui` with a typographic apostrophe, matching the rest of the app.
 */
const PRESENT_LABEL: Record<Locale, string> = {
  en: 'Present',
  fr: 'aujourd’hui',
  de: 'heute',
  nl: 'heden',
};

/**
 * What the masthead shows before a name has been typed.
 *
 * Fifty-nine of the sixty-one templates carried the string `'Your Name'` inline. On an
 * empty French CV that is the single largest piece of text on the page, set at 30-odd
 * points — the first thing anyone sees, in the wrong language.
 */
const PLACEHOLDER_NAME: Record<Locale, string> = {
  en: 'Your Name',
  fr: 'Votre nom',
  de: 'Ihr Name',
  nl: 'Jouw naam',
};

/**
 * What a screen reader says about the photograph on a CV.
 *
 * It was `${name} profile photo`, hardcoded — so a Dutch CV carried English alt text, and
 * carried it into the exported PDF, where it is the one piece of text a sighted reader
 * never sees and an assistive one always does.
 *
 * The name is not translated, obviously; the noun around it is.
 */
const PHOTO_ALT: Record<Locale, (name: string) => string> = {
  en: (name) => (name ? `${name} — profile photo` : 'Profile photo'),
  fr: (name) => (name ? `${name} — photo d’identité` : 'Photo d’identité'),
  de: (name) => (name ? `${name} — Bewerbungsfoto` : 'Bewerbungsfoto'),
  nl: (name) => (name ? `${name} — pasfoto` : 'Pasfoto'),
};

/** The alt text for a CV's profile photo, in the language the document is written in. */
export function photoAlt(name: string, locale: Locale): string {
  return (PHOTO_ALT[locale] ?? PHOTO_ALT[DEFAULT_LOCALE])(name.trim());
}

/** The name to print: the applicant's, or the placeholder in the document's language. */
export function displayName(cv: CVData): string {
  return fullName(cv) || PLACEHOLDER_NAME[cv.language];
}

/** The long month name in `locale` — `''` for an index outside 0–11. */
export function monthName(index: number, locale: Locale = DEFAULT_LOCALE): string {
  return MONTHS_LONG[locale][index] ?? '';
}

/**
 * Formats a partial `YYYY[-MM[-DD]]` value.
 * Returns `''` for empty input so templates can decide what to render.
 */
export function formatPartialDate(
  value: string,
  format: DateFormatKey = 'month-year-short',
  locale: Locale = DEFAULT_LOCALE,
): string {
  const trimmedValue = value?.trim();
  if (!trimmedValue) return '';

  const match = /^(\d{4})(?:-(\d{2}))?(?:-(\d{2}))?$/.exec(trimmedValue);
  if (!match) return trimmedValue;

  const year = match[1]!;
  const monthRaw = match[2];
  if (!monthRaw || format === 'year-only') return year;

  const monthIndex = Number.parseInt(monthRaw, 10) - 1;
  if (monthIndex < 0 || monthIndex > 11) return year;

  switch (format) {
    case 'numeric':
      return `${monthRaw}/${year}`;
    case 'month-year-long':
      return `${MONTHS_LONG[locale][monthIndex]} ${year}`;
    case 'month-year-short':
    default:
      return `${MONTHS_SHORT[locale][monthIndex]} ${year}`;
  }
}

/**
 * `Jan 2021 – Present`, `janv. 2021 – aujourd’hui`, `2019 – 2021`.
 *
 * Takes the document's language rather than a `presentLabel` string, which is what it used
 * to take. Every caller passed the default, so nothing was choosing a label — and a caller
 * that translated "Present" while the month names stayed English would have produced a
 * half-translated date, which is worse than a consistently English one.
 */
export function formatDateRange(
  start: string,
  end: string,
  current: boolean,
  format: DateFormatKey = 'month-year-short',
  locale: Locale = DEFAULT_LOCALE,
  separator = ' – ',
): string {
  const from = formatPartialDate(start, format, locale);
  const to = current ? PRESENT_LABEL[locale] : formatPartialDate(end, format, locale);
  if (from && to) return `${from}${separator}${to}`;
  return from || to || '';
}

/** Human-friendly "2 yrs 4 mos" duration, or '' when it cannot be computed. */
export function formatDuration(start: string, end: string, current: boolean): string {
  const parse = (value: string): { y: number; m: number } | null => {
    const match = /^(\d{4})(?:-(\d{2}))?/.exec(value.trim());
    if (!match) return null;
    return { y: Number.parseInt(match[1]!, 10), m: match[2] ? Number.parseInt(match[2], 10) : 1 };
  };

  const from = parse(start);
  if (!from) return '';

  const now = new Date();
  const to = current ? { y: now.getFullYear(), m: now.getMonth() + 1 } : parse(end);
  if (!to) return '';

  let months = (to.y - from.y) * 12 + (to.m - from.m);
  if (months < 0) return '';
  months += 1;

  const years = Math.floor(months / 12);
  const remaining = months % 12;
  const parts: string[] = [];
  if (years > 0) parts.push(`${years} yr${years > 1 ? 's' : ''}`);
  if (remaining > 0) parts.push(`${remaining} mo${remaining > 1 ? 's' : ''}`);
  return parts.join(' ');
}

/** Locale-aware absolute date for UI chrome (not for CV documents). */
export function formatDateTime(iso: string, locale = 'en'): string {
  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) return '—';
  return new Intl.DateTimeFormat(locale, { dateStyle: 'medium', timeStyle: 'short' }).format(date);
}

export function formatRelativeTime(iso: string, locale = 'en'): string {
  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) return '—';

  const diffSeconds = Math.round((date.getTime() - Date.now()) / 1000);
  const units: [Intl.RelativeTimeFormatUnit, number][] = [
    ['year', 60 * 60 * 24 * 365],
    ['month', 60 * 60 * 24 * 30],
    ['week', 60 * 60 * 24 * 7],
    ['day', 60 * 60 * 24],
    ['hour', 60 * 60],
    ['minute', 60],
  ];

  const formatter = new Intl.RelativeTimeFormat(locale, { numeric: 'auto' });
  for (const [unit, seconds] of units) {
    if (Math.abs(diffSeconds) >= seconds) {
      return formatter.format(Math.round(diffSeconds / seconds), unit);
    }
  }
  return formatter.format(0, 'second');
}

/* -------------------------------------------------------------------------- */
/* Levels                                                                      */
/* -------------------------------------------------------------------------- */

export const SKILL_LEVELS: { value: SkillLevel; label: string; percent: number; dots: number }[] = [
  { value: 'beginner', label: 'Beginner', percent: 20, dots: 1 },
  { value: 'elementary', label: 'Elementary', percent: 40, dots: 2 },
  { value: 'intermediate', label: 'Intermediate', percent: 60, dots: 3 },
  { value: 'advanced', label: 'Advanced', percent: 80, dots: 4 },
  { value: 'expert', label: 'Expert', percent: 100, dots: 5 },
];

const SKILL_LEVEL_MAP = new Map(SKILL_LEVELS.map((level) => [level.value, level]));

export function skillPercent(level: SkillLevel): number {
  return SKILL_LEVEL_MAP.get(level)?.percent ?? 80;
}
export function skillDots(level: SkillLevel): number {
  return SKILL_LEVEL_MAP.get(level)?.dots ?? 4;
}
export function skillLabel(level: SkillLevel): string {
  return SKILL_LEVEL_MAP.get(level)?.label ?? 'Advanced';
}

export const LANGUAGE_LEVELS: {
  value: LanguageLevel;
  label: string;
  short: string;
  percent: number;
}[] = [
  { value: 'elementary', label: 'Elementary', short: 'A1–A2', percent: 25 },
  { value: 'limited-working', label: 'Limited working', short: 'B1', percent: 45 },
  { value: 'professional-working', label: 'Professional working', short: 'B2', percent: 70 },
  { value: 'full-professional', label: 'Full professional', short: 'C1', percent: 90 },
  { value: 'native', label: 'Native / bilingual', short: 'C2', percent: 100 },
];

const LANGUAGE_LEVEL_MAP = new Map(LANGUAGE_LEVELS.map((level) => [level.value, level]));

export function languageLabel(level: LanguageLevel): string {
  return LANGUAGE_LEVEL_MAP.get(level)?.label ?? 'Professional working';
}
export function languagePercent(level: LanguageLevel): number {
  return LANGUAGE_LEVEL_MAP.get(level)?.percent ?? 70;
}
export function languageShort(level: LanguageLevel): string {
  return LANGUAGE_LEVEL_MAP.get(level)?.short ?? 'B2';
}

/* -------------------------------------------------------------------------- */
/* Derived helpers used by every template                                      */
/* -------------------------------------------------------------------------- */

export function fullName(cv: CVData): string {
  return [cv.personal.firstName, cv.personal.lastName].filter(Boolean).join(' ').trim();
}

export function initials(cv: CVData): string {
  const first = cv.personal.firstName.trim()[0] ?? '';
  const last = cv.personal.lastName.trim()[0] ?? '';
  return (first + last).toUpperCase() || '—';
}

/** Strips a protocol/`www.`/trailing slash so links read cleanly on paper. */
export function prettyUrl(url: string): string {
  return url
    .trim()
    .replace(/^https?:\/\//i, '')
    .replace(/^www\./i, '')
    .replace(/\/+$/, '');
}

export function ensureProtocol(url: string): string {
  const value = url.trim();
  if (!value) return '';
  if (/^(https?:|mailto:|tel:)/i.test(value)) return value;
  return `https://${value}`;
}

/** Splits multi-line description text into paragraphs, dropping empties. */
export function paragraphs(text: string): string[] {
  return text
    .split(/\n{1,}/)
    .map((line) => line.trim())
    .filter(Boolean);
}

/** Splits a description into bullet lines, tolerating `-`, `*` and `•` prefixes. */
export function bulletLines(text: string): string[] {
  return paragraphs(text).map((line) => line.replace(/^[-*•]\s*/, ''));
}

export function groupSkillsByCategory(
  skills: CVData['skills'],
): { category: string; items: CVData['skills'] }[] {
  const groups = new Map<string, CVData['skills']>();
  for (const skill of skills) {
    const key = skill.category.trim() || 'General';
    const bucket = groups.get(key);
    if (bucket) bucket.push(skill);
    else groups.set(key, [skill]);
  }
  return Array.from(groups, ([category, items]) => ({ category, items }));
}

/** CSS `text-transform` value for section headings, driven by the user's setting. */
export function headingTransform(
  customization: CVCustomization,
): 'uppercase' | 'capitalize' | 'none' {
  switch (customization.headingCase) {
    case 'uppercase':
      return 'uppercase';
    case 'capitalize':
      return 'capitalize';
    default:
      return 'none';
  }
}

/** Tracking that keeps uppercase headings legible without looking sparse when mixed-case. */
export function headingTracking(customization: CVCustomization): string {
  return customization.headingCase === 'uppercase' ? '0.09em' : '0.01em';
}

/**
 * Letter-spacing for centred text, with the trailing space taken back out.
 *
 * CSS puts the spacing *after* every character including the last, so a centred line carries
 * one extra gap on its right. The browser then centres a box that is one space too wide and
 * the text lands left of true centre — up to about 1.3px of visible asymmetry on a masthead
 * that exists to be symmetrical, and it is the kind of wrongness people notice without being
 * able to name.
 *
 * `textIndent` of the same size pushes the line back by exactly the width of that phantom
 * gap. `creative/Photographer` had worked this out; the other eight centred headings in the
 * set had not, so it lives here now instead of in one file.
 */
export function centredTracking(spacing: string): {
  letterSpacing: string;
  textIndent: string;
} {
  return { letterSpacing: spacing, textIndent: spacing };
}

/* -------------------------------------------------------------------------- */
/* Colour                                                                      */
/* -------------------------------------------------------------------------- */

/**
 * Colour maths, in one place.
 *
 * These used to be three functions that each re-parsed a hex string by hand, and the one
 * that mattered got the threshold wrong. `readableOn` switched to dark ink above relative
 * luminance 0.45, but white text needs a background at or below **0.179** to reach 4.5:1 —
 * so every accent between 0.18 and 0.45 was given white text at somewhere between 2.1:1 and
 * 4.5:1. A mid-tone teal produced a masthead that looked fine on a good monitor and was
 * unreadable in print or on a phone in daylight.
 *
 * Nothing here guesses. `contrastRatio` is the WCAG 2.x formula, and every decision is made
 * by measuring rather than by comparing a number to a threshold somebody picked by eye.
 */

/** WCAG AA for normal text. CV body copy is ~14px, so the large-text 3:1 exemption never applies. */
export const AA_CONTRAST = 4.5;

export const INK = '#111827';
/** Named to avoid colliding with `PAPER`, the paper-*size* table above. */
export const WHITE = '#ffffff';

interface Rgb {
  r: number;
  g: number;
  b: number;
}

function parseHex(hex: string): Rgb | null {
  const normalised = hex.trim().replace('#', '');
  const full =
    normalised.length === 3
      ? normalised
          .split('')
          .map((char) => char + char)
          .join('')
      : normalised;
  if (!/^[0-9a-f]{6}$/i.test(full)) return null;
  const value = Number.parseInt(full, 16);
  return { r: (value >> 16) & 255, g: (value >> 8) & 255, b: value & 255 };
}

function toHex({ r, g, b }: Rgb): string {
  return `#${[r, g, b]
    .map((channel) => Math.max(0, Math.min(255, Math.round(channel))).toString(16).padStart(2, '0'))
    .join('')}`;
}

/** WCAG relative luminance, 0 (black) to 1 (white). */
export function relativeLuminance(hex: string): number {
  const rgb = parseHex(hex);
  if (!rgb) return 1;
  const channel = (value: number) => {
    const c = value / 255;
    return c <= 0.03928 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4;
  };
  return 0.2126 * channel(rgb.r) + 0.7152 * channel(rgb.g) + 0.0722 * channel(rgb.b);
}

/** WCAG contrast ratio between two colours, 1 (identical) to 21 (black on white). */
export function contrastRatio(a: string, b: string): number {
  const first = relativeLuminance(a);
  const second = relativeLuminance(b);
  const lighter = Math.max(first, second);
  const darker = Math.min(first, second);
  return (lighter + 0.05) / (darker + 0.05);
}

/** Mixes a hex colour with white — used for tinted section backgrounds in templates. */
export function tint(hex: string, amount: number): string {
  const rgb = parseHex(hex);
  if (!rgb) return hex;
  const mix = (channel: number) => channel + (255 - channel) * amount;
  return toHex({ r: mix(rgb.r), g: mix(rgb.g), b: mix(rgb.b) });
}

/** Darkens a hex colour — used for gradients and rules. */
export function shade(hex: string, amount: number): string {
  const rgb = parseHex(hex);
  if (!rgb) return hex;
  const mix = (channel: number) => channel * (1 - amount);
  return toHex({ r: mix(rgb.r), g: mix(rgb.g), b: mix(rgb.b) });
}

/**
 * Blends `hex` toward `target` — `tint` and `shade` generalised to any pair.
 *
 * The reason this exists rather than another `tint` call: a progress track has to be the
 * *less prominent* of the two colours, and "less prominent" means closer to whatever the
 * component is sitting on, not closer to white. Tinting toward white is correct on paper
 * and exactly backwards on a near-black sidebar, which is why Modern Executive's skill bars
 * shipped reading inverted — a bright empty track behind a dark fill, showing the opposite
 * of the quantity they encode.
 */
export function mix(hex: string, target: string, amount: number): string {
  const from = parseHex(hex);
  const to = parseHex(target);
  if (!from || !to) return hex;
  const blend = (a: number, b: number) => a + (b - a) * amount;
  return toHex({
    r: blend(from.r, to.r),
    g: blend(from.g, to.g),
    b: blend(from.b, to.b),
  });
}

/**
 * The better of white or dark ink on `hex`.
 *
 * Measured, not thresholded: whichever actually scores higher wins, so there is no band of
 * accents that silently get the wrong one.
 *
 * The soft ink is `#111827` rather than black, which leaves a narrow gap. Where the two
 * curves cross — background luminance ≈ 0.205, a mid-grey or a strong mid-tone — both land
 * at about 4.12:1 and neither clears AA. Pure black does (4.67:1 and rising), so that band
 * falls through to it. It is a handful of accent values, but they are exactly the values a
 * user picks when they want "a proper colour", so they are worth the extra branch.
 */
export function readableOn(hex: string): string {
  const onPaper = contrastRatio(hex, WHITE);
  const onInk = contrastRatio(hex, INK);
  if (onPaper >= AA_CONTRAST || onInk >= AA_CONTRAST) return onPaper >= onInk ? WHITE : INK;
  return '#000000';
}

/** WCAG AA for graphical objects — the bar you have to see to read the level it encodes. */
export const AA_GRAPHIC = 3;

/**
 * The accent, adjusted only as far as a *shape* on `surface` needs.
 *
 * A skill bar is not text, so 4.5:1 would be the wrong bar to hold it to — it would drag
 * every accent toward black and flatten the thing the template is for. But it is not
 * decoration either: the filled portion is the entire content of the control. On Modern
 * Executive's near-black sidebar the default accent sat at 2.75:1, which is a bar you have
 * to hunt for.
 */
export function graphicOn(accent: string, surface: string = WHITE): string {
  return contrastAgainst(accent, surface, AA_GRAPHIC);
}

/**
 * The accent, safe to set as text on `surface`.
 *
 * Templates keep two accents deliberately: `c.accentColor` for anything filled — rules,
 * bars, bands, markers, the ring round a photo — and this one for anything read. Amber at
 * full saturation is a fine 3px rule and a 2.15:1 job title.
 */
export function accentOn(accent: string, surface: string = WHITE): string {
  return contrastAgainst(accent, surface);
}

/**
 * A dimmed version of `text`, never below AA on `surface`.
 *
 * Every template dims its metadata the same way — by moving the text colour toward the
 * background — and two different bugs came out of the two ways it was written.
 *
 * On paper it was `tint(textColor, 0.38–0.45)`: a move toward white, which is a move toward
 * the background only because the background happens to be white. Eleven templates tinted
 * far enough to land under 4.5:1, at worst 3.60:1, for the dates and locations on every
 * entry.
 *
 * On a coloured band it was `onBand === '#ffffff' ? 'rgba(255,255,255,0.8)' : 'rgba(0,0,0,0.66)'`
 * — a fixed alpha over an accent the user chooses. Whatever ratio that lands on is an
 * accident of their colour picker, and on Marketing's pink it landed on 3.73:1.
 *
 * Both are the same operation once it is written as "move toward the surface", and both are
 * safe once the result is measured. The dimming still happens; it stops where legibility
 * does. On white this is exactly the old `tint`, so nothing that was already fine moves.
 */
export function mutedOn(text: string, amount: number, surface: string = WHITE): string {
  return contrastAgainst(mix(text, surface, amount), surface);
}

/**
 * `colour`, walked toward black or white until it is legible on `background`.
 *
 * This is what fixes the eleven templates whose accent printed employer names at 2.15:1 on
 * white. The alternative — refusing light accents — would have meant telling a graphic
 * designer they cannot use amber, when the real problem is only amber *as small text*. The
 * accent still paints rules, bars and panels at full saturation; only text moves.
 *
 * Hue is preserved: `tint` and `shade` scale all three channels together, so a 2.15:1 amber
 * becomes a darker amber rather than a brown or a grey. Direction is chosen by measurement,
 * so this darkens on white and lightens on a near-black sidebar without being told which.
 * Returns `colour` untouched when it already passes, which is the common case.
 */
export function contrastAgainst(
  colour: string,
  background: string,
  minimum: number = AA_CONTRAST,
): string {
  if (!parseHex(colour) || !parseHex(background)) return colour;
  if (contrastRatio(colour, background) >= minimum) return colour;

  // Whichever extreme is further from the background is the direction with headroom.
  const darken = contrastRatio(background, INK) > contrastRatio(background, WHITE);

  // 1% steps: fine enough that the shift is invisible next to the original, coarse enough
  // to stay cheap. The loop is bounded and deterministic, so pages remain cacheable.
  for (let amount = 0.01; amount <= 1; amount += 0.01) {
    const candidate = darken ? shade(colour, amount) : tint(colour, amount);
    if (contrastRatio(candidate, background) >= minimum) return candidate;
  }

  // Unreachable for any real pair, but never return something worse than the endpoint.
  return darken ? INK : WHITE;
}
