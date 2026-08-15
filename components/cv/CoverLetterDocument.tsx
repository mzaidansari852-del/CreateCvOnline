import type { CSSProperties } from 'react';

import { ContactList } from '@/components/cv/parts';
import {
  PAPER,
  accentOn,
  bodyWeight,
  fontStack,
  fullName,
  headingTracking,
  headingTransform,
  headingWeight,
  mutedOn,
  paragraphs,
} from '@/lib/cv/format';
import { getTemplate } from '@/lib/cv/template-registry';
import { cn } from '@/lib/utils/cn';
import type { CVCustomization, CVData } from '@/types/cv';

/**
 * The cover letter that matches the CV.
 *
 * There is exactly one letter layout, and that is the point rather than a shortcut. The
 * thing being sold is a *pair* — two documents that arrive in the same inbox looking like
 * they came from the same person — and the reliable way to build that is to give the letter
 * no design of its own at all. It takes the CV's typefaces, its accent, its page margin,
 * its heading case and its date format, so the pair cannot drift apart when the CV is
 * restyled. Sixty-one letter templates would look like more product and would guarantee the
 * opposite.
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
  const name = fullName(cv) || 'Your Name';

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

  const dateLine = formatLetterDate(letter.date || today || '');
  const salutation = letter.salutation || defaultSalutation(letter.recipientName);
  const signOff = letter.signOff || defaultSignOff(letter.recipientName);
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
    letter.vacancy ? `Application for ${letter.vacancy}` : '',
    letter.reference ? `Ref ${letter.reference}` : '',
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
            <p style={{ color: muted }}>
              Your letter goes here. Three or four short paragraphs: why this role, what you bring
              to it, and one piece of evidence they will not find on the CV.
            </p>
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
 * "Dear Ms Okafor," or "Dear Hiring Manager,".
 *
 * A letter opening with "Dear ," because the recipient was left blank is worse than one
 * that never tried to be personal, so the fallback is the neutral form rather than an
 * empty slot.
 */
function defaultSalutation(recipientName: string): string {
  const trimmed = recipientName.trim();
  return trimmed ? `Dear ${trimmed},` : 'Dear Hiring Manager,';
}

/**
 * The British convention, which is also the one most likely to be wrong by accident:
 * "Yours sincerely" when the letter is addressed to a named person, "Yours faithfully"
 * when it opens "Dear Sir/Madam" or "Dear Hiring Manager". Getting this backwards is a
 * small thing that a certain kind of reader notices immediately.
 */
function defaultSignOff(recipientName: string): string {
  return recipientName.trim() ? 'Yours sincerely,' : 'Yours faithfully,';
}

/** "14 August 2026" — the form a letter uses, which is not the form a CV date uses. */
export function formatLetterDate(value: string): string {
  const match = /^(\d{4})-(\d{2})-(\d{2})$/.exec(value.trim());
  if (!match) return '';
  const [, year, month, day] = match;
  const months = [
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
  const label = months[Number(month) - 1];
  if (!label) return '';
  return `${Number(day)} ${label} ${year}`;
}
