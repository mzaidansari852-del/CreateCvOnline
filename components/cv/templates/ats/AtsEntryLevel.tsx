import { ContactList, SectionContent } from '@/components/cv/parts';
import {
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
  id: 'ats-06',
  slug: 'entry-level-resume',
  name: 'Entry-Level Resume',
  category: 'ats',
  premium: false,
  atsScore: 5,
  columns: 1,
  hasPhoto: false,
  accentDefault: '#334155',
  fonts: { heading: 'roboto', body: 'roboto' },
  metrics: { lineHeight: 1.54, pageMargin: 56 },
  tagline: 'Compact one-page rhythm that treats projects and volunteering as real experience.',
  description:
    'Entry-Level Resume tightens the section rhythm to three quarters of the usual spacing and reduces the header to two lines under one heavy rule, which buys back the space a first CV normally wastes on decoration. Projects and volunteer sections are styled identically to work experience, because for most entry-level candidates that is the experience. Headings are small, widely tracked capitals with no rules at all, so the page stays quiet and a parser sees nothing but text.',
  bestFor: [
    'School leavers and first-time applicants',
    'Career changers leading with projects',
    'Apprenticeship and trainee scheme applications',
  ],
  features: [
    'Section rhythm compressed to 0.75× for one page',
    'Two-line header under a single 2px rule',
    'Projects and volunteering weighted like work experience',
    'Wide-tracked capital headings with no rule-work',
  ],
  keywords: [
    'entry level resume template',
    'first job cv template',
    'no experience cv template',
    'school leaver cv',
  ],
};

/**
 * Entry-Level Resume — the compact end of the ATS category.
 *
 * Everything here is in service of one page: 0.75× section spacing, a two-line header, a
 * tighter entry gap, and no rules below the header. Projects and volunteer work share the
 * experience variant and gap so none of the three reads as a lesser section.
 */
export default function AtsEntryLevel({ cv, customization: c }: CVTemplateProps) {
  const ink = c.textColor;
  const metaInk = tint(ink, 0.26);
  const accent = c.accentColor;
  const sections = visibleSections(cv);
  const spacing = c.sectionSpacing * 0.75;
  const tracking = c.headingCase === 'uppercase' ? '0.18em' : headingTracking(c);

  return (
    <div style={{ padding: c.pageMargin }}>
      <header style={{ paddingBottom: '0.45em', borderBottom: `2px solid ${accent}` }}>
        <div
          style={{
            display: 'flex',
            flexWrap: 'wrap',
            alignItems: 'baseline',
            justifyContent: 'space-between',
            gap: '0.2em 1em',
          }}
        >
          <h1
            style={{
              fontSize: '1.9em',
              lineHeight: 1.1,
              fontWeight: headingWeight(c, 700),
              color: ink,
            }}
          >
            {displayName(cv)}
          </h1>
          {cv.personal.title ? (
            <p style={{ fontSize: '1em', color: metaInk, fontWeight: bodyWeight(c, 600) }}>{cv.personal.title}</p>
          ) : null}
        </div>
        <div style={{ marginTop: '0.3em' }}>
          <ContactList
            cv={cv}
            accent={accent}
            color={metaInk}
            icons={false}
            layout="inline"
            separator="  •  "
            fontSize="0.92em"
          />
        </div>
      </header>

      {sections.map((section) => (
        <section key={section.id} className="cv-section" style={{ marginTop: `${spacing}px` }}>
          <h2
            className="cv-section-title"
            style={{
              fontSize: '0.82em',
              fontWeight: headingWeight(c, 700),
              color: c.secondaryColor,
              textTransform: headingTransform(c),
              letterSpacing: tracking,
              marginBottom: '0.35em',
            }}
          >
            {section.label}
          </h2>
          <SectionContent
            sectionId={section.id}
            showTags={false}
            cv={cv}
            c={c}
            accent={accent}
            color={ink}
            muted={section.id === 'summary' ? ink : metaInk}
            gap={0.7}
            variants={{
              experience: 'stack',
              projects: 'stack',
              volunteer: 'stack',
              education: 'stack',
              certifications: 'compact',
              awards: 'compact',
              publications: 'compact',
              languages: 'inline',
              interests: 'inline',
              references: 'stack',
            }}
            skillDisplay="text"
            skillColumns={1}
          />
        </section>
      ))}
    </div>
  );
}
