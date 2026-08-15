import { ContactList, Photo, SectionContent } from '@/components/cv/parts';
import {
  accentOn,
  bodyWeight,
  displayName,
  headingTracking,
  headingTransform,
  headingWeight,
  mutedOn,
  tint,
} from '@/lib/cv/format';
import { visibleSections } from '@/lib/cv/sections';
import type { CVTemplateProps, TemplateMeta } from '@/types/cv';

export const meta: TemplateMeta = {
  id: 'tech-08',
  slug: 'product-manager-cv',
  name: 'Product Manager',
  category: 'technology',
  premium: true,
  atsScore: 4,
  columns: 1,
  hasPhoto: true,
  accentDefault: '#4f46e5',
  fonts: { heading: 'inter', body: 'lato' },
  metrics: { lineHeight: 1.54, pageMargin: 50 },
  tagline: 'Three headline outcomes in a bordered row before the reader reaches your history.',
  description:
    'Product Manager lifts up to three achievements from your most recent role into a bordered impact row directly beneath the header, so the outcomes you are hired to repeat are read first rather than found on the second page. Section headings are set large with a short accent underline instead of a full-width rule, which keeps the page calm while still breaking it into obvious blocks. Projects render as two-up cards, a better fit for a portfolio of launches than another bulleted list.',
  bestFor: [
    'Product managers and product owners',
    'Programme, delivery and launch leads',
    'Candidates whose case rests on measurable outcomes',
  ],
  features: [
    'Impact row built from your latest achievements',
    'Outsized headings with a short accent underline',
    'Two-up project cards',
    'Photo beside the name and contact block',
  ],
  keywords: [
    'product manager cv template',
    'product owner resume template',
    'technical product manager cv',
    'achievement based cv template',
  ],
};

/** Cells in the impact row. Fewer achievements simply means fewer, wider cells. */
const IMPACT_CELLS = 3;

/**
 * Product Manager — outcome-first single column.
 *
 * The impact row is the only place in the document that repeats content: it promotes the
 * achievements of the most recent role above the fold, where a hiring manager reads them
 * before the job history explains where they came from. It disappears entirely when that
 * role has no achievements listed, rather than leaving an empty frame on the page.
 */
export default function ProductManager({ cv, customization: c }: CVTemplateProps) {
  const accent = c.accentColor;
  const accentText = accentOn(accent);
  const muted = mutedOn(c.textColor, 0.4);
  const sections = visibleSections(cv);

  const leadRole = cv.experience.find((item) => item.role || item.company || item.description);
  const impact = (leadRole?.achievements ?? []).filter(Boolean).slice(0, IMPACT_CELLS);

  return (
    <div style={{ padding: `${c.pageMargin}px` }}>
      <header style={{ display: 'flex', alignItems: 'center', gap: '1.3em' }}>
        <Photo
          cv={cv}
          c={c}
          size={92}
          border={tint(accent, 0.72)}
          borderWidth={2}
          fallbackBackground={accent}
        />
        <div style={{ minWidth: 0, flex: 1 }}>
          <h1
            style={{
              fontSize: '2.6em',
              lineHeight: 1.08,
              fontWeight: headingWeight(c, 500),
              letterSpacing: '-0.02em',
              color: c.secondaryColor,
            }}
          >
            {displayName(cv)}
          </h1>
          {cv.personal.title ? (
            <p
              style={{ marginTop: '0.2em', fontSize: '1.08em', fontWeight: bodyWeight(c, 600), color: accentText }}
            >
              {cv.personal.title}
            </p>
          ) : null}
          <div style={{ marginTop: '0.55em' }}>
            <ContactList
              cv={cv}
              accent={accent}
              color={muted}
              icons={c.showIcons}
              layout="inline"
              gap="0.25em 1.1em"
              fontSize="0.9em"
            />
          </div>
        </div>
      </header>

      {impact.length > 0 ? (
        <div
          className="cv-block"
          style={{
            marginTop: `${c.sectionSpacing}px`,
            display: 'grid',
            gridTemplateColumns: `repeat(${impact.length}, minmax(0, 1fr))`,
            border: `1px solid ${tint(accent, 0.6)}`,
            borderRadius: 6,
          }}
        >
          {impact.map((achievement, index) => (
            <div
              key={achievement}
              style={{
                padding: '0.7em 0.85em',
                borderLeft: index === 0 ? undefined : `1px solid ${tint(accent, 0.75)}`,
              }}
            >
              <div
                style={{
                  fontSize: '0.72em',
                  fontWeight: bodyWeight(c, 700),
                  letterSpacing: '0.14em',
                  color: accentText,
                }}
              >
                {String(index + 1).padStart(2, '0')}
              </div>
              <div style={{ marginTop: '0.25em', fontSize: '0.94em', color: c.textColor }}>
                {achievement}
              </div>
            </div>
          ))}
        </div>
      ) : null}

      {sections.map((section, index) => (
        <section
          key={section.id}
          className="cv-section"
          style={{
            marginTop: index === 0 ? `${c.sectionSpacing * 1.35}px` : `${c.sectionSpacing * 1.2}px`,
          }}
        >
          <h2
            className="cv-section-title"
            style={{
              fontSize: '1.3em',
              fontWeight: headingWeight(c, 700),
              lineHeight: 1.25,
              textTransform: headingTransform(c),
              letterSpacing: headingTracking(c),
              color: c.secondaryColor,
              marginBottom: '0.6em',
            }}
          >
            {section.label}
            <span
              aria-hidden
              style={{
                display: 'block',
                width: '40%',
                height: 3,
                marginTop: '0.3em',
                borderRadius: 2,
                background: accent,
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
              experience: 'stack',
              projects: 'cards',
              education: 'compact',
              certifications: 'compact',
              awards: 'compact',
              volunteer: 'compact',
              publications: 'compact',
              languages: 'inline',
              interests: 'inline',
              references: 'grid',
            }}
            skillColumns={2}
          />
        </section>
      ))}
    </div>
  );
}
