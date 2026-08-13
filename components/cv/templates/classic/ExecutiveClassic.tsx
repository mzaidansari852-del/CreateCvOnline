import { ContactList, SectionContent } from '@/components/cv/parts';
import { fullName, headingTracking, headingTransform, tint } from '@/lib/cv/format';
import { visibleSections } from '@/lib/cv/sections';
import type { CVTemplateProps, TemplateMeta } from '@/types/cv';

export const meta: TemplateMeta = {
  id: 'classic-06',
  slug: 'executive-classic-cv',
  name: 'Executive Classic',
  category: 'classic',
  premium: true,
  atsScore: 4,
  columns: 1,
  hasPhoto: false,
  accentDefault: '#7f1d1d',
  tagline: 'A masthead name with the job title set opposite it, over an indented statement.',
  description:
    'Executive Classic opens with your name at close to three times body size and the job title ranged right on the same baseline, so the top of the page reads as a masthead rather than a form. Your summary is then pulled out as an indented statement in larger type — the paragraph a board-level reader will actually finish — and everything below it is kept deliberately quiet. Section headings are small caps over a hairline that stops at 60% of the measure, which marks the structure without ruling the page into boxes.',
  bestFor: [
    'Executives and board-level candidates',
    'Consultants leading with a positioning statement',
    'Senior hires going through a search firm',
  ],
  features: [
    'Masthead name with an opposing job title',
    'Summary set apart as an indented statement',
    'Small-caps headings on a 60% hairline',
    'Single column with no graphics or panels',
  ],
  keywords: [
    'executive cv template',
    'senior management cv template',
    'cv template with personal statement',
    'classic executive resume',
  ],
};

/**
 * Executive Classic — the statement archetype.
 *
 * Hierarchy comes from one very large element and one very quiet one: a ~3em name opposite
 * the job title on a shared baseline, then the summary lifted out of the flow into an
 * indented block of larger type. Because the statement carries the page, the remaining
 * sections are marked only by a small-caps heading over a rule that stops short of the
 * measure — nothing competes with the two things a search partner reads first.
 */
export default function ExecutiveClassic({ cv, customization: c }: CVTemplateProps) {
  const accent = c.accentColor;
  const rule = tint(c.textColor, 0.62);
  const hairline = tint(c.textColor, 0.72);
  const muted = tint(c.textColor, 0.34);
  const sections = visibleSections(cv);
  const name = fullName(cv);

  return (
    <div style={{ padding: `${c.pageMargin}px ${Math.round(c.pageMargin * 1.1)}px` }}>
      <header>
        <div
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'baseline',
            flexWrap: 'wrap',
            gap: '0.4em 1.6em',
          }}
        >
          <h1
            style={{
              fontSize: '3em',
              lineHeight: 1.04,
              fontWeight: 700,
              letterSpacing: '-0.02em',
              color: c.secondaryColor,
              minWidth: 0,
            }}
          >
            {name || 'Your Name'}
          </h1>
          {cv.personal.title ? (
            <p
              style={{
                textAlign: 'right',
                fontSize: '0.98em',
                fontWeight: 600,
                letterSpacing: '0.14em',
                textTransform: 'uppercase',
                color: accent,
                minWidth: 0,
              }}
            >
              {cv.personal.title}
            </p>
          ) : null}
        </div>

        <div aria-hidden style={{ height: 1, background: rule, marginTop: '0.5em' }} />

        <div style={{ marginTop: '0.55em' }}>
          <ContactList
            cv={cv}
            accent={accent}
            color={muted}
            icons={c.showIcons}
            layout="inline"
            separator="   ·   "
            gap="0.3em 1.15em"
            fontSize="0.92em"
          />
        </div>
      </header>

      {sections.map((section, index) => {
        const spacing = index === 0 ? Math.round(c.sectionSpacing * 1.2) : c.sectionSpacing;

        if (section.id === 'summary') {
          return (
            <section
              key={section.id}
              className="cv-section"
              style={{
                marginTop: `${Math.round(spacing * 1.35)}px`,
                marginBottom: `${Math.round(c.sectionSpacing * 0.5)}px`,
              }}
            >
              <h2
                className="cv-section-title"
                style={{
                  textAlign: 'center',
                  fontSize: '0.76em',
                  fontWeight: 600,
                  letterSpacing: '0.3em',
                  textTransform: headingTransform(c),
                  color: muted,
                }}
              >
                {section.label}
              </h2>
              <div
                style={{
                  margin: '0.75em 9% 0',
                  fontSize: '1.18em',
                  lineHeight: 1.55,
                }}
              >
                <SectionContent
                  sectionId={section.id}
                  cv={cv}
                  c={c}
                  accent={accent}
                  color={c.textColor}
                  muted={c.textColor}
                />
              </div>
            </section>
          );
        }

        return (
          <section key={section.id} className="cv-section" style={{ marginTop: `${spacing}px` }}>
            <h2
              className="cv-section-title"
              style={{
                fontSize: '1em',
                fontWeight: 700,
                fontVariant: 'small-caps',
                textTransform: headingTransform(c),
                letterSpacing: headingTracking(c),
                color: c.secondaryColor,
                marginBottom: '0.6em',
              }}
            >
              <span style={{ display: 'block' }}>{section.label}</span>
              <span
                aria-hidden
                style={{ display: 'block', width: '60%', height: 1, background: hairline, marginTop: '0.3em' }}
              />
            </h2>
            <SectionContent
              sectionId={section.id}
              cv={cv}
              c={c}
              accent={accent}
              color={c.textColor}
              muted={muted}
              rule={hairline}
              gap={1.15}
              variants={{
                experience: 'stack',
                education: 'stack',
                projects: 'stack',
                certifications: 'stack',
                awards: 'compact',
                volunteer: 'stack',
                publications: 'stack',
                languages: 'inline',
                interests: 'inline',
                references: 'grid',
              }}
              skillColumns={2}
            />
          </section>
        );
      })}
    </div>
  );
}
