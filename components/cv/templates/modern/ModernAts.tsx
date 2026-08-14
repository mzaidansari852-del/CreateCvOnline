import { ContactList, SectionContent } from '@/components/cv/parts';
import { mutedOn, fullName, headingTracking, headingTransform, tint } from '@/lib/cv/format';
import { visibleSections } from '@/lib/cv/sections';
import type { CVTemplateProps, TemplateMeta } from '@/types/cv';

export const meta: TemplateMeta = {
  id: 'modern-07',
  slug: 'modern-ats',
  name: 'Modern ATS',
  category: 'modern',
  premium: false,
  atsScore: 5,
  columns: 1,
  hasPhoto: false,
  accentDefault: '#1f2937',
  tagline: 'The parser-proof member of the Modern family: one column, one rule, no graphics.',
  description:
    'Modern ATS strips the family down to what a parser can read without guessing: one column, a left-aligned name, a single wrapped line of contact text and full-width headings sitting on a plain 1px rule. Nothing is drawn that a text extractor would have to interpret — no icons, no bars, no tinted panels — and skills print as comma-separated text under their category names. Spacing is deliberately generous so the plainness reads as considered rather than unfinished.',
  bestFor: [
    'Large-employer and government application portals',
    'High-volume online applications',
    'Recruiters who re-format your CV before sending it on',
  ],
  features: [
    'Strict single column with no graphics',
    'Icon-free contact line',
    'Ruled full-width section headings',
    'Comma-separated plain-text skills',
  ],
  keywords: [
    'ats cv template',
    'ats friendly resume template',
    'plain cv template',
    'simple ats resume',
  ],
};

/**
 * Modern ATS — the deliberately plain sibling.
 *
 * Every choice here is made for the machine that reads the file first: a single flow of
 * block-level content, real `h1`/`h2` headings, contact details as plain text on one line,
 * and no element whose meaning depends on colour or position.
 */
export default function ModernAts({ cv, customization: c }: CVTemplateProps) {
  const accent = c.accentColor;
  const muted = mutedOn(c.textColor, 0.35);
  const rule = tint(c.textColor, 0.68);
  const sections = visibleSections(cv);
  const name = fullName(cv);

  return (
    <div style={{ padding: c.pageMargin }}>
      <header>
        <h1 style={{ fontSize: '1.95em', lineHeight: 1.12, fontWeight: 700, color: c.textColor }}>
          {name || 'Your Name'}
        </h1>
        {cv.personal.title ? (
          <p style={{ marginTop: '0.15em', fontSize: '1.05em', fontWeight: 600, color: muted }}>
            {cv.personal.title}
          </p>
        ) : null}
        <div style={{ marginTop: '0.55em' }}>
          <ContactList
            cv={cv}
            accent={accent}
            color={c.textColor}
            icons={false}
            layout="inline"
            separator="  |  "
            fontSize="0.95em"
          />
        </div>
      </header>

      {sections.map((section) => (
        <section
          key={section.id}
          className="cv-section"
          style={{ marginTop: `${c.sectionSpacing * 1.35}px` }}
        >
          <h2
            className="cv-section-title"
            style={{
              fontSize: '0.98em',
              fontWeight: 700,
              textTransform: headingTransform(c),
              letterSpacing: headingTracking(c),
              color: c.textColor,
              borderBottom: `1px solid ${rule}`,
              paddingBottom: '0.28em',
              marginBottom: '0.65em',
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
            rule={rule}
            variants={{
              experience: 'stack',
              education: 'stack',
              languages: 'inline',
              projects: 'compact',
              certifications: 'compact',
              awards: 'compact',
              volunteer: 'compact',
              publications: 'compact',
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
