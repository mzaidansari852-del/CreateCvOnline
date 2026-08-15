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
  id: 'corporate-09',
  slug: 'sales-cv',
  name: 'Sales CV',
  category: 'corporate',
  premium: true,
  atsScore: 4,
  columns: 1,
  hasPhoto: false,
  accentDefault: '#b91c1c',
  fonts: { heading: 'inter', body: 'roboto' },
  metrics: { lineHeight: 1.48, pageMargin: 54 },
  tagline: 'Three headline wins in a strip under your name, before the job history starts.',
  description:
    'Sales CV leads with numbers: directly beneath the header, up to three achievements from your most recent role appear in a tinted strip as separate callouts, so quota attainment lands before the reader reaches the first job entry. When that role has no achievements recorded the strip is omitted completely, leaving an ordinary clean header rather than an empty band. Section headings are marked with a small accent triangle instead of a full rule, which keeps the page tight enough for a long list of territories, accounts and targets.',
  bestFor: [
    'Account executives and sales managers',
    'Business development and partnership leads',
    'Anyone whose case rests on quota and revenue figures',
  ],
  features: [
    'Achievement highlight strip under the header',
    'Strip hides itself when the latest role has no achievements',
    'Triangle-marked section headings',
    'Single column that survives portal parsing',
  ],
  keywords: [
    'sales cv template',
    'account executive resume template',
    'business development cv template',
    'sales manager cv',
  ],
};

const MAX_HIGHLIGHTS = 3;

/**
 * Sales CV — results forward.
 *
 * The highlight strip is built from the achievements of the first experience entry. Blank
 * strings are dropped before the count is taken, so a role with an empty achievement row
 * still produces no strip rather than an empty callout.
 */
export default function SalesCV({ cv, customization: c }: CVTemplateProps) {
  const accent = c.accentColor;
  const accentText = accentOn(accent);
  const sections = visibleSections(cv);
  const name = fullName(cv);

  const latestRole = cv.experience[0];
  const highlights = (latestRole?.achievements ?? [])
    .map((achievement) => achievement.trim())
    .filter(Boolean)
    .slice(0, MAX_HIGHLIGHTS);

  return (
    <div>
      <header
        style={{
          padding: `${c.pageMargin * 0.85}px ${c.pageMargin}px ${c.pageMargin * 0.55}px`,
        }}
      >
        <h1
          style={{
            fontSize: '2.6em',
            lineHeight: 1.06,
            fontWeight: headingWeight(c, 500),
            color: c.secondaryColor,
            letterSpacing: '-0.018em',
          }}
        >
          {name || 'Your Name'}
        </h1>
        {cv.personal.title ? (
          <p
            style={{
              marginTop: '0.2em',
              fontSize: '1.02em',
              fontWeight: bodyWeight(c, 700),
              color: accentText,
              textTransform: 'uppercase',
              letterSpacing: '0.1em',
            }}
          >
            {cv.personal.title}
          </p>
        ) : null}
        <div style={{ marginTop: '0.7em' }}>
          <ContactList
            cv={cv}
            accent={accent}
            color={c.textColor}
            icons={c.showIcons}
            layout="inline"
            gap="0.4em 1.15em"
            fontSize="0.9em"
          />
        </div>
      </header>

      {highlights.length > 0 ? (
        <div
          style={{
            background: tint(accent, 0.94),
            borderTop: `1px solid ${tint(accent, 0.7)}`,
            borderBottom: `1px solid ${tint(accent, 0.7)}`,
            padding: `${c.pageMargin * 0.42}px ${c.pageMargin}px`,
            display: 'grid',
            gridTemplateColumns: `repeat(${highlights.length}, minmax(0, 1fr))`,
            columnGap: '1.3em',
          }}
        >
          {highlights.map((highlight, index) => (
            <div
              key={`${index}-${highlight}`}
              className="cv-block"
              style={{
                borderLeft: index === 0 ? undefined : `1px solid ${tint(accent, 0.72)}`,
                paddingLeft: index === 0 ? 0 : '1.3em',
                minWidth: 0,
              }}
            >
              <div
                style={{
                  fontSize: '0.72em',
                  fontWeight: bodyWeight(c, 800),
                  color: accentText,
                  textTransform: 'uppercase',
                  letterSpacing: '0.13em',
                }}
              >
                {`Result 0${index + 1}`}
              </div>
              <p style={{ marginTop: '0.25em', fontSize: '0.94em', color: c.textColor }}>
                {highlight}
              </p>
            </div>
          ))}
        </div>
      ) : null}

      <div
        style={{
          padding: `${c.pageMargin * 0.72}px ${c.pageMargin}px ${c.pageMargin}px`,
        }}
      >
        {sections.map((section, index) => (
          <section
            key={section.id}
            className="cv-section"
            style={{ marginTop: index === 0 ? 0 : c.sectionSpacing }}
          >
            <h2
              className="cv-section-title"
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '0.55em',
                marginBottom: '0.55em',
                fontSize: '0.95em',
                fontWeight: headingWeight(c, 800),
                color: c.secondaryColor,
                textTransform: headingTransform(c),
                letterSpacing: headingTracking(c),
              }}
            >
              <span
                aria-hidden
                style={{
                  width: 0,
                  height: 0,
                  flexShrink: 0,
                  borderTop: '0.34em solid transparent',
                  borderBottom: '0.34em solid transparent',
                  borderLeft: `0.44em solid ${accent}`,
                }}
              />
              {section.label}
            </h2>
            <SectionContent
              sectionId={section.id}
              cv={cv}
              c={c}
              accent={accent}
              color={c.textColor}
              muted="#586172"
              variants={{
                experience: 'stack',
                education: 'compact',
                projects: 'stack',
                certifications: 'compact',
                awards: 'compact',
                languages: 'inline',
                interests: 'inline',
                references: 'grid',
              }}
              skillColumns={2}
            />
          </section>
        ))}
      </div>
    </div>
  );
}
