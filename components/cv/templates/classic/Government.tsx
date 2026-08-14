import { contactEntries, SectionContent, type ContactIconKey } from '@/components/cv/parts';
import { mutedOn, fullName, headingTracking, headingTransform, shade, tint } from '@/lib/cv/format';
import { visibleSections } from '@/lib/cv/sections';
import type { CVTemplateProps, TemplateMeta } from '@/types/cv';

export const meta: TemplateMeta = {
  id: 'classic-05',
  slug: 'government-cv',
  name: 'Government CV',
  category: 'classic',
  premium: true,
  atsScore: 5,
  columns: 1,
  hasPhoto: false,
  accentDefault: '#14532d',
  tagline: 'Every section in its own ruled box, with contact details set out as labelled fields.',
  description:
    'Government CV answers a public-sector panel in the format its own paperwork uses: each section sits inside a ruled box with a tinted heading bar, and your contact details are set out as labelled fields rather than a run-on line. Nothing is drawn that has to be interpreted — no icons, no rating bars, no tag pills — so the scoring panel and the parser read the same document. Skills print as plain category-and-list text, which is how competency frameworks expect to receive them.',
  bestFor: [
    'Civil service and local government roles',
    'NHS, education and public agency posts',
    'Competency-based application processes',
  ],
  features: [
    'A ruled box around every section',
    'Labelled contact field grid in the header',
    'Plain-text skills with no rating bars',
    'No icons, pills or colour blocks',
  ],
  keywords: [
    'government cv template',
    'civil service cv template',
    'public sector cv template',
    'competency based cv',
  ],
};

/** Field names for the header grid, keyed by the kind of contact detail. */
const FIELD_LABELS: Record<ContactIconKey, string> = {
  mail: 'Email',
  phone: 'Telephone',
  pin: 'Address',
  globe: 'Website',
  linkedin: 'LinkedIn',
  github: 'GitHub',
  link: 'Profile',
};

/**
 * Government CV — the form archetype.
 *
 * The page is built from ruled boxes rather than whitespace: a bordered identity block
 * whose contact details are laid out as label/value field rows, then one bordered panel per
 * section with the heading in a tinted bar across the top. Contact icons and skill bars are
 * deliberately overridden off — a public-sector panel scores what is written, and every
 * graphic element is one more thing an extractor has to guess at.
 */
export default function Government({ cv, customization: c }: CVTemplateProps) {
  const accent = c.accentColor;
  const frame = tint(accent, 0.55);
  const hair = tint(accent, 0.8);
  const bar = tint(accent, 0.9);
  const ink = shade(accent, 0.12);
  const muted = mutedOn(c.textColor, 0.3);
  const sections = visibleSections(cv);
  const fields = contactEntries(cv);
  const name = fullName(cv);

  return (
    <div style={{ padding: c.pageMargin }}>
      <header className="cv-block" style={{ border: `1px solid ${frame}` }}>
        <div style={{ padding: '0.8em 1em', borderBottom: `1px solid ${frame}` }}>
          <h1
            style={{
              fontSize: '1.85em',
              lineHeight: 1.14,
              fontWeight: 700,
              letterSpacing: '0.01em',
              color: c.secondaryColor,
            }}
          >
            {name || 'Your Name'}
          </h1>
          {cv.personal.title ? (
            <p style={{ marginTop: '0.2em', fontSize: '1.02em', fontWeight: 600, color: ink }}>
              {cv.personal.title}
            </p>
          ) : null}
        </div>

        {fields.map((field, index) => (
          <div
            key={field.key}
            style={{
              display: 'grid',
              gridTemplateColumns: '9em minmax(0, 1fr)',
              borderTop: index === 0 ? 'none' : `1px solid ${hair}`,
            }}
          >
            <div
              style={{
                padding: '0.32em 1em',
                borderRight: `1px solid ${hair}`,
                background: tint(accent, 0.96),
                fontSize: '0.84em',
                fontWeight: 700,
                textTransform: 'uppercase',
                letterSpacing: '0.07em',
                color: muted,
              }}
            >
              {FIELD_LABELS[field.icon]}
            </div>
            <div style={{ padding: '0.32em 1em', color: c.textColor }}>
              {field.href ? (
                <a href={field.href} style={{ color: 'inherit' }}>
                  {field.label}
                </a>
              ) : (
                field.label
              )}
            </div>
          </div>
        ))}
      </header>

      {sections.map((section) => (
        <section
          key={section.id}
          className="cv-section"
          style={{ marginTop: `${c.sectionSpacing}px`, border: `1px solid ${frame}` }}
        >
          <h2
            className="cv-section-title"
            style={{
              padding: '0.32em 0.9em',
              background: bar,
              borderBottom: `1px solid ${frame}`,
              fontSize: '0.92em',
              fontWeight: 700,
              color: ink,
              textTransform: headingTransform(c),
              letterSpacing: headingTracking(c),
            }}
          >
            {section.label}
          </h2>
          <div style={{ padding: '0.7em 0.9em' }}>
            <SectionContent
              sectionId={section.id}
              cv={cv}
              c={c}
              accent={accent}
              color={c.textColor}
              muted={muted}
              rule={hair}
              variants={{
                experience: 'compact',
                education: 'compact',
                projects: 'compact',
                certifications: 'compact',
                awards: 'compact',
                volunteer: 'compact',
                publications: 'compact',
                languages: 'grid',
                interests: 'inline',
                references: 'stack',
              }}
              skillDisplay="text"
              skillColumns={1}
            />
          </div>
        </section>
      ))}
    </div>
  );
}
