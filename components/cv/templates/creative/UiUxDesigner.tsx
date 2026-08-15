import { ContactList, SectionContent } from '@/components/cv/parts';
import {
  bodyWeight,
  fullName,
  headingTracking,
  headingTransform,
  headingWeight,
  shade,
  tint,
} from '@/lib/cv/format';
import { splitSections, visibleSections } from '@/lib/cv/sections';
import type { CVCustomization, CVTemplateProps, TemplateMeta } from '@/types/cv';

export const meta: TemplateMeta = {
  id: 'creative-03',
  slug: 'ui-ux-designer-cv',
  name: 'UI/UX Designer',
  category: 'creative',
  premium: true,
  atsScore: 4,
  columns: 2,
  hasPhoto: false,
  accentDefault: '#6366f1',
  fonts: { heading: 'inter', body: 'inter' },
  metrics: { lineHeight: 1.42, pageMargin: 44 },
  tagline: 'A design-system look: a component-card header and chip section labels.',
  description:
    'UI/UX Designer borrows the vocabulary of a design system — the header is a bordered component card with your job title in a label chip, and every section heading is a rounded badge instead of a rule. Skills render as tags and projects as cards, which is how most product designers want their work indexed by a hiring manager skimming for tools and outcomes. The body is two columns, but the wide column keeps the whole career narrative in order, so it parses noticeably better than most graphical creative layouts.',
  bestFor: [
    'Product, UI and UX designers',
    'Design-system and design-engineering roles',
    'Designers applying to in-house product teams',
  ],
  features: [
    'Component-card header with a title chip',
    '65 / 35 two-column body',
    'Chip-style section headings',
    'Skill tags and project cards',
  ],
  keywords: [
    'ui ux designer cv template',
    'product designer resume template',
    'ux cv template',
    'design system cv template',
  ],
};

const SIDEBAR_SECTIONS = ['skills', 'languages', 'certifications', 'interests'];

/**
 * UI/UX Designer — a "component card" header above a 65/35 body.
 *
 * Every heading is a chip so the document reads like a spec sheet; there is no photo,
 * which keeps the card header tidy at any font size.
 */
export default function UiUxDesigner({ cv, customization: c }: CVTemplateProps) {
  const accent = c.accentColor;
  const sections = visibleSections(cv);
  const { main, aside } = splitSections(sections, SIDEBAR_SECTIONS);
  const border = tint(accent, 0.62);

  return (
    <div style={{ padding: c.pageMargin, minHeight: 'inherit' }}>
      <header
        style={{
          border: `1px solid ${border}`,
          borderRadius: 14,
          padding: '1.05em 1.15em',
          background: tint(accent, 0.975),
        }}
      >
        <div
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'flex-start',
            gap: '1.2em',
          }}
        >
          <div style={{ minWidth: 0 }}>
            <span aria-hidden style={{ display: 'flex', gap: '0.3em', marginBottom: '0.55em' }}>
              <span
                style={{
                  width: '0.42em',
                  height: '0.42em',
                  borderRadius: '50%',
                  background: accent,
                }}
              />
              <span
                style={{
                  width: '0.42em',
                  height: '0.42em',
                  borderRadius: '50%',
                  background: tint(accent, 0.45),
                }}
              />
              <span
                style={{
                  width: '0.42em',
                  height: '0.42em',
                  borderRadius: '50%',
                  background: tint(accent, 0.72),
                }}
              />
            </span>
            <h1
              style={{
                fontSize: '2.35em',
                lineHeight: 1.05,
                fontWeight: headingWeight(c, 600),
                letterSpacing: '-0.02em',
                color: c.secondaryColor,
              }}
            >
              {fullName(cv) || 'Your Name'}
            </h1>
          </div>

          {cv.personal.title ? (
            <span
              style={{
                maxWidth: '42%',
                textAlign: 'right',
                fontSize: '0.74em',
                fontWeight: bodyWeight(c, 700),
                letterSpacing: '0.08em',
                textTransform: 'uppercase',
                color: shade(accent, 0.25),
                background: tint(accent, 0.86),
                border: `1px solid ${tint(accent, 0.68)}`,
                borderRadius: 999,
                padding: '0.25em 0.75em',
              }}
            >
              {cv.personal.title}
            </span>
          ) : null}
        </div>

        <div style={{ marginTop: '0.8em' }}>
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
           * 35% of the page is reserved for the sidebar.
           * Turn off skills, languages, certifications and interests and there is nothing
           * to put here — reserving the column anyway leaves a third of every page blank.
           */
          gridTemplateColumns: aside.length > 0 ? 'minmax(0, 65fr) minmax(0, 35fr)' : '1fr',
          columnGap: '1.7em',
          alignItems: 'start',
          marginTop: `${c.sectionSpacing * 1.15}px`,
        }}
      >
        <div>
          {main.map((section, index) => (
            <section
              key={section.id}
              className="cv-section"
              style={{ marginTop: index === 0 ? 0 : `${c.sectionSpacing}px` }}
            >
              <ChipHeading label={section.label} accent={accent} c={c} />
              <SectionContent
                sectionId={section.id}
                cv={cv}
                c={c}
                accent={accent}
                color={c.textColor}
                rule={border}
                variants={{
                  experience: 'stack',
                  education: 'stack',
                  projects: 'cards',
                  volunteer: 'stack',
                  references: 'grid',
                }}
                skillDisplay="tags"
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
                style={{ marginTop: index === 0 ? 0 : `${c.sectionSpacing}px` }}
              >
                <ChipHeading label={section.label} accent={accent} c={c} />
                <SectionContent
                  sectionId={section.id}
                  cv={cv}
                  c={c}
                  accent={accent}
                  color={c.textColor}
                  rule={border}
                  variants={{
                    languages: 'stack',
                    certifications: 'compact',
                    interests: 'tags',
                  }}
                  skillDisplay="tags"
                  skillColumns={1}
                />
              </section>
            ))}
          </aside>
        ) : null}
      </div>
    </div>
  );
}

function ChipHeading({ label, accent, c }: { label: string; accent: string; c: CVCustomization }) {
  return (
    <h2
      className="cv-section-title"
      style={{
        display: 'inline-block',
        fontSize: '0.76em',
        fontWeight: headingWeight(c, 700),
        color: shade(accent, 0.3),
        background: tint(accent, 0.88),
        borderRadius: 6,
        padding: '0.24em 0.7em',
        marginBottom: '0.65em',
        textTransform: headingTransform(c),
        letterSpacing: headingTracking(c),
      }}
    >
      {label}
    </h2>
  );
}
