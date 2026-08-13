import { ContactList, SectionContent } from '@/components/cv/parts';
import { fullName, headingTracking, headingTransform, tint } from '@/lib/cv/format';
import { visibleSections } from '@/lib/cv/sections';
import type { CVTemplateProps, TemplateMeta } from '@/types/cv';

export const meta: TemplateMeta = {
  id: 'tech-01',
  slug: 'software-engineer-cv',
  name: 'Software Engineer',
  category: 'technology',
  premium: false,
  atsScore: 5,
  columns: 1,
  hasPhoto: false,
  accentDefault: '#2563eb',
  tagline: 'One column, ruled headings and a stack written as prose — built to be parsed.',
  description:
    'Software Engineer is the plain-text-safe end of the technology set: no photo, no columns, no bars. Your name and role sit on the left of the header with contact details right-aligned opposite, separated from the body by a single accent rule, and each section heading is a bold uppercase line over a hairline. Skills are written out as "Languages: TypeScript, Go, Python" rather than drawn, so an applicant tracking system indexes the stack as text and a human still reads it in one pass.',
  bestFor: [
    'Backend, frontend and platform engineers',
    'Applications submitted through Greenhouse, Lever or Workday',
    'Engineers whose experience runs to two pages',
  ],
  features: [
    'Split header with right-aligned contact block',
    'Skills grouped by category and written as prose',
    'Achievement bullets under every role',
    'Project entries with technology tag rows',
    'Single column with no graphics for parsers',
  ],
  keywords: [
    'software engineer cv template',
    'developer resume template',
    'ats friendly engineering cv',
    'software engineer resume',
  ],
};

/**
 * Software Engineer — the clean engineering standard.
 *
 * Deliberately unadorned: the only colour is the header rule and the bullet markers. Every
 * structural decision here is made in favour of the parser, which is what earns the 5/5.
 */
export default function SoftwareEngineer({ cv, customization: c }: CVTemplateProps) {
  const accent = c.accentColor;
  const sections = visibleSections(cv);
  const name = fullName(cv);
  const hairline = tint(c.textColor, 0.7);

  return (
    <div style={{ padding: c.pageMargin, minHeight: 'inherit' }}>
      <header
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'flex-end',
          gap: '1.6em',
          paddingBottom: '0.75em',
          borderBottom: `2px solid ${accent}`,
        }}
      >
        <div style={{ minWidth: 0 }}>
          <h1
            style={{
              fontSize: '2.1em',
              lineHeight: 1.08,
              fontWeight: 700,
              color: c.secondaryColor,
              letterSpacing: '-0.015em',
            }}
          >
            {name || 'Your Name'}
          </h1>
          {cv.personal.title ? (
            <p style={{ marginTop: '0.15em', fontSize: '1.05em', fontWeight: 600, color: accent }}>
              {cv.personal.title}
            </p>
          ) : null}
        </div>

        {/* Contact sits opposite the name and wraps onto a second line rather than
            pushing the header taller than it needs to be. */}
        <div
          style={{
            display: 'flex',
            justifyContent: 'flex-end',
            textAlign: 'right',
            maxWidth: '52%',
            flexShrink: 0,
          }}
        >
          <ContactList
            cv={cv}
            accent={accent}
            color={c.textColor}
            icons={c.showIcons}
            layout="inline"
            gap="0.2em 1.1em"
            separator="  ·  "
            fontSize="0.9em"
          />
        </div>
      </header>

      <main style={{ marginTop: `${c.sectionSpacing}px` }}>
        {sections.map((section, index) => (
          <section
            key={section.id}
            className="cv-section"
            style={{ marginTop: index === 0 ? 0 : `${c.sectionSpacing}px` }}
          >
            <h2
              className="cv-section-title"
              style={{
                fontSize: '0.94em',
                fontWeight: 700,
                color: c.secondaryColor,
                textTransform: headingTransform(c),
                letterSpacing: headingTracking(c),
                paddingBottom: '0.25em',
                marginBottom: '0.55em',
                borderBottom: `1px solid ${hairline}`,
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
                education: 'stack',
                projects: 'stack',
                certifications: 'compact',
                languages: 'inline',
                interests: 'inline',
                references: 'stack',
              }}
              // Written out as text so the stack is indexed as words, not drawn as a chart.
              skillDisplay="text"
            />
          </section>
        ))}
      </main>
    </div>
  );
}
