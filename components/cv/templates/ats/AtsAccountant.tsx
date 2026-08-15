import { contactEntries, SectionContent } from '@/components/cv/parts';
import {
  accentOn,
  bodyWeight,
  fullName,
  headingTracking,
  headingTransform,
  headingWeight,
  tint,
} from '@/lib/cv/format';
import { visibleSections } from '@/lib/cv/sections';
import type { CVData, CVTemplateProps, TemplateMeta } from '@/types/cv';

export const meta: TemplateMeta = {
  id: 'ats-05',
  slug: 'accountant-cv',
  name: 'Accountant CV',
  category: 'ats',
  premium: true,
  atsScore: 5,
  columns: 1,
  hasPhoto: false,
  accentDefault: '#0f5132',
  fonts: { heading: 'georgia', body: 'arial' },
  metrics: { lineHeight: 1.54, pageMargin: 52 },
  tagline: 'Dates flush right in their own column, certifications given real weight.',
  description:
    'Accountant CV pushes every date to a flush right column and sets the document in tabular figures, so employment periods, qualification years and exam dates line up down the right edge the way a finance reviewer reads them. Certifications are handled as a first-class section with the awarding body picked out in the accent colour, which matters when part-qualified or chartered status is the first thing checked. The right-hand alignment is done with flex rather than a table, so nothing collapses into gibberish when the file is parsed.',
  bestFor: [
    'Accountants, auditors and bookkeepers',
    'Finance, tax and payroll professionals',
    'Part-qualified candidates listing exam progress',
  ],
  features: [
    'Flush-right date column built with flex, never a table',
    'Tabular figures so numerals align down the page',
    'Emphasised certification entries with accented issuers',
    'Ruled dividers between sections',
    'Compact two-line contact header',
  ],
  keywords: [
    'accountant cv template',
    'finance cv template',
    'acca cv template',
    'bookkeeper cv template',
  ],
};

const DIRECT_CONTACT_KEYS = new Set(['email', 'phone', 'location']);

/** Contact details as two compact lines: reachable-now details, then link-shaped ones. */
function contactLines(cv: CVData): string[] {
  const entries = contactEntries(cv);
  const direct = entries
    .filter((entry) => DIRECT_CONTACT_KEYS.has(entry.key))
    .map((entry) => entry.label);
  const online = entries
    .filter((entry) => !DIRECT_CONTACT_KEYS.has(entry.key))
    .map((entry) => entry.label);
  return [direct.join('  ·  '), online.join('  ·  ')].filter(Boolean);
}

/**
 * Accountant CV — ledger alignment in a single column.
 *
 * `font-variant-numeric: tabular-nums` is what makes the right-hand date column read as a
 * ledger: every figure occupies the same advance width, so 2019 – 2021 sits exactly under
 * Mar 2022 – Present. Certifications get the accent colour and a heavier heading; every
 * other section stays in near-black so the emphasis means something.
 */
export default function AtsAccountant({ cv, customization: c }: CVTemplateProps) {
  const ink = c.textColor;
  const metaInk = tint(ink, 0.3);
  const ruleInk = tint(ink, 0.7);
  const accent = c.accentColor;
  const accentText = accentOn(accent);
  const sections = visibleSections(cv);
  const name = fullName(cv);
  const lines = contactLines(cv);

  return (
    <div style={{ padding: c.pageMargin, fontVariantNumeric: 'tabular-nums' }}>
      <header
        style={{
          paddingBottom: '0.55em',
          borderBottom: `1.5px solid ${accent}`,
        }}
      >
        <h1
          style={{
            fontSize: '1.7em',
            lineHeight: 1.12,
            fontWeight: headingWeight(c, 700),
            color: ink,
          }}
        >
          {name || 'Your Name'}
        </h1>
        {cv.personal.title ? (
          <p
            style={{
              fontSize: '1em',
              marginTop: '0.1em',
              color: accentText,
              fontWeight: bodyWeight(c, 600),
            }}
          >
            {cv.personal.title}
          </p>
        ) : null}
        {lines.length > 0 ? (
          <div style={{ marginTop: '0.38em', fontSize: '0.92em', color: metaInk }}>
            {lines.map((line) => (
              <div key={line}>{line}</div>
            ))}
          </div>
        ) : null}
      </header>

      {sections.map((section, index) => {
        const isCertifications = section.id === 'certifications';

        return (
          <section
            key={section.id}
            className="cv-section"
            style={{
              marginTop: `${c.sectionSpacing}px`,
              paddingTop: index === 0 ? 0 : '0.55em',
              borderTop: index === 0 ? undefined : `1px solid ${ruleInk}`,
            }}
          >
            <h2
              className="cv-section-title"
              style={{
                fontSize: '0.96em',
                fontWeight: isCertifications ? 800 : 700,
                color: isCertifications ? accentText : c.secondaryColor,
                textTransform: headingTransform(c),
                letterSpacing: headingTracking(c),
                marginBottom: '0.42em',
              }}
            >
              {section.label}
            </h2>
            <SectionContent
              sectionId={section.id}
              showTags={false}
              cv={cv}
              c={c}
              accent={isCertifications ? accent : c.secondaryColor}
              color={ink}
              muted={section.id === 'summary' ? ink : metaInk}
              rule={ruleInk}
              gap={0.85}
              variants={{
                experience: 'stack',
                certifications: 'stack',
                education: 'stack',
                projects: 'compact',
                awards: 'stack',
                volunteer: 'compact',
                publications: 'compact',
                languages: 'stack',
                interests: 'inline',
                references: 'stack',
              }}
              skillDisplay="text"
              skillColumns={1}
            />
          </section>
        );
      })}
    </div>
  );
}
