import { ContactList, Photo, SectionContent } from '@/components/cv/parts';
import {
  accentOn,
  displayName,
  headingTracking,
  headingTransform,
  headingWeight,
  mutedOn,
  shade,
  tint,
} from '@/lib/cv/format';
import { visibleSections } from '@/lib/cv/sections';
import type { CVTemplateProps, TemplateMeta } from '@/types/cv';

export const meta: TemplateMeta = {
  id: 'classic-07',
  slug: 'elegant-serif-cv',
  name: 'Elegant Serif',
  category: 'classic',
  premium: true,
  atsScore: 4,
  columns: 1,
  hasPhoto: true,
  accentDefault: '#4a3728',
  fonts: { heading: 'garamond', body: 'garamond' },
  metrics: { lineHeight: 1.54, pageMargin: 68 },
  tagline: 'A portrait inside a double hairline frame, over centred small-caps headings.',
  description:
    'Elegant Serif treats the top of the CV as a title page: a portrait centred above your name, the role in italics beneath it, and the whole block held inside two hairline rules set a fraction apart. Section headings are centred small caps with a rule that spans only the words themselves, so the structure is marked without cutting the page into bands. It is built for a serif body font — EB Garamond, Lora or Libre Baskerville — and prints as calmly as it reads on screen.',
  bestFor: [
    'Academics, editors and researchers',
    'Arts, heritage and culture applications',
    'Candidates who want a portrait on a formal CV',
  ],
  features: [
    'Double hairline frame around the header',
    'Centred portrait with an italic job title',
    'Centred small-caps headings on a text-width rule',
    'Generous leading tuned for serif body fonts',
  ],
  keywords: [
    'elegant cv template',
    'serif cv template',
    'cv template with photo',
    'formal resume template',
  ],
};

/**
 * Elegant Serif — the refined archetype.
 *
 * Two structural devices carry the design. The header is enclosed by a genuine double rule
 * (two 1px frames separated by a hair of padding, which Chromium renders more evenly than
 * `border-style: double` at small sizes), and every section heading is centred with an
 * inline-block underline so the rule measures the words rather than the column. Everything
 * else is left ranged so the body stays as scannable as any conventional CV.
 */
export default function ElegantSerif({ cv, customization: c }: CVTemplateProps) {
  const accent = c.accentColor;
  const accentText = accentOn(accent);
  const frame = tint(accent, 0.5);
  const hair = tint(accent, 0.45);
  const muted = mutedOn(c.textColor, 0.34);
  const tracking = c.headingCase === 'uppercase' ? '0.24em' : headingTracking(c);
  const sections = visibleSections(cv);

  return (
    <div
      style={{
        padding: `${Math.round(c.pageMargin * 1.05)}px ${c.pageMargin}px ${c.pageMargin}px`,
      }}
    >
      <header className="cv-block" style={{ border: `1px solid ${frame}`, padding: '0.25em' }}>
        <div
          style={{
            border: `1px solid ${frame}`,
            padding: '1.3em 1.5em',
            textAlign: 'center',
          }}
        >
          {c.showPhoto ? (
            <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '0.85em' }}>
              <Photo
                cv={cv}
                c={c}
                size={92}
                border={frame}
                borderWidth={1}
                fallbackBackground={tint(accent, 0.86)}
                fallbackColor={shade(accent, 0.15)}
              />
            </div>
          ) : null}

          <h1
            style={{
              fontSize: '3.1em',
              lineHeight: 1.2,
              fontWeight: headingWeight(c, 400),
              textTransform: 'uppercase',
              letterSpacing: '0.12em',
              color: c.secondaryColor,
            }}
          >
            {displayName(cv)}
          </h1>

          {cv.personal.title ? (
            <p
              style={{
                marginTop: '0.35em',
                fontSize: '1.06em',
                fontStyle: 'italic',
                color: accentText,
              }}
            >
              {cv.personal.title}
            </p>
          ) : null}

          <div style={{ display: 'flex', justifyContent: 'center', marginTop: '0.8em' }}>
            <ContactList
              cv={cv}
              accent={accent}
              color={muted}
              icons={c.showIcons}
              layout="inline"
              separator="   ·   "
              gap="0.3em 1em"
              fontSize="0.9em"
            />
          </div>
        </div>
      </header>

      {sections.map((section) => (
        <section
          key={section.id}
          className="cv-section"
          style={{ marginTop: `${Math.round(c.sectionSpacing * 1.15)}px` }}
        >
          <h2
            className="cv-section-title"
            style={{
              textAlign: 'center',
              fontSize: '0.94em',
              fontWeight: headingWeight(c, 600),
              lineHeight: 1.8,
              color: c.secondaryColor,
              marginBottom: '0.75em',
            }}
          >
            <span
              style={{
                display: 'inline-block',
                paddingBottom: '0.35em',
                paddingLeft: '0.5em',
                paddingRight: '0.5em',
                borderBottom: `1px solid ${hair}`,
                fontVariant: 'small-caps',
                textTransform: headingTransform(c),
                letterSpacing: tracking,
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
            rule={hair}
            gap={1.05}
            variants={{
              experience: 'stack',
              education: 'stack',
              projects: 'stack',
              certifications: 'stack',
              awards: 'stack',
              volunteer: 'stack',
              publications: 'stack',
              languages: 'inline',
              interests: 'inline',
              references: 'grid',
            }}
            skillColumns={2}
          />
        </section>
      ))}
    </div>
  );
}
