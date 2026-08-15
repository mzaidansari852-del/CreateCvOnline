import { ContactList, Photo, SectionContent } from '@/components/cv/parts';
import {
  accentOn,
  bodyWeight,
  headingTracking,
  headingTransform,
  headingWeight,
  tint,
} from '@/lib/cv/format';
import { visibleSections, type ResolvedSection } from '@/lib/cv/sections';
import type { CVCustomization, CVData, CVTemplateProps, TemplateMeta } from '@/types/cv';

export const meta: TemplateMeta = {
  id: 'creative-02',
  slug: 'graphic-designer-cv',
  name: 'Graphic Designer',
  category: 'creative',
  premium: true,
  atsScore: 2,
  // Two. The layout deals sections into `left`/`right` arrays and renders them side by
  // side; declaring one column made the detail page, the gallery filter and the "At a
  // glance" table all state something the picture visibly contradicts.
  columns: 2,
  hasPhoto: true,
  accentDefault: '#f59e0b',
  fonts: { heading: 'poppins', body: 'inter' },
  metrics: { lineHeight: 1.36, pageMargin: 30 },
  tagline: 'A poster masthead over a two-column grid of section blocks.',
  description:
    'Graphic Designer treats the top third of the page like a poster: your name is set huge across two lines, your job title runs beside it as a column of letterspaced words, and a solid accent bar closes the masthead. Below it the sections are dealt into two independent columns, which fits a lot of short blocks — tools, awards, education, certifications — onto a single page. That grid is deliberately graphic and will confuse a strict CV parser, so treat this as the copy you email or hand over in person.',
  bestFor: [
    'Graphic, brand and packaging designers',
    'Studio and in-house creative applications',
    'Designers with many short sections to show',
  ],
  features: [
    'Poster masthead with an oversized two-line name',
    'Job title stacked as letterspaced words',
    'Solid 8px accent rule under the header',
    'Two-column grid of section blocks',
  ],
  keywords: [
    'graphic designer cv template',
    'poster style resume template',
    'graphic design resume template',
    'two column creative cv',
  ],
};

/**
 * Graphic Designer — a poster masthead followed by a two-column grid of blocks.
 *
 * Sections are dealt left/right by index so the distribution is deterministic: the same
 * CV always produces the same page, in the editor preview and in the exported PDF.
 */
export default function GraphicDesigner({ cv, customization: c }: CVTemplateProps) {
  const accent = c.accentColor;
  const accentText = accentOn(accent);
  const sections = visibleSections(cv);
  const left = sections.filter((_, index) => index % 2 === 0);
  const right = sections.filter((_, index) => index % 2 === 1);

  const nameLines = [cv.personal.firstName.trim(), cv.personal.lastName.trim()].filter(Boolean);
  const titleWords = cv.personal.title.split(/\s+/).filter(Boolean);

  return (
    <div>
      <header
        style={{
          display: 'flex',
          alignItems: 'flex-end',
          gap: '1.2em',
          minHeight: 232,
          padding: `${c.pageMargin}px ${c.pageMargin}px ${c.pageMargin * 0.6}px`,
        }}
      >
        <h1
          style={{
            flex: 1,
            minWidth: 0,
            fontSize: '2.6em',
            lineHeight: 0.9,
            fontWeight: headingWeight(c, 500),
            letterSpacing: '-0.035em',
            color: c.secondaryColor,
          }}
        >
          {nameLines.length > 0 ? (
            nameLines.map((line, index) => (
              <span key={index} style={{ display: 'block' }}>
                {line}
              </span>
            ))
          ) : (
            <span style={{ display: 'block' }}>Your Name</span>
          )}
        </h1>

        {titleWords.length > 0 ? (
          <p
            style={{
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'flex-end',
              textAlign: 'right',
              gap: '0.15em',
              paddingBottom: '0.35em',
              marginRight: '-0.3em',
            }}
          >
            {titleWords.map((word, index) => (
              <span
                key={index}
                style={{
                  fontSize: '0.72em',
                  fontWeight: bodyWeight(c, 700),
                  letterSpacing: '0.3em',
                  textTransform: 'uppercase',
                  color: accentText,
                }}
              >
                {word}
              </span>
            ))}
          </p>
        ) : null}

        <Photo cv={cv} c={c} size={96} fallbackBackground={accent} />
      </header>

      <div aria-hidden style={{ height: 8, background: accent }} />

      <div
        style={{
          background: tint(accent, 0.9),
          padding: `0.5em ${c.pageMargin}px`,
        }}
      >
        <ContactList
          cv={cv}
          accent={accent}
          color={c.textColor}
          icons={c.showIcons}
          layout="inline"
          gap="0.4em 1.1em"
          fontSize="0.86em"
        />
      </div>

      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'minmax(0, 1fr) minmax(0, 1fr)',
          columnGap: '1.6em',
          alignItems: 'start',
          padding: `${c.pageMargin * 0.85}px ${c.pageMargin}px ${c.pageMargin}px`,
        }}
      >
        <PosterColumn sections={left} cv={cv} c={c} accent={accent} />
        <PosterColumn sections={right} cv={cv} c={c} accent={accent} />
      </div>
    </div>
  );
}

function PosterColumn({
  sections,
  cv,
  c,
  accent,
}: {
  sections: ResolvedSection[];
  cv: CVData;
  c: CVCustomization;
  accent: string;
}) {
  return (
    <div>
      {sections.map((section, index) => (
        <section
          key={section.id}
          className="cv-section"
          style={{
            marginTop: index === 0 ? 0 : `${c.sectionSpacing * 1.1}px`,
            borderTop: `3px solid ${accent}`,
            paddingTop: '0.5em',
          }}
        >
          <h2
            className="cv-section-title"
            style={{
              fontSize: '0.86em',
              fontWeight: headingWeight(c, 800),
              color: c.secondaryColor,
              textTransform: headingTransform(c),
              letterSpacing: headingTracking(c),
              marginBottom: '0.5em',
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
              experience: 'compact',
              education: 'compact',
              projects: 'compact',
              certifications: 'compact',
              awards: 'compact',
              volunteer: 'compact',
              publications: 'compact',
              languages: 'stack',
              interests: 'tags',
              references: 'stack',
            }}
            skillColumns={1}
          />
        </section>
      ))}
    </div>
  );
}
