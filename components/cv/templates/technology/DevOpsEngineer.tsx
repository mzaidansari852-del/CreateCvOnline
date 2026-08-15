import { ContactList, SectionContent } from '@/components/cv/parts';
import {
  accentOn,
  bodyWeight,
  displayName,
  headingTracking,
  headingTransform,
  headingWeight,
  mutedOn,
  tint,
} from '@/lib/cv/format';
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
  fonts: { heading: 'roboto', body: 'open-sans' },
  metrics: { lineHeight: 1.54, pageMargin: 42 },
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
 * The rail is a `border-left` on the body wrapper, so it is redrawn on every page fragment
 * rather than stopping at the first page break. Each section heading carries its own node.
 * Nodes are siblings of the `h2` rather than children so the offsets stay in base `em` units
 * and do not drift when the heading size changes.
 */
export default function DevOpsEngineer({ cv, customization: c }: CVTemplateProps) {
  const accent = c.accentColor;
  /*
   * The lightest surface the document paints on is not paper — it is this panel. Text
   * clamped against it is legible here and, being darker still, legible on white too, so a
   * single declaration covers every section instead of one per background.
   */
  const panel = tint(accent, 0.92);
  const accentText = accentOn(accent, panel);
  const muted = mutedOn(c.textColor, 0.4, panel);
  const sections = visibleSections(cv);

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
              fontSize: '1.95em',
              lineHeight: 1.12,
              fontWeight: headingWeight(c, 700),
              letterSpacing: '-0.015em',
              color: c.secondaryColor,
            }}
          >
            {displayName(cv)}
          </h1>
          {cv.personal.title ? (
            <p style={{ marginTop: '0.1em', fontWeight: bodyWeight(c, 600), color: accentText }}>
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

      {/*
        The rail is the whole idea of this template — a deployment pipeline running down the
        page — and it was an absolutely positioned span, which means it stopped dead at the
        first page break and page 2 lost it entirely. A `border-left` is part of the box and
        is redrawn on every fragment, so the pipeline survives the fold.
      */}
      <div
        style={{
          marginTop: `${c.sectionSpacing * 1.2}px`,
          paddingLeft: RAIL_GUTTER,
          borderLeft: `3px solid ${tint(accent, 0.45)}`,
        }}
      >
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
                fontWeight: headingWeight(c, 800),
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
      </div>
    </div>
  );
}
