import { ContactIcon, SectionContent, contactEntries } from '@/components/cv/parts';
import {
  accentOn,
  bodyWeight,
  displayName,
  headingTracking,
  headingTransform,
  headingWeight,
} from '@/lib/cv/format';
import { visibleSections } from '@/lib/cv/sections';
import type { CVData, CVTemplateProps, TemplateMeta } from '@/types/cv';

export const meta: TemplateMeta = {
  id: 'corporate-02',
  slug: 'business-professional-cv',
  name: 'Business Professional',
  category: 'corporate',
  premium: false,
  atsScore: 5,
  columns: 1,
  hasPhoto: false,
  accentDefault: '#1f3a5f',
  fonts: { heading: 'lato', body: 'lato' },
  metrics: { lineHeight: 1.42, pageMargin: 58 },
  tagline: 'A split header over a solid accent rule, then plain single-column text.',
  description:
    'Business Professional sets your name and title on the left of the header with contact details right-aligned across two lines, then separates the header from the body with one solid accent rule the full width of the page. Everything below that rule is deliberately ordinary: a single column, bold accent headings with no underlines, and skills written out as comma-separated lists rather than drawn as bars — which is the form applicant tracking systems index most reliably.',
  bestFor: [
    'Corporate roles applied for through online portals',
    'Operations, HR and finance professionals',
    'Anyone whose CV is screened by software before a person reads it',
  ],
  features: [
    'Split header with a two-line contact block',
    'Full-width 4px accent rule',
    'Rule-free accent section headings',
    'Comma-separated skill lists for maximum parsability',
  ],
  keywords: [
    'business cv template',
    'professional cv template',
    'ats friendly cv template',
    'corporate resume template',
  ],
};

/**
 * Business Professional — conventional business document.
 *
 * Structure is a two-column header over a plain one-column body. The contact block is
 * rendered here rather than with `ContactList` because the design needs exactly two
 * right-aligned rows, not a wrap that varies with the number of links a person supplies.
 */
export default function BusinessProfessional({ cv, customization: c }: CVTemplateProps) {
  const accent = c.accentColor;
  const accentText = accentOn(accent);
  const sections = visibleSections(cv);

  return (
    <div
      style={{
        padding: c.pageMargin,
        display: 'flex',
        flexDirection: 'column',
        minHeight: 'inherit',
      }}
    >
      <header
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'flex-end',
          gap: '1.6em',
        }}
      >
        <div style={{ minWidth: 0 }}>
          <h1
            style={{
              fontSize: '2.5em',
              lineHeight: 1.06,
              fontWeight: headingWeight(c, 500),
              color: c.secondaryColor,
              letterSpacing: '-0.01em',
            }}
          >
            {displayName(cv)}
          </h1>
          {cv.personal.title ? (
            <p
              style={{
                marginTop: '0.2em',
                fontSize: '1.05em',
                fontWeight: bodyWeight(c, 600),
                color: accentText,
              }}
            >
              {cv.personal.title}
            </p>
          ) : null}
        </div>
        <ContactBlock cv={cv} accent={accent} color={c.textColor} icons={c.showIcons} />
      </header>

      <div aria-hidden style={{ height: 4, background: accent, marginTop: '0.75em' }} />

      <div style={{ marginTop: `${c.pageMargin * 0.6}px`, flex: 1 }}>
        {sections.map((section, index) => (
          <section
            key={section.id}
            className="cv-section"
            style={{ marginTop: index === 0 ? 0 : `${c.sectionSpacing}px` }}
          >
            <h2
              className="cv-section-title"
              style={{
                fontSize: '0.95em',
                fontWeight: headingWeight(c, 700),
                color: accentText,
                textTransform: headingTransform(c),
                letterSpacing: headingTracking(c),
                marginBottom: '0.45em',
              }}
            >
              {section.label}
            </h2>
            <SectionContent
              sectionId={section.id}
              cv={cv}
              c={c}
              accent={accent}
              color={c.textColor}
              skillDisplay="text"
              variants={{
                experience: 'stack',
                education: 'stack',
                projects: 'stack',
                certifications: 'stack',
                languages: 'inline',
                interests: 'inline',
                references: 'stack',
              }}
            />
          </section>
        ))}
      </div>
    </div>
  );
}

/** Contact details split into two right-aligned rows beside the name. */
function ContactBlock({
  cv,
  accent,
  color,
  icons,
}: {
  cv: CVData;
  accent: string;
  color: string;
  icons: boolean;
}) {
  const entries = contactEntries(cv);
  if (entries.length === 0) return null;

  const half = Math.ceil(entries.length / 2);
  const rows = [entries.slice(0, half), entries.slice(half)].filter((row) => row.length > 0);

  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'flex-end',
        gap: '0.28em',
        minWidth: 0,
        fontSize: '0.9em',
        color,
      }}
    >
      {rows.map((row, index) => (
        <div
          key={index}
          style={{
            display: 'flex',
            flexWrap: 'wrap',
            justifyContent: 'flex-end',
            gap: '0.28em 0.9em',
          }}
        >
          {row.map((entry) => (
            <span
              key={entry.key}
              style={{ display: 'inline-flex', alignItems: 'center', gap: '0.35em', minWidth: 0 }}
            >
              {icons ? <ContactIcon name={entry.icon} size="0.95em" color={accent} /> : null}
              {entry.href ? (
                <a href={entry.href} style={{ color: 'inherit' }}>
                  {entry.label}
                </a>
              ) : (
                <span>{entry.label}</span>
              )}
            </span>
          ))}
        </div>
      ))}
    </div>
  );
}
