import { ContactList, SectionContent } from '@/components/cv/parts';
import { fullName, headingTracking, headingTransform } from '@/lib/cv/format';
import { visibleSections } from '@/lib/cv/sections';
import type { CVTemplateProps, TemplateMeta } from '@/types/cv';

export const meta: TemplateMeta = {
  id: 'ats-01',
  slug: 'ats-cv',
  name: 'ATS CV',
  category: 'ats',
  premium: false,
  atsScore: 5,
  columns: 1,
  hasPhoto: false,
  accentDefault: '#000000',
  tagline: 'One column, one rule, one ink — the most literal reading of what a parser wants.',
  description:
    'ATS CV strips the document back to what a resume parser actually reads: a left-aligned name, one wrapped line of plain-text contact details, a single hairline rule, then bold headings in the order you set them. There are no icons, tables, floats or shaded panels, so the whole page is one uninterrupted text flow and every heading maps cleanly to a field. Pick it when the application goes through a portal and you would rather lose the styling than lose a section.',
  bestFor: [
    'Applications submitted through job portals',
    'Volume hiring and graduate schemes',
    'Anyone whose CV was rejected before a human saw it',
  ],
  features: [
    'Single column with no tables, floats or icons',
    'Plain-text contact line separated by pipes',
    'Bold headings taken verbatim from your section names',
    'Monochrome — reproduces exactly on any printer or scanner',
  ],
  keywords: [
    'ats cv template',
    'ats friendly cv',
    'applicant tracking system cv',
    'plain text cv template',
  ],
};

/**
 * ATS CV — the plainest layout in the library.
 *
 * Every colour in the document resolves to `c.textColor`: the accent passed down to the
 * shared content renderers is the body ink, so company names, bullet markers and dates all
 * print as the same single ink. The only rule-work is the hairline under the header block.
 */
export default function AtsClassic({ cv, customization: c }: CVTemplateProps) {
  const ink = c.textColor;
  const sections = visibleSections(cv);
  const name = fullName(cv);

  return (
    <div style={{ padding: c.pageMargin }}>
      <header style={{ paddingBottom: '0.62em', borderBottom: `1px solid ${ink}` }}>
        <h1
          style={{
            fontSize: '1.95em',
            lineHeight: 1.14,
            fontWeight: 700,
            color: ink,
          }}
        >
          {name || 'Your Name'}
        </h1>
        {cv.personal.title ? (
          <p style={{ fontSize: '1.06em', marginTop: '0.12em', color: ink }}>{cv.personal.title}</p>
        ) : null}
        <div style={{ marginTop: '0.42em' }}>
          <ContactList
            cv={cv}
            accent={ink}
            color={ink}
            icons={false}
            layout="inline"
            separator="  |  "
            fontSize="0.95em"
          />
        </div>
      </header>

      {sections.map((section) => (
        <section
          key={section.id}
          className="cv-section"
          style={{ marginTop: `${c.sectionSpacing}px` }}
        >
          <h2
            className="cv-section-title"
            style={{
              fontSize: '1em',
              fontWeight: 700,
              color: ink,
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
            accent={ink}
            color={ink}
            muted={ink}
            variants={{
              experience: 'stack',
              education: 'stack',
              projects: 'compact',
              certifications: 'stack',
              awards: 'stack',
              volunteer: 'stack',
              publications: 'stack',
              languages: 'stack',
              interests: 'inline',
              references: 'stack',
            }}
            skillDisplay="text"
            skillColumns={1}
          />
        </section>
      ))}
    </div>
  );
}
