import { ContactList, Photo, SectionContent } from '@/components/cv/parts';
import {
  accentOn,
  bodyWeight,
  headingTracking,
  headingTransform,
  headingWeight,
  mutedOn,
  tint,
} from '@/lib/cv/format';
import { visibleSections } from '@/lib/cv/sections';
import type { CVTemplateProps, TemplateMeta } from '@/types/cv';

export const meta: TemplateMeta = {
  id: 'modern-05',
  slug: 'modern-creative',
  name: 'Modern Creative',
  category: 'modern',
  premium: true,
  atsScore: 3,
  columns: 1,
  hasPhoto: true,
  accentDefault: '#7c3aed',
  fonts: { heading: 'poppins', body: 'poppins' },
  metrics: { lineHeight: 1.42, pageMargin: 40 },
  tagline: 'A two-line name over a diagonal accent wash, with numbered sections below.',
  description:
    'Modern Creative breaks your name across two lines — surname in the accent colour — over a soft diagonal wash, with a large portrait anchoring the top-right corner. Below the hero, every section is numbered 01, 02, 03 in oversized tinted digits, which gives a portfolio CV a sense of sequence without adding a single bar or box. Projects render as paired cards and skills as tags, so a body of work reads as work rather than as another list.',
  bestFor: [
    'Designers, art directors and photographers',
    'Marketing, brand and content roles',
    'Portfolio-led applications sent straight to a hiring manager',
  ],
  features: [
    'Two-line name with accent surname',
    'Diagonal accent wash behind the hero',
    'Oversized numbered section headings',
    'Project cards and tag-style skills',
  ],
  keywords: [
    'creative cv template',
    'designer resume template',
    'portfolio cv template',
    'graphic design cv template',
  ],
};

/**
 * Modern Creative — asymmetric hero, numbered sections.
 *
 * The diagonal is a hard-stop `linear-gradient` on the header rather than a rotated
 * element, so nothing overlaps or clips the text and the wash cannot bleed onto page two.
 */
export default function ModernCreative({ cv, customization: c }: CVTemplateProps) {
  const accent = c.accentColor;
  /*
   * The lightest surface the document paints on is not paper — it is this panel. Text
   * clamped against it is legible here and, being darker still, legible on white too, so a
   * single declaration covers every section instead of one per background.
   */
  const panel = tint(accent, 0.88);
  const accentText = accentOn(accent, panel);
  const muted = mutedOn(c.textColor, 0.42, panel);
  const sections = visibleSections(cv);
  const first = cv.personal.firstName.trim();
  const last = cv.personal.lastName.trim();

  return (
    <div style={{ display: 'flex', flexDirection: 'column', minHeight: 'inherit' }}>
      <header
        style={{
          background: `linear-gradient(108deg, ${tint(accent, 0.88)} 0 58%, #ffffff 58% 100%)`,
          padding: `${c.pageMargin * 0.95}px ${c.pageMargin}px ${c.pageMargin * 0.8}px`,
          display: 'flex',
          alignItems: 'flex-start',
          justifyContent: 'space-between',
          gap: '1.6em',
        }}
      >
        <div style={{ flex: 1, minWidth: 0 }}>
          <h1
            style={{ fontSize: '2.8em', lineHeight: 1.02, fontWeight: headingWeight(c, 500), letterSpacing: '-0.02em' }}
          >
            {first || last ? (
              <>
                {first ? (
                  <span style={{ display: 'block', color: c.textColor }}>{first}</span>
                ) : null}
                {last ? <span style={{ display: 'block', color: accentText }}>{last}</span> : null}
              </>
            ) : (
              <>
                <span style={{ display: 'block', color: c.textColor }}>Your</span>
                <span style={{ display: 'block', color: accentText }}>Name</span>
              </>
            )}
          </h1>

          {cv.personal.title ? (
            <p
              style={{
                marginTop: '0.55em',
                fontSize: '1.05em',
                fontWeight: bodyWeight(c, 600),
                letterSpacing: '0.05em',
                color: c.secondaryColor,
              }}
            >
              {cv.personal.title}
            </p>
          ) : null}

          <div style={{ marginTop: '1em' }}>
            <ContactList
              cv={cv}
              accent={accent}
              color={muted}
              icons={c.showIcons}
              layout="inline"
              gap="0.45em 1.1em"
              fontSize="0.92em"
            />
          </div>
        </div>

        <Photo
          cv={cv}
          c={c}
          size={128}
          border="#ffffff"
          borderWidth={4}
          fallbackBackground={accent}
        />
      </header>

      <div
        style={{
          padding: `${c.pageMargin * 0.85}px ${c.pageMargin}px ${c.pageMargin}px`,
          flex: 1,
        }}
      >
        {sections.map((section, index) => (
          <section
            key={section.id}
            className="cv-section"
            style={{ marginTop: index === 0 ? 0 : `${c.sectionSpacing * 1.2}px` }}
          >
            <h2
              className="cv-section-title"
              style={{
                display: 'flex',
                alignItems: 'baseline',
                gap: '0.45em',
                marginBottom: '0.55em',
              }}
            >
              <span
                aria-hidden
                style={{
                  fontSize: '2em',
                  lineHeight: 1,
                  fontWeight: headingWeight(c, 800),
                  letterSpacing: '-0.04em',
                  color: tint(accent, 0.6),
                }}
              >
                {String(index + 1).padStart(2, '0')}
              </span>
              <span
                style={{
                  fontSize: '1.06em',
                  fontWeight: headingWeight(c, 700),
                  textTransform: headingTransform(c),
                  letterSpacing: headingTracking(c),
                  color: c.secondaryColor,
                }}
              >
                {section.label}
              </span>
            </h2>

            <SectionContent
              sectionId={section.id}
              cv={cv}
              c={c}
              accent={accent}
              color={c.textColor}
              muted={muted}
              rule={tint(accent, 0.74)}
              variants={{
                experience: 'stack',
                education: 'stack',
                projects: 'cards',
                languages: 'grid',
                interests: 'tags',
                references: 'grid',
                certifications: 'compact',
                awards: 'compact',
              }}
              skillDisplay="tags"
            />
          </section>
        ))}
      </div>
    </div>
  );
}
