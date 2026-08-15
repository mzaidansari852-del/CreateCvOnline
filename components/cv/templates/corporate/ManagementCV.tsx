import { ContactList, Photo, SectionContent } from '@/components/cv/parts';
import {
  accentOn,
  bodyWeight,
  fullName,
  headingTracking,
  headingTransform,
  headingWeight,
  shade,
  tint,
} from '@/lib/cv/format';
import { splitSections, visibleSections } from '@/lib/cv/sections';
import type { CVData, CVCustomization, CVTemplateProps, TemplateMeta } from '@/types/cv';

export const meta: TemplateMeta = {
  id: 'corporate-03',
  slug: 'manager-cv',
  name: 'Management CV',
  category: 'corporate',
  premium: true,
  atsScore: 4,
  columns: 2,
  hasPhoto: true,
  accentDefault: '#0b3d3b',
  fonts: { heading: 'inter', body: 'open-sans' },
  metrics: { lineHeight: 1.42, pageMargin: 38 },
  tagline: 'A tinted right-hand band carries your toolkit; the wide left column tells the story.',
  description:
    'Management CV keeps the narrative — summary, roles, education — in a wide left column and moves skills, languages, certifications and interests into a softly tinted band down the right that continues onto every page of the exported PDF. The header spans both columns with your photo on the far right, so the top of the document reads as one piece rather than two stacked panels. Each main-column heading carries a leading accent bar, which gives a long record clear entry points without adding rules across the page.',
  bestFor: [
    'Team and department managers',
    'Programme, operations and delivery leads',
    'Candidates pairing a broad skill set with a long record',
  ],
  features: [
    'Full-bleed tinted sidebar on the right',
    'Header spanning both columns with a photo',
    'Accent bar section headings in the main column',
    'Sidebar band continues across every PDF page',
  ],
  keywords: [
    'manager cv template',
    'management cv template',
    'two column cv template with photo',
    'team leader cv template',
  ],
};

const MAIN_PERCENT = 66;
const SIDEBAR_SECTIONS = ['skills', 'languages', 'certifications', 'interests'];

/**
 * Management CV — main column left, tinted full-bleed band right.
 *
 * The band is painted by `pageBackground` (copied onto `<body>` by the print route) so it
 * survives pagination; the `<aside>` is transparent and only occupies the column.
 */
export default function ManagementCV({ cv, customization: c }: CVTemplateProps) {
  const accent = c.accentColor;
  const accentText = accentOn(accent);
  const sections = visibleSections(cv);
  const { main, aside } = splitSections(sections, SIDEBAR_SECTIONS);
  const pad = c.pageMargin * 0.7;
  const sidebarInk = shade(accent, 0.35);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', minHeight: 'inherit' }}>
      <header
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: '1.4em',
          padding: `${pad}px ${c.pageMargin}px ${pad * 0.85}px`,
          borderBottom: `1px solid ${tint(accent, 0.6)}`,
        }}
      >
        <div style={{ minWidth: 0 }}>
          <h1
            style={{
              fontSize: '2.3em',
              lineHeight: 1.06,
              fontWeight: headingWeight(c, 600),
              color: c.secondaryColor,
              letterSpacing: '-0.015em',
            }}
          >
            {fullName(cv) || 'Your Name'}
          </h1>
          {cv.personal.title ? (
            <p
              style={{
                marginTop: '0.18em',
                fontSize: '1.05em',
                fontWeight: bodyWeight(c, 600),
                color: accentText,
              }}
            >
              {cv.personal.title}
            </p>
          ) : null}
          <div style={{ marginTop: '0.6em' }}>
            <ContactList
              cv={cv}
              accent={accent}
              color={c.textColor}
              icons={c.showIcons}
              layout="inline"
              gap="0.35em 1em"
              fontSize="0.88em"
            />
          </div>
        </div>
        <Photo
          cv={cv}
          c={c}
          size={104}
          border="#ffffff"
          borderWidth={3}
          fallbackBackground={accent}
        />
      </header>

      <div
        style={{
          display: 'grid',
          /*
           * The band is the template, and an empty band is not a design.
           * Turn off skills, languages, certifications and interests and there is nothing
           * to put here — reserving the column anyway leaves a third of every page blank.
           */
          gridTemplateColumns: aside.length > 0 ? `${MAIN_PERCENT}% ${100 - MAIN_PERCENT}%` : '1fr',
          flex: 1,
        }}
      >
        <div style={{ padding: `${pad}px ${pad * 0.9}px ${c.pageMargin}px ${c.pageMargin}px` }}>
          {main.map((section, index) => (
            <section
              key={section.id}
              className="cv-section"
              style={{ marginTop: index === 0 ? 0 : `${c.sectionSpacing}px` }}
            >
              <h2
                className="cv-section-title"
                style={{
                  fontSize: '0.98em',
                  fontWeight: headingWeight(c, 700),
                  lineHeight: 1.3,
                  color: c.secondaryColor,
                  textTransform: headingTransform(c),
                  letterSpacing: headingTracking(c),
                  borderLeft: `4px solid ${accent}`,
                  paddingLeft: '0.55em',
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
                variants={{
                  experience: 'stack',
                  education: 'stack',
                  projects: 'stack',
                  volunteer: 'stack',
                  publications: 'compact',
                  references: 'stack',
                }}
              />
            </section>
          ))}
        </div>

        {/* Rendered only when it has content: an empty landmark is noise for a screen
            reader and an empty column is a third of the page. */}
        {aside.length > 0 ? (
          <aside
            style={{
              background: 'transparent',
              padding: `${pad}px ${c.pageMargin}px ${c.pageMargin}px ${pad * 0.8}px`,
            }}
          >
            {aside.map((section, index) => (
              <section
                key={section.id}
                className="cv-section"
                style={{ marginTop: index === 0 ? 0 : `${c.sectionSpacing}px` }}
              >
                <h2
                  className="cv-section-title"
                  style={{
                    fontSize: '0.85em',
                    fontWeight: headingWeight(c, 800),
                    color: sidebarInk,
                    textTransform: headingTransform(c),
                    letterSpacing: headingTracking(c),
                    paddingBottom: '0.3em',
                    borderBottom: `1px solid ${tint(accent, 0.55)}`,
                    marginBottom: '0.5em',
                  }}
                >
                  {section.label}
                </h2>
                <SectionContent
                  sectionId={section.id}
                  cv={cv}
                  c={c}
                  accent={sidebarInk}
                  color={c.textColor}
                  rule={tint(accent, 0.55)}
                  skillColumns={1}
                  variants={{
                    languages: 'stack',
                    certifications: 'compact',
                    interests: 'stack',
                  }}
                />
              </section>
            ))}
          </aside>
        ) : null}
      </div>
    </div>
  );
}

/** Tinted band down the right-hand edge — also applied to `<body>` when printing. */
export function pageBackground(c: CVCustomization, cv: CVData): string | undefined {
  // Painted on every sheet, so an unguarded band would tint a third of a two-page CV
  // with nothing in it. No sidebar sections, no band.
  if (splitSections(visibleSections(cv), SIDEBAR_SECTIONS).aside.length === 0) return undefined;
  return `linear-gradient(to right, #ffffff 0 ${MAIN_PERCENT}%, ${tint(
    c.accentColor,
    0.9,
  )} ${MAIN_PERCENT}% 100%)`;
}
