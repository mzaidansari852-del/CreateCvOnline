import type { CSSProperties } from 'react';

import { ContactList } from '@/components/cv/parts';
import {
  PAPER,
  accentOn,
  bodyWeight,
  fontStack,
  displayName,
  headingTracking,
  headingTransform,
  headingWeight,
  mutedOn,
  paragraphs,
  monthName,
} from '@/lib/cv/format';
import { getTemplate } from '@/lib/cv/template-registry';
import { DEFAULT_LOCALE, type Locale } from '@/lib/i18n/locales';
import { cn } from '@/lib/utils/cn';
import type { CVCustomization, CVData } from '@/types/cv';

/**
 * The words the letter supplies itself, as opposed to the ones the applicant writes.
 *
 * The subject line is the one worth reading twice. English fronts the noun — "Application
 * for Senior Designer" — while German names the role directly, "Bewerbung als Senior
 * Designer", and French uses "au poste de". Interpolating a role into an English-shaped
 * sentence produces something no native reader would write.
 */
const LETTER_COPY: Record<Locale, {
  application: (vacancy: string) => string;
  reference: (ref: string) => string;
  placeholder: string;
}> = {
  en: {
    application: (vacancy) => `Application for ${vacancy}`,
    reference: (ref) => `Ref ${ref}`,
    placeholder:
      'Your letter goes here. Three or four short paragraphs: why this role, what you bring to it, and one piece of evidence they will not find on the CV.',
  },
  fr: {
    application: (vacancy) => `Candidature au poste de ${vacancy}`,
    reference: (ref) => `Réf. ${ref}`,
    placeholder:
      'Votre lettre ici. Trois ou quatre paragraphes courts : pourquoi ce poste, ce que vous apportez, et un élément que votre CV ne montre pas.',
  },
  de: {
    application: (vacancy) => `Bewerbung als ${vacancy}`,
    reference: (ref) => `Ref. ${ref}`,
    placeholder:
      'Hier steht Ihr Anschreiben. Drei oder vier kurze Absätze: warum diese Stelle, was Sie mitbringen, und ein Beleg, der nicht im Lebenslauf steht.',
  },
};

/**
 * The cover letter that matches the CV.
 *
 * There is exactly one letter layout, and that is the point rather than a shortcut. The
 * thing being sold is a *pair* — two documents that arrive in the same inbox looking like
 * they came from the same person — and the reliable way to build that is to give the letter
 * no design of its own at all. It takes the CV's typefaces, its accent, its page margin,
 * its heading case, its date format and its language, so the pair cannot drift apart when
 * the CV is restyled. Sixty-one letter templates would look like more product and would
 * guarantee the opposite.
 *
 * What the letter does not inherit is the CV's *structure*. A two-column CV with a coloured
 * band is a scanning document; a letter is read top to bottom in one column, and putting a
 * sidebar on it would make it a worse letter for no gain.
 */
