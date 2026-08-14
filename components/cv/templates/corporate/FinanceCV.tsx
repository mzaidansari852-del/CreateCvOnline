import { ContactList, SectionContent } from '@/components/cv/parts';
import { accentOn, fullName, headingTracking, headingTransform, tint } from '@/lib/cv/format';
import { visibleSections } from '@/lib/cv/sections';
import type { CVTemplateProps, TemplateMeta } from '@/types/cv';

export const meta: TemplateMeta = {
  id: 'corporate-05',
  slug: 'finance-cv',
  name: 'Finance CV',
  category: 'corporate',
  premium: true,
  atsScore: 5,
  columns: 1,
  hasPhoto: false,
  accentDefault: '#1b4332',
  tagline: 'Ledger-straight alignment: a fixed date column, tinted heading bands, no graphics.',
  description:
    'Finance CV lines every entry up on the same grid — role and employer on the left, dates locked to a fixed right-hand column — so a reader scanning ten years of positions never loses the timeline. Section headings sit on a pale tinted band that separates blocks without adding artwork a parser has to guess at, and skills print as comma-separated category lines instead of bars, which is the format audit and controllership reviewers expect. It suits a long history where the dates carry as much weight as the job titles.',
  bestFor: [
    'Accountants and financial controllers',
    'Audit, tax and treasury specialists',
    'Analysts whose CV is read for dates and figures',
  ],
  features: [
    'Fixed-width date column aligned across every entry',
    'Tinted band section headings',
    'Category-grouped skills as running text',
    'Single column with no graphics to trip a parser',
  ],
  keywords: [
    'finance cv template',
    'accountant cv template',
    'financial analyst resume template',
    'ats friendly finance cv',
  ],
};

/** Width of the right-hand date column every entry aligns to. */
const DATE_COLUMN = '6.5em';
/** Horizontal inset shared by the heading bands and the section bodies. */
const GUTTER = '0.62em';

/**
 * Finance CV — tabular discipline.
 *
 * The page behaves like a ledger: heading bands run the full content width, and every
 * section body is inset by the same gutter as its band so the right-aligned dates produced
 * by the `stack` entry layouts land on one shared column edge. That edge is marked in each
 * band by a short accent rule sitting in a fixed {@link DATE_COLUMN} cell.
 */
export default function FinanceCV({ cv, customization: c }: CVTemplateProps) {
  const accent = c.accentColor;
  const accentText = accentOn(accent);
  const sections = visibleSections(cv);
  const name = fullName(cv);

  return (
    <div style={{ padding: c.pageMargin }}>
      <header
        style={{
          display: 'grid',
          gridTemplateColumns: 'minmax(0, 1fr) auto',
          columnGap: '1.8em',
          alignItems: 'end',
          paddingBottom: '0.7em',
          borderBottom: `2px solid ${accent}`,
        }}
      >
        <div style={{ minWidth: 0 }}>
          <h1
            style={{
              fontSize: '2.05em',
              lineHeight: 1.1,
              fontWeight: 700,
              color: c.secondaryColor,
              letterSpacing: '-0.012em',
            }}
          >
            {name || 'Your Name'}
          </h1>
          {cv.personal.title ? (
            <p
              style={{
                marginTop: '0.22em',
                fontSize: '0.9em',
                fontWeight: 600,
                color: accentText,
                textTransform: 'uppercase',
                letterSpacing: '0.12em',
              }}
            >
              {cv.personal.title}
            </p>
          ) : null}
        </div>
        <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
          <ContactList
            cv={cv}
            accent={accent}
            color={c.textColor}
            icons={c.showIcons}
            layout="stack"
            fontSize="0.86em"
          />
        </div>
      </header>

      <div>
        {sections.map((section, index) => (
          <section
            key={section.id}
            className="cv-section"
            style={{ marginTop: index === 0 ? c.sectionSpacing * 0.9 : c.sectionSpacing }}
          >
            <h2
              className="cv-section-title"
              style={{
                display: 'grid',
                gridTemplateColumns: `minmax(0, 1fr) ${DATE_COLUMN}`,
                alignItems: 'center',
                columnGap: '0.9em',
                background: tint(accent, 0.93),
                borderLeft: `3px solid ${accent}`,
                padding: `4px ${GUTTER}`,
                fontSize: '0.88em',
                fontWeight: 700,
                color: c.secondaryColor,
                textTransform: headingTransform(c),
                letterSpacing: headingTracking(c),
              }}
            >
              <span>{section.label}</span>
              <span
                aria-hidden
                style={{ display: 'block', height: 2, background: tint(accent, 0.4) }}
              />
            </h2>

            <div style={{ padding: `0.6em ${GUTTER} 0` }}>
              <SectionContent
                sectionId={section.id}
                cv={cv}
                c={c}
                accent={accent}
                color={c.textColor}
                muted="#56606f"
                variants={{
                  experience: 'stack',
                  education: 'stack',
                  certifications: 'stack',
                  projects: 'stack',
                  awards: 'stack',
                  publications: 'stack',
                  languages: 'grid',
                  interests: 'inline',
                  references: 'grid',
                }}
                skillDisplay="text"
              />
            </div>
          </section>
        ))}
      </div>
    </div>
  );
}
