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
  id: 'tech-04',
  slug: 'data-scientist-cv',
  name: 'Data Scientist',
  category: 'technology',
  premium: true,
  atsScore: 4,
  columns: 1,
  hasPhoto: false,
  accentDefault: '#7c3aed',
  fonts: { heading: 'ibm-plex-sans', body: 'lato' },
  metrics: { lineHeight: 1.48, pageMargin: 36 },
  tagline: 'Bracketed headings, dated gutters and skill bars — a CV shaped like a notebook.',
  description:
    'Data Scientist brackets every section title in the accent colour and prints your toolkit as a two-column grid of proficiency bars, so a reviewer can size up the stack without reading a comma-separated wall of libraries. Experience and education both use a dated left gutter, which fixes the reading order to the timeline and leaves the right-hand space for what you actually built. Publications sit in their own tinted panel with the paper count called out beside the heading, for applications where the research record is the point.',
  bestFor: [
    'Data scientists and machine learning engineers',
    'Quantitative analysts and applied researchers',
    'Candidates with a published paper or preprint record',
  ],
  features: [
    'Bracketed section headings',
    'Two-column skill proficiency bars',
    'Dated gutter for experience and education',
    'Highlighted publications panel with a paper count',
  ],
  keywords: [
    'data scientist cv template',
    'machine learning cv template',
    'data science resume template',
    'research cv template',
  ],
};

const MONO = "ui-monospace, SFMono-Regular, Menlo, Consolas, 'Liberation Mono', monospace";

/**
 * Data Scientist — metric-led single column.
 *
 * Every heading is wrapped in literal brackets, which gives the page a code-adjacent
 * texture without any graphics an ATS could choke on. The publications section is the one
 * block that gets a background, because for research candidates it is the section a hiring
 * panel jumps to first.
 */
export default function DataScientist({ cv, customization: c }: CVTemplateProps) {
  const accent = c.accentColor;
  /*
   * The lightest surface the document paints on is not paper — it is this panel. Text
   * clamped against it is legible here and, being darker still, legible on white too, so a
   * single declaration covers every section instead of one per background.
   */
  const panel = tint(accent, 0.95);
  const accentText = accentOn(accent, panel);
  const muted = mutedOn(c.textColor, 0.42, panel);
  const sections = visibleSections(cv);
  const publicationCount = cv.publications.filter((item) => item.title).length;

  const bracket = {
    color: accentText,
    fontWeight: bodyWeight(c, 400),
    fontSize: '1.5em',
    lineHeight: 1,
  } as const;

  return (
    <div style={{ padding: `${c.pageMargin}px` }}>
      <header
        style={{
          display: 'grid',
          gridTemplateColumns: 'minmax(0, 1fr) auto',
          columnGap: '1.6em',
          alignItems: 'start',
          paddingBottom: '0.85em',
          borderBottom: `2px solid ${tint(accent, 0.5)}`,
        }}
      >
        <div style={{ minWidth: 0 }}>
          <h1
            style={{
              fontSize: '2.5em',
              lineHeight: 1.1,
              fontWeight: headingWeight(c, 500),
              letterSpacing: '-0.015em',
              color: c.secondaryColor,
            }}
          >
            {displayName(cv)}
          </h1>
          {cv.personal.title ? (
            <p
              style={{
                marginTop: '0.25em',
                fontFamily: MONO,
                fontSize: '0.92em',
                letterSpacing: '0.02em',
                color: accentText,
              }}
            >
              {cv.personal.title}
            </p>
          ) : null}
        </div>

        <ContactList
          cv={cv}
          accent={accent}
          color={muted}
          icons={c.showIcons}
          layout="stack"
          fontSize="0.86em"
        />
      </header>

      {sections.map((section, index) => {
        const isPublications = section.id === 'publications';
        return (
          <section
            key={section.id}
            className="cv-section"
            style={{
              marginTop: index === 0 ? `${c.sectionSpacing * 0.9}px` : `${c.sectionSpacing}px`,
            }}
          >
            <h2
              className="cv-section-title"
              style={{
                display: 'flex',
                alignItems: 'baseline',
                gap: '0.3em',
                fontSize: '0.98em',
                fontWeight: headingWeight(c, 700),
                lineHeight: 1.35,
                textTransform: headingTransform(c),
                letterSpacing: headingTracking(c),
                color: c.secondaryColor,
                marginBottom: '0.6em',
              }}
            >
              <span aria-hidden style={bracket}>
                [
              </span>
              <span>{section.label}</span>
              <span aria-hidden style={bracket}>
                ]
              </span>
              {isPublications && publicationCount > 0 ? (
                <span
                  style={{
                    fontFamily: MONO,
                    fontSize: '0.8em',
                    fontWeight: headingWeight(c, 500),
                    letterSpacing: '0.02em',
                    color: accentText,
                    textTransform: 'none',
                  }}
                >
                  {`n=${publicationCount}`}
                </span>
              ) : null}
            </h2>

            {isPublications ? (
              <div
                style={{
                  borderLeft: `3px solid ${accent}`,
                  background: tint(accent, 0.95),
                  borderRadius: '0 4px 4px 0',
                  padding: '0.65em 0.85em',
                }}
              >
                <SectionContent
                  sectionId={section.id}
                  cv={cv}
                  c={c}
                  accent={accent}
                  color={c.textColor}
                  muted={muted}
                  variants={{ publications: 'stack' }}
                />
              </div>
            ) : (
              <SectionContent
                sectionId={section.id}
                cv={cv}
                c={c}
                accent={accent}
                color={c.textColor}
                muted={muted}
                variants={{
                  experience: 'two-col',
                  education: 'two-col',
                  projects: 'stack',
                  certifications: 'compact',
                  awards: 'compact',
                  volunteer: 'stack',
                  languages: 'grid',
                  interests: 'inline',
                  references: 'grid',
                }}
                skillDisplay="bars"
                skillColumns={2}
              />
            )}
          </section>
        );
      })}
    </div>
  );
}