export function CoverLetterDocument({
  cv,
  customization,
  className,
  style,
  today,
}: {
  cv: CVData;
  customization: CVCustomization;
  className?: string;
  style?: CSSProperties;
  /**
   * `YYYY-MM-DD` for "no date was set". Passed in rather than read from the clock so the
   * same input always renders the same output — the preview, the PDF and the tests all
   * agree, and a snapshot does not change at midnight.
   */
  today?: string;
}) {
  const c = customization;
  const letter = cv.coverLetter;
  const paper = PAPER[c.paperSize];
  const template = getTemplate(c.templateId);
  const accent = c.accentColor;
  const accentText = accentOn(accent);
  const muted = mutedOn(c.textColor, 0.34);
  const copy = LETTER_COPY[cv.language];
  const name = displayName(cv);

  const cssVars = {
    '--cv-page-width': `${paper.width}px`,
    '--cv-page-height': `${paper.height}px`,
    '--cv-print-size': paper.cssSize,
    // The same two faces the CV is set in. This is the whole "matched pair" promise, and
    // it is one line rather than a setting because a letter that can disagree with its CV
    // eventually will.
    '--cv-font-body': fontStack(c.bodyFont),
    '--cv-font-heading': fontStack(c.headingFont),
    '--cv-font-size': String(c.fontSize),
    '--cv-line-height': String(c.lineHeight),
    '--cv-accent': accent,
    '--cv-secondary': c.secondaryColor,
  } as CSSProperties;

  /*
   * The letter follows the CV it is paired with. They are printed together and read
   * together, so a French CV with an English "Dear Hiring Manager," would be the most
   * visible possible seam.
   */
  const locale = cv.language;
  const dateLine = formatLetterDate(letter.date || today || '', locale);
  const salutation = letter.salutation || defaultSalutation(letter.recipientName, locale);
  const signOff = letter.signOff || defaultSignOff(letter.recipientName, locale);
  const signature = letter.signature || name;
  const blocks = paragraphs(letter.body);

  const addressLines = [
    letter.recipientName,
    letter.recipientRole,
    letter.company,
    ...letter.companyAddress.split('\n'),
  ]
    .map((line) => line.trim())
    .filter(Boolean);

  const subject = [
    letter.vacancy ? copy.application(letter.vacancy) : '',
    letter.reference ? copy.reference(letter.reference) : '',
  ]
    .filter(Boolean)
    .join(' · ');

  return (
    <div
      className={cn('cv-page', className)}
      style={{ ...cssVars, color: c.textColor, background: '#ffffff', ...style }}
      data-template={template.id}
      data-document="cover-letter"
    >
      <div style={{ padding: `${c.pageMargin}px`, display: 'flex', flexDirection: 'column' }}>
        <header
          style={{
            borderBottom: `2px solid ${accent}`,
            paddingBottom: '0.75em',
            display: 'flex',
            flexWrap: 'wrap',
            alignItems: 'flex-end',
            justifyContent: 'space-between',
            gap: '0.4em 1.5em',
          }}
        >
          <div style={{ minWidth: 0 }}>
            <p
              style={{
                fontFamily: 'var(--cv-font-heading)',
                fontSize: '1.95em',
                lineHeight: 1.1,
                fontWeight: headingWeight(c, 600),
                color: c.secondaryColor,
              }}
            >
              {name}
            </p>
            {cv.personal.title ? (
              <p
                style={{
                  marginTop: '0.1em',
                  fontSize: '0.92em',
                  fontWeight: bodyWeight(c, 600),
                  color: accentText,
                }}
              >
                {cv.personal.title}
              </p>
            ) : null}
          </div>
          <div style={{ textAlign: 'right' }}>
            <ContactList
              cv={cv}
              accent={accent}
              color={muted}
              icons={false}
              layout="stack"
              gap="0.16em"
              fontSize="0.85em"
            />
          </div>
        </header>

        {addressLines.length > 0 || dateLine ? (
          <div
            style={{
              marginTop: `${c.sectionSpacing * 1.4}px`,
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'flex-start',
              gap: '1.5em',
            }}
          >
            <address style={{ fontStyle: 'normal', color: c.textColor, lineHeight: 1.45 }}>
              {addressLines.map((line, index) => (
                <span key={`${line}-${index}`} style={{ display: 'block' }}>
                  {line}
                </span>
              ))}
            </address>
            {dateLine ? (
              <p style={{ color: muted, whiteSpace: 'nowrap' }}>{dateLine}</p>
            ) : null}
          </div>
        ) : null}

        {subject ? (
          <p
            style={{
              marginTop: `${c.sectionSpacing * 1.2}px`,
              fontFamily: 'var(--cv-font-heading)',
              fontSize: '0.95em',
              fontWeight: headingWeight(c, 700),
              textTransform: headingTransform(c),
              letterSpacing: headingTracking(c),
              color: c.secondaryColor,
            }}
          >
            {subject}
          </p>
        ) : null}

        <p style={{ marginTop: `${c.sectionSpacing}px` }}>{salutation}</p>

        <div style={{ marginTop: '0.9em', display: 'flex', flexDirection: 'column', gap: '0.85em' }}>
          {blocks.length > 0 ? (
            blocks.map((block, index) => <p key={index}>{block}</p>)
          ) : (
            <p style={{ color: muted }}>{copy.placeholder}</p>
          )}
        </div>

        <div style={{ marginTop: `${c.sectionSpacing * 1.4}px` }}>
          <p>{signOff}</p>
          <p
            style={{
              marginTop: '1.6em',
              fontFamily: 'var(--cv-font-heading)',
              fontWeight: headingWeight(c, 600),
              color: c.secondaryColor,
            }}
          >
            {signature}
          </p>
        </div>
      </div>
    </div>
  );
}

/**
 * "Dear Ms Okafor," / "Madame, Monsieur," / "Sehr geehrte Damen und Herren,".
 *
 * A letter opening with "Dear ," because the recipient was left blank is worse than one
 * that never tried to be personal, so the fallback is the neutral form rather than an
 * empty slot.
 *
 * The neutral forms are not translations of each other and should not be made into one.
 * English addresses the role, French addresses two honorifics, German addresses the whole
 * company. Each is what a letter in that country actually opens with.
 */
function defaultSalutation(recipientName: string, locale: Locale): string {
  const trimmed = recipientName.trim();
  if (locale === 'fr') return trimmed ? `Madame, Monsieur ${trimmed},` : 'Madame, Monsieur,';
  if (locale === 'de') {
    return trimmed ? `Sehr geehrte(r) ${trimmed},` : 'Sehr geehrte Damen und Herren,';
  }
  return trimmed ? `Dear ${trimmed},` : 'Dear Hiring Manager,';
}

/**
 * The sign-off, which is where letter conventions diverge most.
 *
 * English follows the British rule — "Yours sincerely" to a named person, "Yours
 * faithfully" to an unnamed one — which is the one most likely to be wrong by accident.
 *
 * French has no such distinction but does have a formula: the long
 * "Je vous prie d’agréer…" is still the standard close on an application letter, and a
 * bare "Cordialement" reads as an email rather than a letter. German uses one line
 * regardless of whether the recipient is named.
 */
function defaultSignOff(recipientName: string, locale: Locale): string {
  if (locale === 'fr') {
    return 'Je vous prie d’agréer, Madame, Monsieur, l’expression de mes salutations distinguées.';
  }
  if (locale === 'de') return 'Mit freundlichen Grüßen';
  return recipientName.trim() ? 'Yours sincerely,' : 'Yours faithfully,';
}

/**
 * "14 August 2026" / "le 14 août 2026" / "14. August 2026".
 *
 * The form a letter uses, which is not the form a CV date uses. French prefixes `le` and
 * German takes an ordinal point after the day — both are part of the convention rather
 * than decoration, and a date without them marks the letter as translated.
 */
export function formatLetterDate(value: string, locale: Locale = DEFAULT_LOCALE): string {
  const match = /^(\d{4})-(\d{2})-(\d{2})$/.exec(value.trim());
  if (!match) return '';
  const [, year, month, day] = match;

  const label = monthName(Number(month) - 1, locale);
  if (!label) return '';

  if (locale === 'fr') return `le ${Number(day)} ${label} ${year}`;
  if (locale === 'de') return `${Number(day)}. ${label} ${year}`;
  return `${Number(day)} ${label} ${year}`;
}
