import { ContactList, SectionContent } from '@/components/cv/parts';
import { fullName, headingTracking, headingTransform, tint } from '@/lib/cv/format';
import { visibleSections } from '@/lib/cv/sections';
import type { CVTemplateProps, TemplateMeta } from '@/types/cv';

export const meta: TemplateMeta = {
  id: 'tech-05',
  slug: 'devops-cv',
  name: 'DevOps Engineer',
  category: 'technology',
  premium: true,
  atsScore: 4,
  columns: 1,
  hasPhoto: false,
  accentDefault: '#ea580c',
  tagline: 'A pipeline rail down the page with a node marking every stage of your career.',
  description:
    'DevOps Engineer runs a continuous accent rail down the left edge of the document and drops a square node beside each section heading, so the page reads as a pipeline rather than a pile of boxes. Contact details are compressed into a single rounded bar at the top, which leaves the whole width below for tooling, platforms and incident work. Skills print as tags rather than rated bars, because an infrastructure CV usually needs to list forty technologies without turning into a chart.',
  bestFor: [
    'DevOps, SRE and platform engineers',
    'Cloud and infrastructure specialists',
    'Engineers with long tool and platform inventories',
  ],
  features: [
    'Continuous rail with a node at every section',
    'Compact tinted header bar',
    'Tag-based skills built for long tool lists',
    'Full-width single-column body',
  ],
  keywords: [
    'devops cv template',
    'sre resume template',
    'cloud engineer cv template',
    'platform engineer cv',
  ],
};

/** Gutter between the rail and the section content, in base em. */
const RAIL_GUTTER = '1.9em';
/** Node edge length, in base em. Kept in sync with the `left` calc below. */
const NODE_SIZE = '0.62em';

/**
 * DevOps Engineer — pipeline layout.
 *
 * The rail is a single absolutely positioned bar spanning the body, with each section
 * heading carrying its own node. Nodes are siblings of the `h2` rather than children so the
 * offsets stay in base `em` units and do not drift when the heading size changes.
 */
export default function DevOpsEngineer({ cv, customization: c }: CVTemplateProps) {
  const accent = c.accentColor;
  const muted = tint(c.textColor, 0.4);
  const sections = visibleSections(cv);
  const name = fullName(cv);

  return (
    <div style={{ padding: `${c.pageMargin}px` }}>
      <header
        style={{
          background: tint(accent, 0.92),
          border: `1px solid ${tint(accent, 0.76)}`,
          borderRadius: 10,
          padding: '0.75em 1.05em',
          display: 'flex',
          flexWrap: 'wrap',
          alignItems: 'baseline',
          justifyContent: 'space-between',
          gap: '0.35em 1.4em',
        }}
      >
        <div style={{ minWidth: 0 }}>
          <h1
            style={{
              fontSize: '1.85em',
              lineHeight: 1.12,
              fontWeight: 800,
              letterSpacing: '-0.015em',
              color: c.secondaryColor,
            }}
          >
            {name || 'Your Name'}
          </h1>
          {cv.personal.title ? (
            <p style={{ marginTop: '0.1em', fontWeight: 600, color: accent }}>
              {cv.personal.title}
            </p>
          ) : null}
        </div>

        <ContactList
          cv={cv}
          accent={accent}
          color={muted}
          icons={c.showIcons}
          layout="inline"
          gap="0.25em 1em"
          fontSize="0.86em"
        />
      </header>

      <main
        style={{
          position: 'relative',
          marginTop: `${c.sectionSpacing * 1.2}px`,
          paddingLeft: RAIL_GUTTER,
        }}
      >
        <span
          aria-hidden
          style={{
            position: 'absolute',
            left: 0,
            top: 0,
            bottom: 0,
            width: 3,
            borderRadius: 2,
            background: tint(accent, 0.45),
          }}
        />

        {sections.map((section, index) => (
          <section
            key={section.id}
            className="cv-section"
            style={{
              position: 'relative',
              marginTop: index === 0 ? 0 : `${c.sectionSpacing}px`,
            }}
          >
            <span
              aria-hidden
              style={{
                position: 'absolute',
                left: 'calc(1.5px - 2.21em)',
                top: '0.33em',
                width: NODE_SIZE,
                height: NODE_SIZE,
                background: accent,
                boxShadow: '0 0 0 2px #ffffff',
              }}
            />
            <h2
              className="cv-section-title"
              style={{
                fontSize: '0.95em',
                fontWeight: 800,
                lineHeight: 1.35,
                textTransform: headingTransform(c),
                letterSpacing: headingTracking(c),
                color: c.secondaryColor,
                marginBottom: '0.55em',
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
              muted={muted}
              variants={{
                experience: 'stack',
                education: 'stack',
                projects: 'compact',
                certifications: 'compact',
                awards: 'compact',
                volunteer: 'compact',
                publications: 'compact',
                languages: 'inline',
                interests: 'tags',
                references: 'grid',
              }}
              skillDisplay="tags"
            />
          </section>
        ))}
      </main>
    </div>
  );
}
