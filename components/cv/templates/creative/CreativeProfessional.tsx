import { ContactList, Photo, SectionContent } from '@/components/cv/parts';
import {
  accentOn,
  bodyWeight,
  fullName,
  headingTracking,
  headingTransform,
  headingWeight,
  tint,
} from '@/lib/cv/format';
import { visibleSections } from '@/lib/cv/sections';
import type { CVTemplateProps, TemplateMeta } from '@/types/cv';

export const meta: TemplateMeta = {
  id: 'creative-07',
  slug: 'creative-professional-cv',
  name: 'Creative Professional',
  category: 'creative',
  premium: false,
  atsScore: 4,
  columns: 1,
  hasPhoto: true,
  accentDefault: '#0d9488',
  fonts: { heading: 'lora', body: 'lato' },
  metrics: { lineHeight: 1.54, pageMargin: 46 },
  tagline: 'Portrait, name and contact share one header line above a plain, parser-safe column.',
  description:
    'Creative Professional keeps the personality of a design CV — a portrait, a strong accent colour, a marker bar above every heading — without pushing anything into a second column that an applicant tracking system would have to reassemble. The header divides into three: photo on the left, name and role in the middle, contact details stacked on the right, so the top of the page stays readable even when you list six links. Skills are scored with five dots instead of bars, which stays legible when the CV is printed in greyscale.',
  bestFor: [
    'Designers and art directors applying through job portals',
    'Marketing, content and brand professionals',
    'Creatives who want one CV that works everywhere',
  ],
  features: [
    'Three-part header with portrait and stacked contact',
    'Accent marker bar above every section heading',
    'Five-dot skill ratings that print in greyscale',
    'Single-column body an ATS can read end to end',
  ],
  keywords: [
    'creative cv template',
    'creative professional resume',
    'designer cv template',
    'ats friendly creative cv',
  ],
};

/**
 * Creative Professional — the restrained member of the creative family.
 *
 * Everything expressive is confined to the header row and a 24×4 accent marker that sits
 * on its own line above each heading; the body itself is an ordinary single column, which
 * is why this design still scores well with parsers.
 */
export default function CreativeProfessional({ cv, customization: c }: CVTemplateProps) {
  const accent = c.accentColor;
  const accentText = accentOn(accent);
  const sections = visibleSections(cv);
  const name = fullName(cv);
  // The rounded square frame is structural here — a circle would collide with the
  // squared-off marker bars used throughout the document.
  const photoCustomization = { ...c, photoShape: 'rounded' as const };

  return (
    <div style={{ padding: c.pageMargin, minHeight: 'inherit' }}>
      <header
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: '1.3em',
          paddingBottom: '1.05em',
          borderBottom: `1px solid ${tint(accent, 0.7)}`,
        }}
      >
        <Photo
          cv={cv}
          c={photoCustomization}
          size={88}
          border={tint(accent, 0.72)}
          borderWidth={2}
          fallbackBackground={accent}
        />

        <div style={{ flex: 1, minWidth: 0 }}>
          <h1
            style={{
              fontSize: '2.8em',
              lineHeight: 1.1,
              fontWeight: headingWeight(c, 500),
              color: c.secondaryColor,
              letterSpacing: '-0.012em',
            }}
          >
            {name || 'Your Name'}
          </h1>
          {cv.personal.title ? (
            <p
              style={{
                marginTop: '0.25em',
                fontSize: '1.02em',
                fontWeight: bodyWeight(c, 600),
                color: accentText,
                letterSpacing: '0.03em',
              }}
            >
              {cv.personal.title}
            </p>
          ) : null}
        </div>

        <div style={{ flexShrink: 0, maxWidth: '38%' }}>
          <ContactList
            cv={cv}
            accent={accent}
            color={c.textColor}
            icons={c.showIcons}
            layout="stack"
            fontSize="0.88em"
          />
        </div>
      </header>

      <div style={{ marginTop: `${c.sectionSpacing}px` }}>
        {sections.map((section, index) => (
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
                color: c.secondaryColor,
                textTransform: headingTransform(c),
                letterSpacing: headingTracking(c),
                marginBottom: '0.55em',
              }}
            >
              <span
                aria-hidden
                style={{
                  display: 'block',
                  width: 24,
                  height: 4,
                  borderRadius: 1,
                  background: accent,
                  marginBottom: '0.5em',
                }}
              />
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
                languages: 'grid',
                interests: 'inline',
                references: 'grid',
              }}
              skillDisplay="dots"
              skillColumns={2}
            />
          </section>
        ))}
      </div>
    </div>
  );
}
