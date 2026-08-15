import { SectionContent, contactEntries } from '@/components/cv/parts';
import {
  accentOn,
  bodyWeight,
  fullName,
  headingTracking,
  headingTransform,
  headingWeight,
  mutedOn,
  tint,
} from '@/lib/cv/format';
import { visibleSections } from '@/lib/cv/sections';
import type { CVTemplateProps, TemplateMeta } from '@/types/cv';

export const meta: TemplateMeta = {
  id: 'creative-11',
  slug: 'creative-ats-cv',
  name: 'Creative ATS',
  category: 'creative',
  premium: false,
  atsScore: 5,
  columns: 1,
  hasPhoto: false,
  accentDefault: '#7c3aed',
  fonts: { heading: 'poppins', body: 'source-serif' },
  metrics: { lineHeight: 1.5, pageMargin: 48 },
  tagline: 'A creative CV that a parser reads as plain text — no columns, no graphics.',
  description:
    'Every other design in this category is built for a human reader and pays for it at the parsing stage. Creative ATS gets its character entirely from things an applicant tracking system does not see: an oversized geometric masthead, a serif body against a geometric sans, generous space, and a single accent rule that steps in under each heading. Underneath it is one column of ordinary text with no sidebars, no icons, no bars and no boxes, which is what earns the five-out-of-five. Use it when the work is going through a portal and the portfolio link has to survive the trip.',
  bestFor: [
    'Designers and writers applying through Greenhouse, Workday or Lever',
    'Creative roles at large companies with automated screening',
    'Anyone who wants personality without gambling on the parser',
  ],
  features: [
    'Character from type and space, not from graphics',
    'Single column with no sidebars, icons or bars',
    'Stepped accent rule under each section heading',
    'Portfolio and profile links kept as plain selectable text',
  ],
  keywords: [
    'ats friendly creative cv template',
    'creative resume template ats',
    'designer cv template ats',
    'creative cv that passes ats',
  ],
};

/**
 * Creative ATS — personality from type, not from graphics.
 *
 * The category had a hole in it: eight of the ten creative templates score 2 or 3, so a
 * designer applying through a portal had to leave the category to be readable. That is a
 * false choice, because almost nothing that makes a creative CV *look* creative is the
 * thing that breaks parsing. Multi-column text flow, text inside graphics, icon glyphs
 * standing in for labels and bar charts are what break parsing. Scale, contrast between
 * two typefaces, and whitespace do not.
 *
 * So this one spends everything on the second list and nothing on the first: a 3.05em
 * geometric masthead over a serif body, wide margins, and one accent rule per heading. The
 * structure below the header is the same single flow of text as the ATS templates.
 */
export default function CreativeAts({ cv, customization: c }: CVTemplateProps) {
  const accent = c.accentColor;
  const accentText = accentOn(accent);
  const muted = mutedOn(c.textColor, 0.36);
  const sections = visibleSections(cv);
  const name = fullName(cv);
  const contacts = contactEntries(cv).map((entry) => entry.label);

  return (
    <div style={{ padding: `${c.pageMargin}px` }}>
      <header>
        <h1
          style={{
            fontSize: '3.05em',
            lineHeight: 0.98,
            fontWeight: headingWeight(c, 400),
            letterSpacing: '-0.03em',
            color: c.secondaryColor,
          }}
        >
          {name || 'Your Name'}
        </h1>
        {cv.personal.title ? (
          <p
            style={{
              marginTop: '0.4em',
              fontSize: '0.92em',
              fontWeight: bodyWeight(c, 700),
              textTransform: 'uppercase',
              letterSpacing: '0.22em',
              color: accentText,
            }}
          >
            {cv.personal.title}
          </p>
        ) : null}
        {contacts.length > 0 ? (
          /*
           * Plain text, no icons. An icon glyph in place of the word "email" is invisible
           * to a parser and, in several of them, extracts as a replacement character in the
           * middle of the address it was labelling.
           */
          <p style={{ marginTop: '0.85em', fontSize: '0.88em', color: muted, lineHeight: 1.7 }}>
            {contacts.join('   /   ')}
          </p>
        ) : null}
      </header>

      <div style={{ marginTop: `${c.sectionSpacing * 1.3}px` }}>
        {sections.map((section, index) => (
          <section
            key={section.id}
            className="cv-section"
            style={{ marginTop: index === 0 ? 0 : `${c.sectionSpacing * 1.15}px` }}
          >
            <h2
              className="cv-section-title"
              style={{
                fontSize: '0.9em',
                fontWeight: headingWeight(c, 700),
                textTransform: headingTransform(c),
                letterSpacing: headingTracking(c),
                color: c.secondaryColor,
                marginBottom: '0.7em',
              }}
            >
              {section.label}
              <span
                aria-hidden
                style={{
                  display: 'block',
                  width: '2.6em',
                  height: 3,
                  marginTop: '0.4em',
                  background: accent,
                }}
              />
              <span
                aria-hidden
                style={{
                  display: 'block',
                  width: '6.2em',
                  height: 1,
                  marginTop: 2,
                  background: tint(accent, 0.55),
                }}
              />
            </h2>
            <SectionContent
              sectionId={section.id}
              cv={cv}
              c={c}
              accent={accent}
              color={c.textColor}
              muted={muted}
              variants={{
                competencies: 'stack',
                experience: 'stack',
                education: 'stack',
                projects: 'stack',
                certifications: 'compact',
                awards: 'compact',
                volunteer: 'compact',
                publications: 'compact',
                languages: 'inline',
                interests: 'inline',
                references: 'grid',
              }}
              // Text, not bars: a rated bar is a graphic, and the rating never survives
              // extraction — the parser gets the label and drops the level entirely.
              skillDisplay="text"
              skillColumns={2}
            />
          </section>
        ))}
      </div>
    </div>
  );
}
