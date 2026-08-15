import { ContactList, Photo, SectionContent } from '@/components/cv/parts';
import {
  accentOn,
  bodyWeight,
  fullName,
  headingTracking,
  headingTransform,
  headingWeight,
  mutedOn,
  readableOn,
  tint,
} from '@/lib/cv/format';
import { visibleSections } from '@/lib/cv/sections';
import type { CVTemplateProps, TemplateMeta } from '@/types/cv';

export const meta: TemplateMeta = {
  id: 'creative-04',
  slug: 'art-director-cv',
  name: 'Art Director',
  category: 'creative',
  premium: true,
  atsScore: 2,
  columns: 1,
  hasPhoto: true,
  accentDefault: '#0f172a',
  fonts: { heading: 'playfair', body: 'lato' },
  metrics: { lineHeight: 1.42, pageMargin: 36 },
  tagline: 'An editorial spread: dark masthead, bleeding photo, titles hung in the margin.',
  description:
    'Art Director is built like the opening spread of a magazine — a full-width masthead with your name reversed out of it, a photo bleeding off the right edge, and body sections whose titles hang in a wide left margin beside the text. The whitespace and hairline rules are the design, so it rewards copy that has been edited down rather than an exhaustive job history. The hanging-title grid and heavy header make it a poor fit for automated screening, so send a plain single-column version through job portals.',
  bestFor: [
    'Art directors and creative leads',
    'Editorial, fashion and advertising roles',
    'Senior creatives with a short, tightly edited CV',
  ],
  features: [
    'Full-bleed masthead with reversed-out name',
    'Photo bleeding to the right page edge',
    'Section titles hung in a 7em left margin',
    'Hairline rules and generous whitespace',
  ],
  keywords: [
    'art director cv template',
    'editorial resume template',
    'creative director cv template',
    'magazine style cv',
  ],
};

/**
 * Art Director — a dark masthead over an editorial body with hanging section titles.
 *
 * The masthead is intentionally the only block of colour: everything below it is white
 * space, hairlines and a 7em gutter that holds each section title beside its content.
 */
export default function ArtDirector({ cv, customization: c }: CVTemplateProps) {
  const accent = c.accentColor;
  const accentText = accentOn(accent);
  const onBand = readableOn(accent);
  // Dimmed toward the band and then measured, rather than a fixed alpha over whatever
  // colour the user picked — see `mutedOn`.
  const bandMuted = mutedOn(onBand, 0.32, accent);
  const hairline = tint(c.textColor, 0.8);
  const sections = visibleSections(cv);

  return (
    <div>
      <header
        style={{
          display: 'flex',
          alignItems: 'stretch',
          minHeight: 200,
          background: accent,
          color: onBand,
        }}
      >
        <div
          style={{
            flex: 1,
            minWidth: 0,
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'center',
            padding: `${c.pageMargin * 0.8}px ${c.pageMargin * 0.6}px ${c.pageMargin * 0.8}px ${c.pageMargin}px`,
          }}
        >
          <h1
            style={{
              fontSize: '3.3em',
              lineHeight: 1.02,
              fontWeight: headingWeight(c, 400),
              letterSpacing: '-0.02em',
              color: onBand,
            }}
          >
            {fullName(cv) || 'Your Name'}
          </h1>
          {cv.personal.title ? (
            <p
              style={{
                marginTop: '0.45em',
                fontSize: '0.82em',
                fontWeight: bodyWeight(c, 600),
                letterSpacing: '0.26em',
                textTransform: 'uppercase',
                color: bandMuted,
              }}
            >
              {cv.personal.title}
            </p>
          ) : null}
          <div style={{ marginTop: '0.9em' }}>
            <ContactList
              cv={cv}
              accent={onBand}
              surface={accent}
              color={bandMuted}
              icons={c.showIcons}
              layout="inline"
              iconColor={bandMuted}
              gap="0.35em 1em"
              fontSize="0.84em"
            />
          </div>
        </div>

        {c.showPhoto ? (
          <div style={{ display: 'flex', alignItems: 'center', flexShrink: 0 }}>
            <Photo
              cv={cv}
              c={c}
              size={200}
              fallbackBackground={tint(accent, 0.18)}
              fallbackColor={onBand}
            />
          </div>
        ) : null}
      </header>

      <div
        style={{
          padding: `${c.pageMargin * 0.95}px ${c.pageMargin}px ${c.pageMargin}px`,
        }}
      >
        {sections.map((section, index) => (
          <section
            key={section.id}
            className="cv-section"
            style={{
              display: 'grid',
              gridTemplateColumns: '7em minmax(0, 1fr)',
              columnGap: '1.6em',
              alignItems: 'start',
              marginTop: index === 0 ? 0 : `${c.sectionSpacing * 1.4}px`,
              paddingTop: index === 0 ? 0 : `${c.sectionSpacing * 0.95}px`,
              borderTop: index === 0 ? undefined : `1px solid ${hairline}`,
            }}
          >
            <h2
              className="cv-section-title"
              style={{
                fontSize: '0.72em',
                fontWeight: headingWeight(c, 700),
                lineHeight: 1.45,
                color: accentText,
                textTransform: headingTransform(c),
                letterSpacing: headingTracking(c),
                paddingTop: '0.35em',
                // Long labels lean into the gutter gap instead of breaking mid-word.
                overflowWrap: 'normal',
                hyphens: 'auto',
              }}
            >
              {section.label}
            </h2>
            <div style={{ minWidth: 0 }}>
              <SectionContent
                sectionId={section.id}
                cv={cv}
                c={c}
                accent={accent}
                color={c.textColor}
                rule={hairline}
                gap={1.25}
                variants={{
                  experience: 'stack',
                  education: 'stack',
                  projects: 'stack',
                  certifications: 'compact',
                  awards: 'compact',
                  languages: 'grid',
                  interests: 'inline',
                  references: 'grid',
                }}
                skillColumns={2}
              />
            </div>
          </section>
        ))}
      </div>
    </div>
  );
}
