import { ContactList, Photo, SectionContent } from '@/components/cv/parts';
import {
  accentOn,
  bodyWeight,
  displayName,
  headingTracking,
  headingTransform,
  headingWeight,
  tint,
} from '@/lib/cv/format';
import { visibleSections } from '@/lib/cv/sections';
import type { CVTemplateProps, TemplateMeta } from '@/types/cv';

export const meta: TemplateMeta = {
  id: 'creative-08',
  slug: 'portfolio-cv',
  name: 'Portfolio Style',
  category: 'creative',
  premium: true,
  atsScore: 2,
  columns: 1,
  hasPhoto: true,
  accentDefault: '#7c3aed',
  fonts: { heading: 'ibm-plex-sans', body: 'ibm-plex-sans' },
  metrics: { lineHeight: 1.42, pageMargin: 32 },
  tagline: 'Your projects get the big type and a tinted card grid; everything else stays compact.',
  description:
    'Portfolio Style inverts the usual hierarchy: the header shrinks to a single line and the Projects section takes the space, rendered as a grid of cards on a tinted panel at a larger type size than the rest of the document. Experience, education and certifications sit underneath in compact form, so a page that would normally list four jobs instead shows the work you actually want discussed. Headings are set in lowercase with a thick highlighter swipe under the text — deliberately expressive, which is why the ATS score is low; send it to a person, not a portal.',
  bestFor: [
    'Freelancers and contractors pitching on their work',
    'Product and UX designers with a project-led story',
    'Developers and makers who lead with side projects',
  ],
  features: [
    'Projects promoted to a tinted card grid at larger scale',
    'Single-line compact header with small portrait',
    'Lowercase headings with a highlighter swipe',
    'Wrapping skill chips',
    'Compact experience and education entries',
  ],
  keywords: [
    'portfolio cv template',
    'project based cv',
    'freelance designer cv',
    'creative portfolio resume',
  ],
};

/**
 * Portfolio Style — project-first.
 *
 * The Projects section keeps a card grid, a tinted panel and a full-size heading while
 * every other section is deliberately compressed, so the page reads as a work index with
 * a career appended rather than the other way round.
 */
export default function PortfolioStyle({ cv, customization: c }: CVTemplateProps) {
  const accent = c.accentColor;
  const accentText = accentOn(accent);
  const sections = visibleSections(cv);

  // Lowercase headings are this template's signature and the heading-case control has no
  // lowercase option, so the default (uppercase) maps to it; an explicit capitalise/none
  // choice still wins, and the tracking follows suit.
  const lowered = c.headingCase === 'uppercase';
  const headingCase = lowered ? 'lowercase' : headingTransform(c);
  const tracking = lowered ? '0.01em' : headingTracking(c);

  return (
    <div style={{ padding: c.pageMargin, minHeight: 'inherit' }}>
      <header style={{ display: 'flex', alignItems: 'center', gap: '0.85em' }}>
        <Photo cv={cv} c={c} size={54} fallbackBackground={accent} />
        <div style={{ minWidth: 0, flex: 1 }}>
          <div
            style={{
              display: 'flex',
              alignItems: 'baseline',
              flexWrap: 'wrap',
              gap: '0.15em 0.6em',
            }}
          >
            <h1
              style={{
                fontSize: '1.9em',
                lineHeight: 1.12,
                fontWeight: headingWeight(c, 700),
                color: c.secondaryColor,
                letterSpacing: '-0.015em',
              }}
            >
              {displayName(cv)}
            </h1>
            {cv.personal.title ? (
              <p style={{ fontWeight: bodyWeight(c, 600), color: accentText }}>{cv.personal.title}</p>
            ) : null}
          </div>
          <div style={{ marginTop: '0.25em' }}>
            <ContactList
              cv={cv}
              accent={accent}
              color={c.textColor}
              icons={c.showIcons}
              layout="inline"
              gap="0.15em 0.9em"
              fontSize="0.86em"
            />
          </div>
        </div>
      </header>

      <div style={{ marginTop: `${c.sectionSpacing}px` }}>
        {sections.map((section, index) => {
          const promoted = section.id === 'projects';
          // The heading is inline-block so the swipe stops at the end of the text, which
          // means the body has to be a block of its own or an inline section body
          // (languages, interests) would run on from the heading.
          const body = (
            <div>
              <SectionContent
                sectionId={section.id}
                cv={cv}
                c={c}
                accent={accent}
                color={c.textColor}
                rule={promoted ? tint(accent, 0.62) : undefined}
                variants={{
                  experience: 'compact',
                  education: 'compact',
                  projects: 'cards',
                  certifications: 'compact',
                  awards: 'compact',
                  volunteer: 'compact',
                  publications: 'compact',
                  languages: 'inline',
                  interests: 'tags',
                  references: 'grid',
                }}
                skillDisplay="tags"
              />
            </div>
          );

          return (
            <section
              key={section.id}
              className="cv-section"
              style={{ marginTop: index === 0 ? 0 : `${c.sectionSpacing}px` }}
            >
              <h2
                className="cv-section-title"
                style={{
                  display: 'inline-block',
                  fontSize: promoted ? '1.5em' : '1.12em',
                  lineHeight: 1.2,
                  fontWeight: headingWeight(c, 700),
                  color: promoted ? accent : c.secondaryColor,
                  textTransform: headingCase,
                  letterSpacing: tracking,
                  // Highlighter swipe: a solid band behind the descenders that stops at the
                  // end of the text instead of running the width of the column.
                  backgroundImage: `linear-gradient(to top, ${tint(accent, promoted ? 0.5 : 0.68)} ${
                    promoted ? '0.24em' : '0.16em'
                  }, transparent ${promoted ? '0.24em' : '0.16em'})`,
                  paddingRight: '0.12em',
                  marginBottom: promoted ? '0.55em' : '0.4em',
                }}
              >
                {section.label}
              </h2>

              {promoted ? (
                <div
                  style={{
                    fontSize: '1.06em',
                    background: tint(accent, 0.95),
                    border: `1px solid ${tint(accent, 0.84)}`,
                    borderRadius: 10,
                    padding: '0.85em 0.95em',
                  }}
                >
                  {body}
                </div>
              ) : (
                body
              )}
            </section>
          );
        })}
      </div>
    </div>
  );
}
