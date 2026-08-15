import { ContactList, SectionContent } from '@/components/cv/parts';
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
  id: 'ats-04',
  slug: 'student-cv',
  name: 'Student CV',
  category: 'ats',
  premium: false,
  atsScore: 5,
  columns: 1,
  hasPhoto: false,
  accentDefault: '#1d4ed8',
  fonts: { heading: 'lato', body: 'lato' },
  metrics: { lineHeight: 1.54, pageMargin: 58 },
  tagline: 'Education sits on a soft tinted panel in larger type, wherever you place it.',
  description:
    'Student CV is built for a first application, where a degree and a couple of modules carry more weight than two summer jobs. The education section is set on a very light tinted panel in slightly larger type so it anchors the page, and the summary is italicised to read as a short objective statement — the section order itself stays entirely under your control. Spacing is generous, which stops a genuinely short CV from looking like an unfinished one.',
  bestFor: [
    'University students and recent graduates',
    'Internship and placement applications',
    'First jobs with little paid experience',
  ],
  features: [
    'Tinted emphasis panel behind the education section',
    'Italic objective-style summary',
    'Generous spacing tuned for a one-page student CV',
    'Single column, no icons, photo or graphics',
  ],
  keywords: [
    'student cv template',
    'graduate cv template',
    'first cv template',
    'internship cv template',
  ],
};

/**
 * Student CV — education-forward without reordering anything.
 *
 * Section order is a user setting, so emphasis is applied where the education section
 * happens to sit rather than by hoisting it: a very light accent tint, a little padding and
 * a one-notch type bump make it the first block the eye lands on.
 */
export default function AtsStudent({ cv, customization: c }: CVTemplateProps) {
  const ink = c.textColor;
  const metaInk = tint(ink, 0.22);
  const accent = c.accentColor;
  const accentText = accentOn(accent);
  const sections = visibleSections(cv);
  const spacing = c.sectionSpacing * 1.2;
  const name = fullName(cv);

  return (
    <div style={{ padding: c.pageMargin }}>
      <header>
        <h1
          style={{
            fontSize: '2.15em',
            lineHeight: 1.12,
            fontWeight: headingWeight(c, 600),
            color: ink,
          }}
        >
          {name || 'Your Name'}
        </h1>
        {cv.personal.title ? (
          <p
            style={{
              fontSize: '1.08em',
              marginTop: '0.14em',
              color: accentText,
              fontWeight: bodyWeight(c, 600),
            }}
          >
            {cv.personal.title}
          </p>
        ) : null}
        <div style={{ marginTop: '0.5em' }}>
          <ContactList
            cv={cv}
            accent={accent}
            color={metaInk}
            icons={false}
            layout="inline"
            separator="  •  "
            fontSize="0.95em"
          />
        </div>
      </header>

      {sections.map((section) => {
        const emphasised = section.id === 'education';
        const isSummary = section.id === 'summary';

        return (
          <section
            key={section.id}
            className="cv-section"
            style={{
              marginTop: `${spacing}px`,
              ...(emphasised
                ? {
                    background: tint(accent, 0.94),
                    padding: '0.85em 1em 0.95em',
                    fontSize: '1.05em',
                  }
                : {}),
            }}
          >
            <h2
              className="cv-section-title"
              style={{
                fontSize: emphasised ? '1.06em' : '1.02em',
                fontWeight: headingWeight(c, 700),
                color: accentText,
                textTransform: headingTransform(c),
                letterSpacing: headingTracking(c),
                marginBottom: '0.5em',
              }}
            >
              {section.label}
            </h2>
            <div style={isSummary ? { fontStyle: 'italic' } : undefined}>
              <SectionContent
                sectionId={section.id}
                showTags={false}
                cv={cv}
                c={c}
                accent={accent}
                color={ink}
                muted={isSummary ? ink : metaInk}
                gap={1.05}
                variants={{
                  education: 'stack',
                  experience: 'stack',
                  projects: 'compact',
                  certifications: 'stack',
                  awards: 'stack',
                  volunteer: 'stack',
                  publications: 'stack',
                  languages: 'stack',
                  interests: 'inline',
                  references: 'stack',
                }}
                skillDisplay="text"
                skillColumns={1}
              />
            </div>
          </section>
        );
      })}
    </div>
  );
}
