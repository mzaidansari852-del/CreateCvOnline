import { ContactList, Photo, SectionContent } from '@/components/cv/parts';
import { fullName, headingTracking, headingTransform, tint } from '@/lib/cv/format';
import { visibleSections } from '@/lib/cv/sections';
import type { CVTemplateProps, TemplateMeta } from '@/types/cv';

export const meta: TemplateMeta = {
  id: 'tech-07',
  slug: 'it-professional-cv',
  name: 'IT Professional',
  category: 'technology',
  premium: true,
  atsScore: 5,
  columns: 1,
  hasPhoto: true,
  accentDefault: '#1d4ed8',
  tagline: 'A conventional corporate layout with an edge-to-edge contact strip under the header.',
  description:
    'IT Professional follows the layout corporate IT departments expect: your name on the left, a photo top right, and one tinted strip running edge to edge beneath them carrying every contact detail in a single line. Everything under that strip is a plain single column with chevron-marked headings and a hairline rule reaching to the page edge, so the structure is obvious to a reader skimming twenty applications and unambiguous to the parser that indexed them first. Skills sit in a three-column grid, which fits a long support or infrastructure toolset onto one page.',
  bestFor: [
    'IT support and service desk professionals',
    'Systems, network and infrastructure administrators',
    'Internal IT roles at large or regulated organisations',
  ],
  features: [
    'Edge-to-edge tinted contact strip',
    'Name left, photo top right',
    'Chevron headings with a hairline rule to the margin',
    'Three-column skills grid',
  ],
  keywords: [
    'it cv template',
    'it support cv template',
    'system administrator resume template',
    'network administrator cv',
  ],
};

/**
 * IT Professional — conventional corporate single column.
 *
 * The only structural flourish is the contact strip, which breaks out of the page padding
 * to separate identity from content. Everything below it is deliberately ordinary: one
 * column, one heading style, no boxes, which is what keeps the ATS score at five.
 */
export default function ItProfessional({ cv, customization: c }: CVTemplateProps) {
  const accent = c.accentColor;
  const muted = tint(c.textColor, 0.38);
  const sections = visibleSections(cv);
  const name = fullName(cv);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', minHeight: 'inherit' }}>
      <header
        style={{
          padding: `${c.pageMargin}px ${c.pageMargin}px ${c.pageMargin * 0.62}px`,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: '1.5em',
        }}
      >
        <div style={{ minWidth: 0 }}>
          <h1
            style={{
              fontSize: '2.25em',
              lineHeight: 1.1,
              fontWeight: 700,
              letterSpacing: '-0.01em',
              color: c.secondaryColor,
            }}
          >
            {name || 'Your Name'}
          </h1>
          {cv.personal.title ? (
            <p
              style={{
                marginTop: '0.25em',
                fontSize: '1.05em',
                fontWeight: 600,
                color: accent,
              }}
            >
              {cv.personal.title}
            </p>
          ) : null}
        </div>

        <Photo
          cv={cv}
          c={c}
          size={94}
          border={tint(accent, 0.68)}
          borderWidth={2}
          fallbackBackground={accent}
        />
      </header>

      <div
        style={{
          background: tint(accent, 0.94),
          borderTop: `1px solid ${tint(accent, 0.74)}`,
          borderBottom: `1px solid ${tint(accent, 0.74)}`,
          padding: `0.5em ${c.pageMargin}px`,
        }}
      >
        <ContactList
          cv={cv}
          accent={accent}
          color={c.textColor}
          icons={c.showIcons}
          layout="inline"
          gap="0.25em 1.4em"
          fontSize="0.88em"
        />
      </div>

      <main
        style={{
          flex: 1,
          padding: `${c.pageMargin * 0.8}px ${c.pageMargin}px ${c.pageMargin}px`,
        }}
      >
        {sections.map((section, index) => (
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
                gap: '0.55em',
                fontSize: '0.96em',
                fontWeight: 700,
                lineHeight: 1.35,
                textTransform: headingTransform(c),
                letterSpacing: headingTracking(c),
                color: c.secondaryColor,
                marginBottom: '0.55em',
              }}
            >
              <span
                aria-hidden
                style={{
                  width: 0,
                  height: 0,
                  flexShrink: 0,
                  borderTop: '0.32em solid transparent',
                  borderBottom: '0.32em solid transparent',
                  borderLeft: `0.44em solid ${accent}`,
                }}
              />
              {section.label}
              <span
                aria-hidden
                style={{ flex: 1, height: 1, background: tint(accent, 0.6) }}
              />
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
                education: 'compact',
                projects: 'compact',
                certifications: 'stack',
                awards: 'compact',
                volunteer: 'compact',
                publications: 'compact',
                languages: 'grid',
                interests: 'inline',
                references: 'grid',
              }}
              skillColumns={3}
            />
          </section>
        ))}
      </main>
    </div>
  );
}
