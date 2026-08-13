import type { CSSProperties } from 'react';

import { ContactList, SectionContent } from '@/components/cv/parts';
import { fullName, headingTracking, headingTransform, tint } from '@/lib/cv/format';
import { splitSections, visibleSections } from '@/lib/cv/sections';
import type { CVCustomization, CVTemplateProps, TemplateMeta } from '@/types/cv';

export const meta: TemplateMeta = {
  id: 'tech-09',
  slug: 'ai-engineer-cv',
  name: 'AI Engineer',
  category: 'technology',
  premium: true,
  atsScore: 4,
  columns: 2,
  hasPhoto: false,
  accentDefault: '#9333ea',
  tagline: 'A gradient rail down the page edge, with research and shipped work given equal billing.',
  description:
    'AI Engineer runs a two-column body under a full-width header so papers, models and production systems all get room without pushing your employment history onto a second page. Projects and publications sit in tinted panels a reviewer can find at a glance, while the narrow right-hand column carries your stack, certifications and languages. The gradient rail is painted as a page background, so it continues down the edge of page three of a long research CV.',
  bestFor: [
    'Machine learning and research engineers',
    'Applied scientists with published work',
    'Engineers whose projects matter as much as their job titles',
  ],
  features: [
    'Full-bleed gradient rail that continues across pages',
    'Two-column body beneath a full-width header',
    'Highlighted project and publication panels',
    'Compact stack, certification and language column',
  ],
  keywords: [
    'ai engineer cv template',
    'machine learning cv template',
    'ml engineer resume template',
    'research engineer cv',
  ],
};

/** Width of the printed rail, in px. Kept in sync with `pageBackground`. */
const RAIL_WIDTH = 10;

const ASIDE_SECTIONS = [
  'skills',
  'languages',
  'certifications',
  'awards',
  'interests',
  'references',
];

/** Sections that get the tinted panel treatment in the main column. */
const FEATURED_SECTIONS = new Set(['projects', 'publications']);

/**
 * AI Engineer — a full-width header over an asymmetric two-column body, inset from a
 * gradient rail that is painted by `pageBackground` rather than by an element, so it
 * survives pagination in the exported PDF.
 */
export default function AiEngineer({ cv, customization: c }: CVTemplateProps) {
  const accent = c.accentColor;
  const sections = visibleSections(cv);
  const { main, aside } = splitSections(sections, ASIDE_SECTIONS);
  const name = fullName(cv);

  return (
    <div
      style={{
        paddingTop: c.pageMargin * 0.82,
        paddingRight: c.pageMargin,
        paddingBottom: c.pageMargin,
        paddingLeft: c.pageMargin + RAIL_WIDTH,
      }}
    >
      <header
        style={{
          borderBottom: `1px solid ${tint(accent, 0.68)}`,
          paddingBottom: '0.85em',
          marginBottom: `${c.sectionSpacing}px`,
        }}
      >
        <h1
          style={{
            fontSize: '2.2em',
            lineHeight: 1.08,
            fontWeight: 700,
            letterSpacing: '-0.02em',
            color: c.secondaryColor,
          }}
        >
          {name || 'Your Name'}
        </h1>
        {cv.personal.title ? (
          <p style={{ fontSize: '1.1em', fontWeight: 600, color: accent, marginTop: '0.18em' }}>
            {cv.personal.title}
          </p>
        ) : null}
        <div style={{ marginTop: '0.7em' }}>
          <ContactList
            cv={cv}
            accent={accent}
            color={c.textColor}
            icons={c.showIcons}
            layout="inline"
            gap="0.4em 1.05em"
            fontSize="0.92em"
          />
        </div>
      </header>

      <div
        style={{
          display: 'grid',
          gridTemplateColumns: aside.length > 0 ? '1.95fr 1fr' : '1fr',
          columnGap: `${Math.max(20, c.pageMargin * 0.6)}px`,
          alignItems: 'start',
        }}
      >
        <div>
          {main.map((section, index) => {
            const featured = FEATURED_SECTIONS.has(section.id);
            const panel: CSSProperties = featured
              ? {
                  background: tint(accent, 0.94),
                  borderLeft: `2px solid ${tint(accent, 0.4)}`,
                  borderRadius: 3,
                  padding: '0.7em 0.85em 0.75em',
                }
              : {};

            return (
              <section
                key={section.id}
                className="cv-section"
                style={{ marginTop: index === 0 ? 0 : `${c.sectionSpacing}px`, ...panel }}
              >
                <Heading label={section.label} accent={accent} c={c} />
                <SectionContent
                  sectionId={section.id}
                  cv={cv}
                  c={c}
                  accent={accent}
                  color={c.textColor}
                  variants={{
                    experience: 'two-col',
                    education: 'compact',
                    projects: 'stack',
                    publications: 'stack',
                    volunteer: 'compact',
                  }}
                />
              </section>
            );
          })}
        </div>

        {aside.length > 0 ? (
          <aside>
            {aside.map((section, index) => (
              <section
                key={section.id}
                className="cv-section"
                style={{ marginTop: index === 0 ? 0 : `${c.sectionSpacing}px` }}
              >
                <Heading label={section.label} accent={accent} c={c} />
                <SectionContent
                  sectionId={section.id}
                  cv={cv}
                  c={c}
                  accent={accent}
                  color={c.textColor}
                  variants={{
                    languages: 'stack',
                    certifications: 'compact',
                    awards: 'compact',
                    interests: 'tags',
                    references: 'stack',
                  }}
                  skillColumns={1}
                />
              </section>
            ))}
          </aside>
        ) : null}
      </div>
    </div>
  );
}

/** Section heading with the accent lozenge that marks every heading in this template. */
function Heading({ label, accent, c }: { label: string; accent: string; c: CVCustomization }) {
  return (
    <h2
      className="cv-section-title"
      style={{
        display: 'flex',
        alignItems: 'center',
        gap: '0.55em',
        fontSize: '0.92em',
        fontWeight: 800,
        color: c.secondaryColor,
        textTransform: headingTransform(c),
        letterSpacing: headingTracking(c),
        marginBottom: '0.55em',
      }}
    >
      <span
        aria-hidden
        style={{
          width: '0.7em',
          height: '0.3em',
          borderRadius: 999,
          background: accent,
          flexShrink: 0,
        }}
      />
      {label}
    </h2>
  );
}

/**
 * The rail: a vertical accent gradient painted in the first {@link RAIL_WIDTH} px of the
 * page, white everywhere else. Copied onto `<body>` by the print route so it does not stop
 * at the bottom of page one.
 */
export function pageBackground(c: CVCustomization): string {
  const accent = c.accentColor;
  return (
    `linear-gradient(to bottom, ${accent} 0%, ${tint(accent, 0.45)} 58%, ${tint(accent, 0.84)} 100%)` +
    ` left top / ${RAIL_WIDTH}px 100% no-repeat, #ffffff`
  );
}
