import { ContactList, SectionContent } from '@/components/cv/parts';
import { fullName, headingTracking, headingTransform, tint } from '@/lib/cv/format';
import { visibleSections } from '@/lib/cv/sections';
import type { CVTemplateProps, TemplateMeta } from '@/types/cv';

export const meta: TemplateMeta = {
  id: 'classic-09',
  slug: 'simple-classic-cv',
  name: 'Simple Classic',
  category: 'classic',
  premium: false,
  atsScore: 5,
  columns: 1,
  hasPhoto: false,
  accentDefault: '#111827',
  tagline: 'Bold headings, plain text and nothing else — the safe answer when in doubt.',
  description:
    'Simple Classic is what to send when the employer has not told you what they want: one column of black text, bold headings with a blank line above them, and not a single rule, box or tinted panel on the page. Skills are listed as text under their category names, roles read as short paragraphs and each degree takes one line, so a two-page career fits without shrinking the type. There is nothing here for a parser to misread and nothing a photocopier can lose.',
  bestFor: [
    'Graduate and first-job applications',
    'High-volume online application portals',
    'Anyone unsure what the employer prefers',
  ],
  features: [
    'No rules, boxes or tinted panels',
    'Text-only skills grouped by category',
    'One-line education entries',
    'Plain paragraphs under each role',
  ],
  keywords: [
    'simple cv template',
    'basic cv template',
    'plain text resume template',
    'free cv template',
  ],
};

/**
 * Simple Classic — the baseline document.
 *
 * The layout draws nothing at all: rank is carried by weight and by the blank line above
 * each heading, and the only colour that can appear is the accent a reader's own links
 * inherit. Every structural choice below (text skills, minimal roles, one-line degrees) is
 * made so that copying the rendered page into a plain text box loses no information.
 */
export default function SimpleClassic({ cv, customization: c }: CVTemplateProps) {
  const accent = c.accentColor;
  const muted = tint(c.textColor, 0.22);
  const sections = visibleSections(cv);
  const name = fullName(cv);

  return (
    <div style={{ padding: c.pageMargin }}>
      <header>
        <h1 style={{ fontSize: '1.7em', lineHeight: 1.15, fontWeight: 700, color: c.textColor }}>
          {name || 'Your Name'}
        </h1>
        {cv.personal.title ? (
          <p style={{ marginTop: '0.1em', fontSize: '1.02em', fontWeight: 600, color: c.textColor }}>
            {cv.personal.title}
          </p>
        ) : null}
        <div style={{ marginTop: '0.4em' }}>
          <ContactList
            cv={cv}
            accent={accent}
            color={c.textColor}
            icons={c.showIcons}
            iconColor={c.textColor}
            layout="inline"
            separator="  •  "
            gap="0.25em 0.95em"
            fontSize="0.95em"
          />
        </div>
      </header>

      {sections.map((section) => (
        <section
          key={section.id}
          className="cv-section"
          style={{ marginTop: `${c.sectionSpacing}px` }}
        >
          <h2
            className="cv-section-title"
            style={{
              fontSize: '1em',
              fontWeight: 700,
              color: c.textColor,
              textTransform: headingTransform(c),
              letterSpacing: headingTracking(c),
              marginBottom: '0.35em',
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
            gap={0.8}
            variants={{
              experience: 'minimal',
              education: 'inline',
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
