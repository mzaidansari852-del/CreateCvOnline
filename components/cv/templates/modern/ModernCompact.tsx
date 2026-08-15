import { ContactList, SectionContent } from '@/components/cv/parts';
import {
  accentOn,
  bodyWeight,
  displayName,
  headingTracking,
  headingTransform,
  headingWeight,
  tint,
} from '@/lib/cv/format';
import { splitSections, visibleSections } from '@/lib/cv/sections';
import type { CVCustomization, CVTemplateProps, TemplateMeta } from '@/types/cv';

export const meta: TemplateMeta = {
  id: 'modern-10',
  slug: 'modern-compact',
  name: 'Modern Compact',
  category: 'modern',
  premium: true,
  atsScore: 4,
  columns: 2,
  hasPhoto: false,
  accentDefault: '#dc2626',
  fonts: { heading: 'roboto', body: 'roboto' },
  metrics: { lineHeight: 1.36, pageMargin: 40 },
  tagline: 'Two working columns and tightened spacing to keep a long career on one page.',
  description:
    'Modern Compact exists for the CV that runs to 1.2 pages and needs to be one. Section spacing is cut by 40%, each role condenses to a single headline row plus its bullets, and a 40% side column absorbs skills, languages, certifications, awards and interests so the main column carries nothing but your roles, education and projects. Both columns are plain text on white, separated by a hairline rather than a coloured panel, so nothing on the page reads as a graphic block.',
  bestFor: [
    'Experienced hires with ten or more roles to list',
    'Applicants held to a strict one-page limit',
    'Contractors listing many short engagements',
  ],
  features: [
    'Working 60/40 two-column body with no coloured panels',
    'Section spacing reduced to 60% of the slider value',
    'Condensed experience, education and project entries',
    'Skills rendered as compact tags in the side column',
  ],
  keywords: [
    'one page cv template',
    'compact cv template',
    'two column cv template',
    'dense resume template',
  ],
};

const SIDEBAR_SECTIONS = ['skills', 'languages', 'certifications', 'awards', 'interests'];

/** How much of the user's section spacing this layout keeps. */
const DENSITY = 0.6;

/**
 * Modern Compact — density-first two column layout.
 *
 * Everything here fights for vertical space: the section rhythm is scaled down, entry gaps
 * are tightened via the shared `gap` prop, and the side column runs its own flow of short
 * lists so the main column never has to break for a skills grid.
 */
export default function ModernCompact({ cv, customization: c }: CVTemplateProps) {
  const accent = c.accentColor;
  const accentText = accentOn(accent);
  const sections = visibleSections(cv);
  const { main, aside } = splitSections(sections, SIDEBAR_SECTIONS);
  const spacing = c.sectionSpacing * DENSITY;
  const divider = tint(accent, 0.78);

  return (
    <div
      style={{
        padding: `${c.pageMargin * 0.72}px ${c.pageMargin}px ${c.pageMargin * 0.8}px`,
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
          gap: '1.2em',
          paddingBottom: '0.5em',
          borderBottom: `2px solid ${accent}`,
        }}
      >
        <div style={{ minWidth: 0 }}>
          <h1
            style={{
              fontSize: '2.1em',
              lineHeight: 1.04,
              fontWeight: headingWeight(c, 600),
              color: c.secondaryColor,
              letterSpacing: '-0.02em',
            }}
          >
            {displayName(cv)}
          </h1>
          {cv.personal.title ? (
            <p style={{ fontSize: '1em', fontWeight: bodyWeight(c, 600), color: accentText, marginTop: '0.08em' }}>
              {cv.personal.title}
            </p>
          ) : null}
        </div>
        <div style={{ maxWidth: '52%', minWidth: 0 }}>
          <ContactList
            cv={cv}
            accent={accent}
            color={c.textColor}
            icons={c.showIcons}
            layout="grid"
            fontSize="0.82em"
          />
        </div>
      </header>

      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'minmax(0, 1.5fr) minmax(0, 1fr)',
          columnGap: '1.1em',
          marginTop: `${spacing}px`,
          flex: 1,
        }}
      >
        <div>
          {main.map((section, index) => (
            <section
              key={section.id}
              className="cv-section"
              style={{ marginTop: index === 0 ? 0 : `${spacing}px` }}
            >
              <CompactHeading label={section.label} accent={accent} c={c} />
              <SectionContent
                sectionId={section.id}
                cv={cv}
                c={c}
                accent={accent}
                color={c.textColor}
                gap={0.62}
                variants={{
                  experience: 'compact',
                  education: 'compact',
                  projects: 'compact',
                  volunteer: 'compact',
                  publications: 'compact',
                  references: 'stack',
                }}
              />
            </section>
          ))}
        </div>

        <aside style={{ borderLeft: `1px solid ${divider}`, paddingLeft: '1.1em' }}>
          {aside.map((section, index) => (
            <section
              key={section.id}
              className="cv-section"
              style={{ marginTop: index === 0 ? 0 : `${spacing}px` }}
            >
              <CompactHeading label={section.label} accent={accent} c={c} />
              <SectionContent
                sectionId={section.id}
                cv={cv}
                c={c}
                accent={accent}
                color={c.textColor}
                gap={0.55}
                skillDisplay="tags"
                skillColumns={1}
                variants={{
                  languages: 'stack',
                  certifications: 'compact',
                  awards: 'compact',
                  interests: 'tags',
                }}
              />
            </section>
          ))}
        </aside>
      </div>
    </div>
  );
}

/** Small inline-left heading with a leading accent bar — the same in both columns. */
function CompactHeading({
  label,
  accent,
  c,
}: {
  label: string;
  accent: string;
  c: CVCustomization;
}) {
  return (
    <h2
      className="cv-section-title"
      style={{
        fontSize: '0.8em',
        fontWeight: headingWeight(c, 800),
        lineHeight: 1.3,
        color: c.secondaryColor,
        textTransform: headingTransform(c),
        letterSpacing: headingTracking(c),
        borderLeft: `3px solid ${accent}`,
        paddingLeft: '0.5em',
        marginBottom: '0.4em',
      }}
    >
      {label}
    </h2>
  );
}
