import { contactEntries, ContactList, SectionContent } from '@/components/cv/parts';
import { mutedOn, fullName, headingTracking, headingTransform, tint } from '@/lib/cv/format';
import { splitSections, visibleSections } from '@/lib/cv/sections';
import type { CVCustomization, CVTemplateProps, TemplateMeta } from '@/types/cv';

export const meta: TemplateMeta = {
  id: 'classic-08',
  slug: 'formal-cv',
  name: 'Formal CV',
  category: 'classic',
  premium: true,
  atsScore: 4,
  columns: 2,
  hasPhoto: false,
  accentDefault: '#1e293b',
  tagline: 'Two columns divided by a single rule — no fills, no tints, no shaded sidebar.',
  description:
    'Formal CV splits the page with one hairline instead of a colour block: a narrow left column carries contact details, skills, languages and certifications, while the wide column keeps your experience and education in a single uninterrupted reading order. Because nothing is filled or tinted, the document photocopies and faxes as cleanly as it prints, and a parser sees two ordinary blocks of text rather than a graphic. Headings are identical on both sides of the rule, which is what stops a two-column CV from looking improvised.',
  bestFor: [
    'Law, accountancy and financial services',
    'Applications to long-established institutions',
    'Candidates with long skills or certification lists',
  ],
  features: [
    '30% left column divided by a full-height rule',
    'Underlined headings shared by both columns',
    'Full-width name rule above both columns',
    'Reproduces exactly in black and white',
  ],
  keywords: [
    'formal cv template',
    'two column cv template',
    'traditional cv template',
    'professional resume template',
  ],
};

const ASIDE_SECTIONS = ['skills', 'languages', 'certifications'] as const;
const ASIDE_PERCENT = 30;

/**
 * Formal CV — the formal two-column archetype.
 *
 * The column split is drawn by a single 1px rule on the left column, which stretches to the
 * full page height because the grid is the flex child that fills the page and continues
 * onto later pages as the box fragments. No fill is used anywhere, so the reference
 * material in the narrow column reads as an annex to the main text rather than a panel.
 */
export default function Formal({ cv, customization: c }: CVTemplateProps) {
  const accent = c.accentColor;
  const rule = tint(c.textColor, 0.7);
  const muted = mutedOn(c.textColor, 0.34);
  const sections = visibleSections(cv);
  const { main, aside } = splitSections(sections, ASIDE_SECTIONS);
  const hasContact = contactEntries(cv).length > 0;
  const name = fullName(cv);

  return (
    <div
      style={{
        padding: c.pageMargin,
        display: 'flex',
        flexDirection: 'column',
        minHeight: 'inherit',
      }}
    >
      <header style={{ borderBottom: `1.5px solid ${accent}`, paddingBottom: '0.5em' }}>
        <h1
          style={{
            fontSize: '1.9em',
            lineHeight: 1.14,
            fontWeight: 700,
            letterSpacing: '0.02em',
            color: c.secondaryColor,
          }}
        >
          {name || 'Your Name'}
        </h1>
        {cv.personal.title ? (
          <p style={{ marginTop: '0.15em', fontSize: '1.02em', fontWeight: 600, color: muted }}>
            {cv.personal.title}
          </p>
        ) : null}
      </header>

      <div
        style={{
          display: 'grid',
          gridTemplateColumns: `${ASIDE_PERCENT}% minmax(0, 1fr)`,
          flex: 1,
          marginTop: `${c.sectionSpacing}px`,
        }}
      >
        <aside style={{ borderRight: `1px solid ${rule}`, paddingRight: '1.2em' }}>
          {hasContact ? (
            <div>
              <FormalHeading label="Contact" c={c} color={c.secondaryColor} />
              <ContactList
                cv={cv}
                accent={accent}
                color={c.textColor}
                icons={c.showIcons}
                iconColor={accent}
                layout="stack"
                fontSize="0.88em"
              />
            </div>
          ) : null}

          {aside.map((section, index) => (
            <section
              key={section.id}
              className="cv-section"
              style={{ marginTop: index === 0 && !hasContact ? 0 : `${c.sectionSpacing}px` }}
            >
              <FormalHeading label={section.label} c={c} color={c.secondaryColor} />
              <SectionContent
                sectionId={section.id}
                cv={cv}
                c={c}
                accent={accent}
                color={c.textColor}
                muted={muted}
                rule={rule}
                variants={{ languages: 'stack', certifications: 'compact' }}
                skillColumns={1}
              />
            </section>
          ))}
        </aside>

        <div style={{ paddingLeft: '1.4em' }}>
          {main.map((section, index) => (
            <section
              key={section.id}
              className="cv-section"
              style={{ marginTop: index === 0 ? 0 : `${c.sectionSpacing}px` }}
            >
              <FormalHeading label={section.label} c={c} color={c.secondaryColor} />
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
                  projects: 'stack',
                  awards: 'compact',
                  volunteer: 'stack',
                  publications: 'stack',
                  interests: 'inline',
                  references: 'stack',
                }}
              />
            </section>
          ))}
        </div>
      </div>
    </div>
  );
}

/** One heading treatment, used on both sides of the dividing rule. */
function FormalHeading({ label, c, color }: { label: string; c: CVCustomization; color: string }) {
  return (
    <h2
      className="cv-section-title"
      style={{
        fontSize: '0.9em',
        fontWeight: 700,
        color,
        textTransform: headingTransform(c),
        letterSpacing: headingTracking(c),
        textDecoration: 'underline',
        textDecorationThickness: '1px',
        textUnderlineOffset: '0.3em',
        marginBottom: '0.7em',
      }}
    >
      {label}
    </h2>
  );
}
