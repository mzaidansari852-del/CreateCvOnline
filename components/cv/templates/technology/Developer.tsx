import { ContactList, SectionContent } from '@/components/cv/parts';
import {
  accentOn,
  mutedOn,
  fullName,
  headingTracking,
  headingTransform,
  tint,
} from '@/lib/cv/format';
import { splitSections, visibleSections } from '@/lib/cv/sections';
import type { CVTemplateProps, TemplateMeta } from '@/types/cv';

export const meta: TemplateMeta = {
  id: 'tech-02',
  slug: 'developer-cv',
  name: 'Developer',
  category: 'technology',
  premium: true,
  atsScore: 4,
  columns: 2,
  hasPhoto: false,
  accentDefault: '#16a34a',
  tagline:
    'A tinted, bordered sidebar box beside your experience — structure without a colour band.',
  description:
    'Developer keeps the stack, certifications and languages in a bordered, lightly tinted box that floats inside the page margin, so the reference material is visibly separated from your experience without a full-height colour band bleeding off the page. The header runs the full width above both columns, and roles in the main column use a dated left rail that makes a long sequence of short contracts easy to follow. Section headings are marked with a small accent chevron; sidebar headings are set in small caps so the two columns never compete.',
  bestFor: [
    'Full-stack and mobile developers',
    'Contractors with many short engagements',
    'Engineers with a long list of tools and certifications',
  ],
  features: [
    'Bordered, tinted sidebar box inside the page margin',
    'Full-width header above both columns',
    'Dated two-column experience entries',
    'Small-caps sidebar headings and chevron section markers',
  ],
  keywords: [
    'developer cv template',
    'programmer resume template',
    'two column developer cv',
    'full stack developer cv',
  ],
};

const SIDEBAR_SECTIONS = ['skills', 'languages', 'certifications', 'interests', 'references'];

/**
 * Developer — boxed sidebar.
 *
 * The sidebar is a card, not a band: it starts and stops inside the page margin, so there
 * is deliberately no `pageBackground` export and nothing to continue onto page two.
 */
export default function Developer({ cv, customization: c }: CVTemplateProps) {
  const accent = c.accentColor;
  const accentText = accentOn(accent);
  const sections = visibleSections(cv);
  const { main, aside } = splitSections(sections, SIDEBAR_SECTIONS);
  const name = fullName(cv);
  const muted = mutedOn(c.textColor, 0.32);
  const hairline = tint(c.textColor, 0.7);

  return (
    <div style={{ padding: c.pageMargin, minHeight: 'inherit' }}>
      <header style={{ paddingBottom: '0.8em', borderBottom: `1px solid ${hairline}` }}>
        <div
          style={{ display: 'flex', alignItems: 'baseline', flexWrap: 'wrap', gap: '0.15em 0.5em' }}
        >
          <h1
            style={{
              fontSize: '2.05em',
              lineHeight: 1.08,
              fontWeight: 700,
              color: c.secondaryColor,
              letterSpacing: '-0.015em',
            }}
          >
            {name || 'Your Name'}
          </h1>
          {cv.personal.title ? (
            <>
              <span aria-hidden style={{ color: accentText, fontWeight: 700, fontSize: '1.2em' }}>
                /
              </span>
              <p style={{ fontSize: '1.04em', fontWeight: 600, color: accentText }}>
                {cv.personal.title}
              </p>
            </>
          ) : null}
        </div>
        <div style={{ marginTop: '0.5em' }}>
          <ContactList
            cv={cv}
            accent={accent}
            color={c.textColor}
            icons={c.showIcons}
            layout="inline"
            gap="0.25em 1.1em"
            fontSize="0.9em"
          />
        </div>
      </header>

      <div
        style={{
          display: 'grid',
          /*
           * The boxed sidebar has no box to draw.
           * Turn off skills, languages, certifications and interests and there is nothing
           * to put here — reserving the column anyway leaves a third of every page blank.
           */
          gridTemplateColumns: aside.length > 0 ? '32% 1fr' : '1fr',
          columnGap: '1.5em',
          marginTop: `${c.sectionSpacing}px`,
        }}
      >
        {/* -------------------------------------------------------------- aside */}
        {/* Rendered only when it has content: an empty landmark is noise for a screen
            reader and an empty column is a third of the page. */}
        {aside.length > 0 ? (
          <aside
            style={{
              alignSelf: 'start',
              border: `1px solid ${tint(accent, 0.68)}`,
              borderRadius: 10,
              background: tint(accent, 0.955),
              padding: '0.95em 1.05em',
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
                    fontSize: '0.96em',
                    fontWeight: 700,
                    // Small caps keep the sidebar quieter than the chevroned main headings
                    // while still reading as a heading at any heading-case setting.
                    fontVariantCaps: 'all-small-caps',
                    color: c.secondaryColor,
                    textTransform: headingTransform(c),
                    letterSpacing: headingTracking(c),
                    marginBottom: '0.4em',
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
                  muted={muted}
                  rule={tint(accent, 0.72)}
                  variants={{
                    languages: 'stack',
                    certifications: 'compact',
                    interests: 'tags',
                    references: 'stack',
                  }}
                  skillColumns={1}
                />
              </section>
            ))}
          </aside>
        ) : null}

        {/* --------------------------------------------------------------- main */}
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
                  fontSize: '1em',
                  fontWeight: 700,
                  color: c.secondaryColor,
                  textTransform: headingTransform(c),
                  letterSpacing: headingTracking(c),
                  marginBottom: '0.55em',
                }}
              >
                <span aria-hidden style={{ color: accentText, marginRight: '0.35em' }}>
                  ▸
                </span>
                {section.label}
              </h2>
              <SectionContent
                sectionId={section.id}
                cv={cv}
                c={c}
                accent={accent}
                color={c.textColor}
                muted={muted}
                variants={{
                  experience: 'two-col',
                  education: 'compact',
                  projects: 'stack',
                  volunteer: 'compact',
                  publications: 'stack',
                }}
              />
            </section>
          ))}
        </div>
      </div>
    </div>
  );
}
