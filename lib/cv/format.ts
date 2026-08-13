import type {
  CVCustomization,
  CVData,
  DateFormatKey,
  FontKey,
  LanguageLevel,
  PaperSize,
  SkillLevel,
} from '@/types/cv';

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

const MONTHS_SHORT = [
  'Jan',
  'Feb',
  'Mar',
  'Apr',
  'May',
  'Jun',
  'Jul',
  'Aug',
  'Sep',
  'Oct',
  'Nov',
  'Dec',
];

const MONTHS_LONG = [
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
];

/**
 * Formats a partial `YYYY[-MM[-DD]]` value.
 * Returns `''` for empty input so templates can decide what to render.
 */
export function formatPartialDate(value: string, format: DateFormatKey = 'month-year-short'): string {
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
      return `${MONTHS_LONG[monthIndex]} ${year}`;
    case 'month-year-short':
    default:
      return `${MONTHS_SHORT[monthIndex]} ${year}`;
  }
}

/** `Jan 2021 — Present`, `2019 — 2021`, or a single value when only one side exists. */
export function formatDateRange(
  start: string,
  end: string,
  current: boolean,
  format: DateFormatKey = 'month-year-short',
  presentLabel = 'Present',
  separator = ' – ',
): string {
  const from = formatPartialDate(start, format);
  const to = current ? presentLabel : formatPartialDate(end, format);
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

/** Mixes a hex colour with white — used for tinted section backgrounds in templates. */
export function tint(hex: string, amount: number): string {
  const normalised = hex.replace('#', '');
  const full =
    normalised.length === 3
      ? normalised
          .split('')
          .map((char) => char + char)
          .join('')
      : normalised;
  const value = Number.parseInt(full, 16);
  if (Number.isNaN(value)) return hex;
  const r = (value >> 16) & 255;
  const g = (value >> 8) & 255;
  const b = value & 255;
  const mix = (channel: number) => Math.round(channel + (255 - channel) * amount);
  return `#${[mix(r), mix(g), mix(b)]
    .map((channel) => channel.toString(16).padStart(2, '0'))
    .join('')}`;
}

/** Darkens a hex colour — used for gradients and rules. */
export function shade(hex: string, amount: number): string {
  const normalised = hex.replace('#', '');
  const full =
    normalised.length === 3
      ? normalised
          .split('')
          .map((char) => char + char)
          .join('')
      : normalised;
  const value = Number.parseInt(full, 16);
  if (Number.isNaN(value)) return hex;
  const r = (value >> 16) & 255;
  const g = (value >> 8) & 255;
  const b = value & 255;
  const mix = (channel: number) => Math.round(channel * (1 - amount));
  return `#${[mix(r), mix(g), mix(b)]
    .map((channel) => channel.toString(16).padStart(2, '0'))
    .join('')}`;
}

/** Returns `#ffffff` or a dark ink depending on contrast against `hex`. */
export function readableOn(hex: string): string {
  const normalised = hex.replace('#', '');
  const full =
    normalised.length === 3
      ? normalised
          .split('')
          .map((char) => char + char)
          .join('')
      : normalised;
  const value = Number.parseInt(full, 16);
  if (Number.isNaN(value)) return '#ffffff';
  const r = ((value >> 16) & 255) / 255;
  const g = ((value >> 8) & 255) / 255;
  const b = (value & 255) / 255;
  const channel = (c: number) => (c <= 0.03928 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4);
  const luminance = 0.2126 * channel(r) + 0.7152 * channel(g) + 0.0722 * channel(b);
  return luminance > 0.45 ? '#111827' : '#ffffff';
}
