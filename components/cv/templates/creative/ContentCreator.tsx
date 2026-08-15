import { ContactList, Photo, SectionContent } from '@/components/cv/parts';
import {
  accentOn,
  bodyWeight,
  displayName,
  headingTracking,
  headingTransform,
  headingWeight,
  shade,
  tint,
} from '@/lib/cv/format';
import { splitSections, visibleSections } from '@/lib/cv/sections';
import type { CVTemplateProps, TemplateMeta } from '@/types/cv';

export const meta: TemplateMeta = {
  id: 'creative-06',
  slug: 'content-creator-cv',
  name: 'Content Creator',
  category: 'creative',
  premium: true,
  atsScore: 3,
  columns: 2,
  hasPhoto: true,
  accentDefault: '#f43f5e',
  fonts: { heading: 'poppins', body: 'open-sans' },
  metrics: { lineHeight: 1.36, pageMargin: 32 },
  tagline: 'A social-profile header: gradient banner, overlapping avatar, handle-style title.',
  description:
    'Content Creator opens the way a social profile does — a rounded gradient banner, a circular avatar overlapping its lower edge, and your name with a handle-style title underneath. The narrow right column stacks bordered mini-cards for skills, languages, certifications and interests, so a brand or agency can scan your toolkit without scrolling past your best work. The banner and cards are decoration rather than structure, but the two-column body still parses less cleanly than a plain layout, so keep a simple version for portal uploads.',
  bestFor: [
    'Content creators and social media managers',
    'Video producers and community managers',
    'Freelancers pitching brands and agencies directly',
  ],
  features: [
    'Gradient banner with an overlapping avatar',
    'Handle-style title line',
    'Bordered mini-cards in the side column',
    'Skills rendered as tags',
  ],
  keywords: [
    'content creator cv template',
    'social media manager resume',
    'creative cv template with photo',
    'influencer cv template',
  ],
};

const CARD_SECTIONS = ['skills', 'languages', 'certifications', 'interests'];

/**
 * Content Creator — a social-profile header above a 68/32 body.
 *
 * The avatar overlaps the banner with a negative margin rather than absolute
 * positioning, so it can never land on top of the name at a large font size.
 */
export default function ContentCreator({ cv, customization: c }: CVTemplateProps) {
  const accent = c.accentColor;
  const accentText = accentOn(accent);
  const sections = visibleSections(cv);
  const { main, aside } = splitSections(sections, CARD_SECTIONS);
  const cardBorder = tint(accent, 0.7);
  const cardInk = shade(accent, 0.28);

  return (
    <div>
      <header style={{ padding: `${c.pageMargin}px ${c.pageMargin}px 0` }}>
        <div
          aria-hidden
          style={{
            height: 96,
            borderRadius: 16,
            background: `linear-gradient(115deg, ${shade(accent, 0.24)} 0%, ${accent} 52%, ${tint(accent, 0.45)} 100%)`,
          }}
        />

        <div style={{ display: 'flex', alignItems: 'flex-end', gap: '1.1em' }}>
          {c.showPhoto ? (
            <div style={{ marginTop: -46, flexShrink: 0 }}>
              <Photo
                cv={cv}
                c={c}
                size={98}
                border="#ffffff"
                borderWidth={4}
                fallbackBackground={shade(accent, 0.15)}
              />
            </div>
          ) : null}

          <div style={{ flex: 1, minWidth: 0, paddingTop: '0.7em' }}>
            <h1
              style={{
                fontSize: '2.15em',
                lineHeight: 1.08,
                fontWeight: headingWeight(c, 600),
                letterSpacing: '-0.02em',
                color: c.secondaryColor,
              }}
            >
              {displayName(cv)}
            </h1>
            {cv.personal.title ? (
              <p
                style={{
                  marginTop: '0.15em',
                  fontSize: '0.98em',
                  fontWeight: bodyWeight(c, 600),
                  color: accentText,
                }}
              >
                <span aria-hidden style={{ opacity: 0.75 }}>
                  @
                </span>
                {cv.personal.title}
              </p>
            ) : null}
          </div>
        </div>

        <div style={{ marginTop: '0.85em' }}>
          <ContactList
            cv={cv}
            accent={accent}
            color={c.textColor}
            icons={c.showIcons}
            layout="inline"
            gap="0.4em 1.05em"
            fontSize="0.88em"
          />
        </div>
      </header>

      <div
        style={{
          display: 'grid',
          /*
           * The card column carries the scannable sections.
           * Turn off skills, languages, certifications and interests and there is nothing
           * to put here — reserving the column anyway leaves a third of every page blank.
           */
          gridTemplateColumns: aside.length > 0 ? 'minmax(0, 68fr) minmax(0, 32fr)' : '1fr',
          columnGap: '1.4em',
          alignItems: 'start',
          padding: `${c.sectionSpacing * 1.2}px ${c.pageMargin}px ${c.pageMargin}px`,
        }}
      >
        <div>
          {main.map((section, index) => (
            <section
              key={section.id}
              className="cv-section"
              style={{ marginTop: index === 0 ? 0 : `${c.sectionSpacing}px` }}
            >
              <h2
                className="cv-section-title"
                style={{
                  fontSize: '0.92em',
                  fontWeight: headingWeight(c, 800),
                  color: c.secondaryColor,
                  borderLeft: `3px solid ${accent}`,
                  paddingLeft: '0.55em',
                  marginBottom: '0.6em',
                  textTransform: headingTransform(c),
                  letterSpacing: headingTracking(c),
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
                  education: 'compact',
                  projects: 'stack',
                  volunteer: 'compact',
                  references: 'grid',
                }}
              />
            </section>
          ))}
        </div>

        {/* Rendered only when it has content: an empty landmark is noise for a screen
            reader and an empty column is a third of the page. */}
        {aside.length > 0 ? (
          <aside>
            {aside.map((section, index) => (
              <section
                key={section.id}
                className="cv-section"
                style={{ marginTop: index === 0 ? 0 : '0.8em' }}
              >
                <div
                  className="cv-block"
                  style={{
                    border: `1px solid ${cardBorder}`,
                    borderRadius: 12,
                    padding: '0.8em 0.85em',
                    background: tint(accent, 0.96),
                  }}
                >
                  <h2
                    className="cv-section-title"
                    style={{
                      fontSize: '0.78em',
                      fontWeight: headingWeight(c, 800),
                      color: cardInk,
                      marginBottom: '0.5em',
                      textTransform: headingTransform(c),
                      letterSpacing: headingTracking(c),
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
                    rule={cardBorder}
                    variants={{
                      languages: 'dots',
                      certifications: 'compact',
                      interests: 'tags',
                    }}
                    skillDisplay="tags"
                    skillColumns={1}
                  />
                </div>
              </section>
            ))}
          </aside>
        ) : null}
      </div>
    </div>
  );
}
