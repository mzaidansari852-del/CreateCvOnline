import { ContactList, SectionContent } from '@/components/cv/parts';
import { fullName, headingTracking, headingTransform, headingWeight, tint } from '@/lib/cv/format';
import { visibleSections } from '@/lib/cv/sections';
import type { CVTemplateProps, TemplateMeta } from '@/types/cv';

export const meta: TemplateMeta = {
  id: 'ats-02',
  slug: 'ats-resume',
  name: 'ATS Resume',
  category: 'ats',
  premium: false,
  atsScore: 5,
  columns: 1,
  hasPhoto: false,
  accentDefault: '#000000',
  fonts: { heading: 'inter', body: 'inter' },
  metrics: { lineHeight: 1.54, pageMargin: 62 },
  tagline: 'Centred header, ruled headings and a tight rhythm built to land on one page.',
  description:
    'ATS Resume follows the North American convention a recruiter expects to see: name and contact details centred at the top, then left-aligned headings each underlined by a full-width rule. The vertical rhythm and the education and certification entries are deliberately more compact than our other ATS layouts, so ten years of history still fits on one page without dropping the type size. The body remains a single text column, which is what keeps the section order you chose intact when the file is parsed.',
  bestFor: [
    'US and Canadian job applications',
    'Candidates who must fit a single page',
    'High-volume applications through career sites',
  ],
  features: [
    'Centred name and contact header',
    'Full-width rule beneath every section heading',
    'Compact education and certification entries',
    'Tightened section rhythm for one-page documents',
  ],
  keywords: [
    'ats resume template',
    'one page resume template',
    'us resume format',
    'simple resume template',
  ],
};

/**
 * ATS Resume — US resume conventions in a parser-safe shell.
 *
 * Differs from ATS CV in three ways only, all of them structural rather than decorative:
 * the header is centred, every heading carries a full-width rule, and the section rhythm
 * plus the entry gap are scaled down so the document trends towards one page.
 */
export default function AtsResume({ cv, customization: c }: CVTemplateProps) {
  const ink = c.textColor;
  const metaInk = tint(ink, 0.24);
  const sections = visibleSections(cv);
  const spacing = c.sectionSpacing * 0.85;
  const name = fullName(cv);

  return (
    <div style={{ padding: c.pageMargin }}>
      <header style={{ textAlign: 'center' }}>
        <h1
          style={{
            fontSize: '1.95em',
            lineHeight: 1.12,
            fontWeight: headingWeight(c, 700),
            color: ink,
          }}
        >
          {name || 'Your Name'}
        </h1>
        {cv.personal.title ? (
          <p style={{ fontSize: '1.02em', marginTop: '0.1em', color: ink }}>{cv.personal.title}</p>
        ) : null}
        <div style={{ marginTop: '0.35em' }}>
          <ContactList
            cv={cv}
            accent={ink}
            color={ink}
            icons={false}
            layout="inline"
            separator="  •  "
            fontSize="0.93em"
          />
        </div>
      </header>

      {sections.map((section) => (
        <section key={section.id} className="cv-section" style={{ marginTop: `${spacing}px` }}>
          <h2
            className="cv-section-title"
            style={{
              fontSize: '0.96em',
              fontWeight: headingWeight(c, 700),
              color: ink,
              textTransform: headingTransform(c),
              letterSpacing: headingTracking(c),
              borderBottom: `1px solid ${ink}`,
              paddingBottom: '0.16em',
              marginBottom: '0.38em',
            }}
          >
            {section.label}
          </h2>
          <SectionContent
            sectionId={section.id}
            showTags={false}
            marker="-"
            cv={cv}
            c={c}
            accent={ink}
            color={ink}
            muted={section.id === 'summary' ? ink : metaInk}
            gap={0.72}
            variants={{
              experience: 'stack',
              education: 'compact',
              projects: 'compact',
              certifications: 'compact',
              awards: 'compact',
              volunteer: 'compact',
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
