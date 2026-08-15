import { ContactList, Photo, SectionContent } from '@/components/cv/parts';
import {
  accentOn,
  bodyWeight,
  displayName,
  headingTracking,
  headingTransform,
  headingWeight,
  mutedOn,
  shade,
  tint,
} from '@/lib/cv/format';
import { splitSections, visibleSections } from '@/lib/cv/sections';
import type { CVCustomization, CVTemplateProps, TemplateMeta } from '@/types/cv';

export const meta: TemplateMeta = {
  id: 'creative-10',
  slug: 'visual-resume',
  name: 'Visual Resume',
  category: 'creative',
  premium: true,
  atsScore: 2,
  columns: 2,
  hasPhoto: true,
  accentDefault: '#2563eb',
  fonts: { heading: 'poppins', body: 'roboto' },
  metrics: { lineHeight: 1.42, pageMargin: 36 },
  tagline: 'Level bars, a photo column and a gradient rail that runs the height of every page.',
  description:
    'Visual Resume turns proficiency into something you can see at a glance: the 34% left column carries your portrait above skill and language level bars, while a gradient rail runs down the outside edge of every page of the PDF. The right column keeps the reading matter — name, contact and a timeline experience section where each role is pinned to a dated node. It is the most graphic template in the set, so treat the bars as a design decision rather than an ATS-safe one and keep a plain-text CV for portals.',
  bestFor: [
    'Designers and multimedia specialists',
    'Multilingual candidates with several working languages',
    'Anyone sending a CV directly to a hiring manager',
  ],
  features: [
    'Full-bleed gradient rail on every page',
    'Portrait column with skill and language bars',
    'Timeline experience with dated nodes',
    'Certifications and interests in the sidebar',
  ],
  keywords: [
    'visual resume template',
    'infographic cv template',
    'skill bar cv',
    'graphic designer resume',
  ],
};

const RAIL_WIDTH = 10;
const SIDEBAR_PERCENT = 34;
const SIDEBAR_SECTIONS = ['skills', 'languages', 'interests', 'certifications'];

/**
 * Visual Resume — data-visual two column.
 *
 * The measurable material (skills, languages) lives in the left column as bars; the
 * narrative lives on the right as a timeline. The accent rail is painted by
 * `pageBackground` rather than by an element, so it survives pagination.
 */
export default function VisualResume({ cv, customization: c }: CVTemplateProps) {
  const accent = c.accentColor;
  const accentText = accentOn(accent);
  const sections = visibleSections(cv);
  const { main, aside } = splitSections(sections, SIDEBAR_SECTIONS);
  const pad = c.pageMargin * 0.78;
  const muted = mutedOn(c.textColor, 0.34);

  return (
    <div
      style={{
        display: 'grid',
        /*
         * The gradient rail down the edge stays either way — it is page furniture, not the
         * sidebar. The 34% column is the sidebar, and it only earns its space when something
         * is in it.
         */
        gridTemplateColumns: aside.length > 0 ? `${SIDEBAR_PERCENT}% 1fr` : '1fr',
        minHeight: 'inherit',
        paddingLeft: RAIL_WIDTH,
      }}
    >
      {/* ---------------------------------------------------------------- aside */}
      <aside style={{ padding: `${pad}px ${pad * 0.8}px ${c.pageMargin}px ${pad * 0.7}px` }}>
        {c.showPhoto ? (
          <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '1.2em' }}>
            <Photo
              cv={cv}
              c={c}
              size={118}
              border={tint(accent, 0.68)}
              borderWidth={3}
              fallbackBackground={accent}
            />
          </div>
        ) : null}

        {aside.map((section, index) => (
          <section
            key={section.id}
            className="cv-section"
            style={{ marginTop: index === 0 ? 0 : `${c.sectionSpacing}px` }}
          >
            <h2
              className="cv-section-title"
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '0.45em',
                fontSize: '0.82em',
                fontWeight: headingWeight(c, 700),
                color: c.secondaryColor,
                textTransform: headingTransform(c),
                letterSpacing: headingTracking(c),
                paddingBottom: '0.35em',
                marginBottom: '0.6em',
                borderBottom: `1px solid ${tint(accent, 0.74)}`,
              }}
            >
              <span
                aria-hidden
                style={{ width: 7, height: 7, borderRadius: 2, background: accent, flexShrink: 0 }}
              />
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
                languages: 'bars',
                interests: 'tags',
                certifications: 'compact',
              }}
              // The bars are the point of this column — they are what makes the left
              // side read as a chart rather than a list.
              skillDisplay="bars"
              skillColumns={1}
            />
          </section>
        ))}
      </aside>

      {/* ----------------------------------------------------------------- main */}
      <div style={{ padding: `${pad}px ${c.pageMargin}px ${c.pageMargin}px ${pad * 0.75}px` }}>
        <header style={{ marginBottom: `${c.sectionSpacing}px` }}>
          <h1
            style={{
              fontSize: '2.6em',
              lineHeight: 1.06,
              fontWeight: headingWeight(c, 500),
              color: c.secondaryColor,
              letterSpacing: '-0.02em',
            }}
          >
            {displayName(cv)}
          </h1>
          {cv.personal.title ? (
            <p
              style={{ marginTop: '0.2em', fontSize: '1.08em', fontWeight: bodyWeight(c, 600), color: accentText }}
            >
              {cv.personal.title}
            </p>
          ) : null}
          <span
            aria-hidden
            style={{
              display: 'block',
              height: 3,
              width: '100%',
              borderRadius: 2,
              margin: '0.7em 0',
              background: `linear-gradient(to right, ${accent}, ${tint(accent, 0.78)})`,
            }}
          />
          <ContactList
            cv={cv}
            accent={accent}
            color={c.textColor}
            icons={c.showIcons}
            layout="grid"
            fontSize="0.88em"
          />
        </header>

        {main.map((section, index) => (
          <section
            key={section.id}
            className="cv-section"
            style={{ marginTop: index === 0 ? 0 : `${c.sectionSpacing}px` }}
          >
            <h2
              className="cv-section-title"
              style={{
                fontSize: '1em',
                fontWeight: headingWeight(c, 800),
                color: c.secondaryColor,
                textTransform: headingTransform(c),
                letterSpacing: headingTracking(c),
                borderLeft: `3px solid ${accent}`,
                paddingLeft: '0.55em',
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
              muted={muted}
              variants={{
                experience: 'timeline',
                education: 'stack',
                projects: 'stack',
                volunteer: 'stack',
                references: 'grid',
              }}
            />
          </section>
        ))}
      </div>
    </div>
  );
}

/** The gradient rail on the outside edge — copied onto `<body>` so it spans every page. */
export function pageBackground(c: CVCustomization): string {
  const accent = c.accentColor;
  return (
    `linear-gradient(to bottom, ${accent}, ${shade(accent, 0.45)}) ` +
    `left top / ${RAIL_WIDTH}px 100% no-repeat, #ffffff`
  );
}
