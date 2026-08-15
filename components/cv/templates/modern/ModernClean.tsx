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
  id: 'modern-09',
  slug: 'modern-clean',
  name: 'Modern Clean',
  category: 'modern',
  premium: false,
  atsScore: 5,
  columns: 1,
  hasPhoto: true,
  accentDefault: '#059669',
  fonts: { heading: 'lato', body: 'lato' },
  metrics: { lineHeight: 1.54, pageMargin: 48 },
  tagline: 'A hairline spine with accent markers threads every section into one continuous read.',
  description:
    'Modern Clean runs a single hairline down the left of the page and marks each section with a small accent dot, so the eye follows one unbroken line from your summary to your final qualification. Dates sit in their own narrow column beside each role and degree, which makes progression legible in a two-second scan. Underneath the decoration the document is one linear text flow, so it parses exactly as it reads.',
  bestFor: [
    'Graduates and early-career professionals',
    'European applications that expect a photo',
    'Anyone who wants structure without heavy colour',
  ],
  features: [
    'Continuous hairline spine with accent section markers',
    'Photo header with stacked name, title and contacts',
    'Dated two-column experience and education',
    'Single linear text flow for parsers',
  ],
  keywords: [
    'clean cv template',
    'minimalist cv template',
    'modern cv template with photo',
    'simple professional cv',
  ],
};

/** Half the width of the marker gutter, in em — the hairline sits on this axis. */
const GUTTER_HALF = 1.2;

/**
 * Modern Clean — single column with a marker gutter.
 *
 * The spine is a real `border-left` on the body wrapper rather than an absolutely
 * positioned bar, so Chromium redraws it on every page of the exported PDF. Each section
 * marker is a dot pinned to that axis with a white ring that masks the line behind it.
 */
export default function ModernClean({ cv, customization: c }: CVTemplateProps) {
  const accent = c.accentColor;
  const accentText = accentOn(accent);
  const sections = visibleSections(cv);
  const name = fullName(cv);
  const hairline = tint(accent, 0.7);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', minHeight: 'inherit' }}>
      <header
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: '1.25em',
          padding: `${c.pageMargin}px ${c.pageMargin}px ${c.pageMargin * 0.6}px`,
          borderBottom: `1px solid ${tint(accent, 0.82)}`,
        }}
      >
        <Photo
          cv={cv}
          c={c}
          size={88}
          border={hairline}
          borderWidth={2}
          fallbackBackground={accent}
        />
        <div style={{ minWidth: 0, flex: 1 }}>
          <h1
            style={{
              fontSize: '2.4em',
              lineHeight: 1.08,
              fontWeight: headingWeight(c, 600),
              color: c.secondaryColor,
              letterSpacing: '-0.018em',
            }}
          >
            {name || 'Your Name'}
          </h1>
          {cv.personal.title ? (
            <p
              style={{
                fontSize: '1.05em',
                color: accentText,
                fontWeight: bodyWeight(c, 600),
                marginTop: '0.18em',
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
              gap="0.4em 1.05em"
              fontSize="0.9em"
            />
          </div>
        </div>
      </header>

      <div
        style={{
          padding: `${c.pageMargin * 0.7}px ${c.pageMargin}px ${c.pageMargin}px`,
          flex: 1,
        }}
      >
        <div
          style={{
            marginLeft: `${GUTTER_HALF}em`,
            paddingLeft: `${GUTTER_HALF}em`,
            borderLeft: `1px solid ${hairline}`,
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
                  left: `-${GUTTER_HALF}em`,
                  marginLeft: '-0.27em',
                  top: '0.36em',
                  width: '0.54em',
                  height: '0.54em',
                  borderRadius: '50%',
                  background: accent,
                  boxShadow: '0 0 0 3px #ffffff',
                }}
              />
              <h2
                className="cv-section-title"
                style={{
                  fontSize: '0.95em',
                  fontWeight: headingWeight(c, 700),
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
                variants={{
                  experience: 'two-col',
                  education: 'two-col',
                  projects: 'stack',
                  certifications: 'compact',
                  languages: 'grid',
                  interests: 'inline',
                  references: 'grid',
                }}
                skillColumns={2}
              />
            </section>
          ))}
        </div>
      </div>
    </div>
  );
}
