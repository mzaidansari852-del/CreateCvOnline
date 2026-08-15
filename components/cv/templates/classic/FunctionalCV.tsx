import { contactEntries, SectionContent } from '@/components/cv/parts';
import {
  accentOn,
  centredTracking,
  fullName,
  headingTracking,
  headingTransform,
  headingWeight,
  mutedOn,
} from '@/lib/cv/format';
import { visibleSections } from '@/lib/cv/sections';
import type { CVTemplateProps, TemplateMeta } from '@/types/cv';

export const meta: TemplateMeta = {
  id: 'classic-11',
  slug: 'functional-cv',
  name: 'Functional CV',
  category: 'classic',
  premium: false,
  atsScore: 5,
  columns: 1,
  hasPhoto: false,
  accentDefault: '#334155',
  fonts: { heading: 'source-serif', body: 'georgia' },
  metrics: { lineHeight: 1.56, pageMargin: 62 },
  tagline: 'A skills-first CV that leads with what you can do, not when you did it.',
  description:
    'Functional CV inverts the usual order: your areas of expertise come first, each with the achievements that prove it, and the employment history follows as a short dated list. This is the format to reach for when the timeline is the weakest part of the application — a career change, a return to work after a break, a run of contracts, or a first job where the relevant evidence came from study and volunteering rather than employment. The layout is deliberately conventional so that leading with competencies is the only unusual thing about the document, and a parser reads it as an ordinary single-column CV.',
  bestFor: [
    'Career changers whose relevant evidence sits outside their job titles',
    'Anyone returning to work after a break in employment',
    'Contractors and freelancers with many short engagements',
  ],
  features: [
    'Core competencies lead the page, with evidence under each',
    'Employment history as a compact dated list, no repeated bullets',
    'Single column throughout — parses as an ordinary CV',
    'Centred masthead with a full-width rule',
  ],
  keywords: [
    'functional cv template',
    'skills based cv template',
    'functional resume template',
    'career change cv template',
  ],
};

/**
 * Functional CV — the competency-led format.
 *
 * The whole design exists to make one reordering work. `competencies` is rendered in the
 * `stack` variant, which gives each area of expertise a heading and its own bullets, and
 * `experience` is rendered as `history`, which is role, employer and dates with the bullets
 * deliberately dropped. Repeating the achievements under the employers would hand the
 * timeline back the argument the competencies just took from it.
 *
 * Everything else is intentionally ordinary. A functional CV is already asking a recruiter
 * to read in an unfamiliar order; doing that inside an unfamiliar layout is how the format
 * gets a reputation for hiding something.
 */
export default function FunctionalCV({ cv, customization: c }: CVTemplateProps) {
  const accent = c.accentColor;
  const accentText = accentOn(accent);
  const muted = mutedOn(c.textColor, 0.34);
  const sections = visibleSections(cv);
  const name = fullName(cv);
  const contacts = contactEntries(cv).map((entry) => entry.label);

  return (
    <div style={{ padding: `${c.pageMargin}px` }}>
      <header style={{ textAlign: 'center' }}>
        <h1
          style={{
            fontSize: '2.37em',
            lineHeight: 1.12,
            fontWeight: headingWeight(c, 600),
            color: c.secondaryColor,
          }}
        >
          {name || 'Your Name'}
        </h1>
        {cv.personal.title ? (
          <p
            style={{
              marginTop: '0.15em',
              fontSize: '1.02em',
              fontWeight: headingWeight(c, 400),
              color: accentText,
              textTransform: 'uppercase',
              ...centredTracking('0.14em'),
            }}
          >
            {cv.personal.title}
          </p>
        ) : null}
        {contacts.length > 0 ? (
          <p style={{ marginTop: '0.55em', fontSize: '0.88em', color: muted }}>
            {contacts.join('  ·  ')}
          </p>
        ) : null}
        <div
          aria-hidden
          style={{ marginTop: '0.9em', height: 1.5, background: accent, opacity: 0.85 }}
        />
      </header>

      <div style={{ marginTop: `${c.sectionSpacing}px` }}>
        {sections.map((section, index) => (
          <section
            key={section.id}
            className="cv-section"
            style={{ marginTop: index === 0 ? 0 : `${c.sectionSpacing}px` }}
          >
            <h2
              className="cv-section-title"
              style={{
                fontSize: '0.95em',
                fontWeight: headingWeight(c, 700),
                textTransform: headingTransform(c),
                letterSpacing: headingTracking(c),
                color: c.secondaryColor,
                borderBottom: `1px solid ${accent}`,
                paddingBottom: '0.22em',
                marginBottom: '0.6em',
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
              variants={{
                competencies: 'stack',
                // The format, in one line: the history states the facts and stops.
                experience: 'history',
                education: 'stack',
                projects: 'compact',
                certifications: 'compact',
                awards: 'compact',
                volunteer: 'compact',
                publications: 'compact',
                languages: 'inline',
                interests: 'inline',
                references: 'grid',
              }}
              skillDisplay="text"
            />
          </section>
        ))}
      </div>
    </div>
  );
}
