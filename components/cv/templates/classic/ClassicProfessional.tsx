import { contactEntries, ContactIcon, SectionContent } from '@/components/cv/parts';
import {
  accentOn,
  centredTracking,
  fullName,
  headingTracking,
  headingTransform,
  headingWeight,
  tint,
} from '@/lib/cv/format';
import { visibleSections } from '@/lib/cv/sections';
import type { CVData, CVTemplateProps, TemplateMeta } from '@/types/cv';

export const meta: TemplateMeta = {
  id: 'classic-01',
  slug: 'classic-professional-cv',
  name: 'Classic Professional',
  category: 'classic',
  premium: false,
  atsScore: 5,
  columns: 1,
  hasPhoto: false,
  accentDefault: '#1f2937',
  fonts: { heading: 'source-serif', body: 'source-serif' },
  metrics: { lineHeight: 1.60, pageMargin: 58 },
  tagline:
    'Centred capitals and ruled headings — the CV shape employers have expected for decades.',
  description:
    'Classic Professional is the document most hiring managers picture when they ask for a CV: your name centred in spaced capitals, one line of contact details beneath it, and every section heading centred between two hairline rules. The body stays a plain single column with dates set to the right of each entry, so nothing competes with the writing and nothing confuses a parser. Choose it when the employer is conservative and the safest possible design is the point.',
  bestFor: [
    'Public sector and civil service applications',
    'Finance, insurance and administration roles',
    'Anyone asked to send a conventional CV',
  ],
  features: [
    'Centred name in widely spaced capitals',
    'Section headings ruled above and below',
    'Conventional single-column body with right-aligned dates',
    'Plain-text skills grouped by category',
  ],
  keywords: [
    'classic cv template',
    'traditional cv format',
    'professional cv template',
    'simple cv template',
  ],
};

/**
 * Classic Professional — the textbook CV.
 *
 * The whole design is two ideas: a centred masthead, and section headings framed by a rule
 * above and below that run the full measure of the page. Everything else is deliberately
 * ordinary, which is what makes it safe for conservative employers and for parsers.
 */
export default function ClassicProfessional({ cv, customization: c }: CVTemplateProps) {
  const accent = c.accentColor;
  const accentText = accentOn(accent);
  const rule = tint(accent, 0.35);
  const sections = visibleSections(cv);
  const name = fullName(cv);

  return (
    <div style={{ padding: c.pageMargin }}>
      <header style={{ textAlign: 'center', marginBottom: `${c.sectionSpacing}px` }}>
        <h1
          style={{
            fontSize: '2.35em',
            lineHeight: 1.16,
            fontWeight: headingWeight(c, 600),
            textTransform: 'uppercase',
            ...centredTracking('0.15em'),
            color: c.secondaryColor,
          }}
        >
          {name || 'Your Name'}
        </h1>
        {cv.personal.title ? (
          <p
            style={{
              marginTop: '0.28em',
              fontSize: '1.02em',
              letterSpacing: '0.06em',
              color: accentText,
            }}
          >
            {cv.personal.title}
          </p>
        ) : null}
        <div style={{ marginTop: '0.55em' }}>
          <CentredContacts cv={cv} accent={accent} color={c.textColor} icons={c.showIcons} />
        </div>
      </header>

      {sections.map((section, index) => (
        <section
          key={section.id}
          className="cv-section"
          style={{ marginTop: index === 0 ? 0 : `${c.sectionSpacing}px` }}
        >
          <h2
            className="cv-section-title"
            style={{
              textAlign: 'center',
              fontSize: '0.95em',
              fontWeight: headingWeight(c, 700),
              textTransform: headingTransform(c),
              ...centredTracking(headingTracking(c)),
              color: c.secondaryColor,
              borderTop: `1px solid ${rule}`,
              borderBottom: `1px solid ${rule}`,
              padding: '0.24em 0',
              marginBottom: '0.6em',
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
            variants={{
              experience: 'stack',
              education: 'stack',
              projects: 'stack',
              languages: 'grid',
              certifications: 'stack',
              interests: 'inline',
              references: 'grid',
            }}
            skillDisplay="text"
          />
        </section>
      ))}
    </div>
  );
}

/**
 * Contact details as centred running text rather than a flex row, so a second line stays
 * centred under the first instead of packing to the left of the masthead.
 */
function CentredContacts({
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

  return (
    <div style={{ textAlign: 'center', fontSize: '0.92em', color }}>
      {entries.map((entry, index) => (
        <span key={entry.key} style={{ whiteSpace: 'nowrap' }}>
          {icons ? (
            <span
              style={{ display: 'inline-block', verticalAlign: '-0.13em', marginRight: '0.34em' }}
            >
              <ContactIcon name={entry.icon} size="0.92em" color={accent} />
            </span>
          ) : null}
          {entry.href ? (
            <a href={entry.href} style={{ color: 'inherit' }}>
              {entry.label}
            </a>
          ) : (
            <span>{entry.label}</span>
          )}
          {index < entries.length - 1 ? (
            <span aria-hidden style={{ padding: '0 0.5em', opacity: 0.5 }}>
              •
            </span>
          ) : null}
        </span>
      ))}
    </div>
  );
}
