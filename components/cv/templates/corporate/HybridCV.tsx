import { ContactList, SectionContent } from '@/components/cv/parts';
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
  id: 'corporate-11',
  slug: 'hybrid-cv',
  name: 'Hybrid CV',
  category: 'corporate',
  premium: true,
  atsScore: 5,
  columns: 1,
  hasPhoto: false,
  accentDefault: '#155e75',
  fonts: { heading: 'lato', body: 'source-serif' },
  metrics: { lineHeight: 1.5, pageMargin: 50 },
  tagline: 'Competencies stated up front, then the full chronological history behind them.',
  description:
    'Hybrid CV — the combination format — opens with a compact table of competencies, each set beside the evidence for it, and then gives the employment history in full with its own achievements underneath. It is the format for a candidate whose track record is strong and whose relevant skills are not obvious from their job titles: the reader is told what you do before they work out where you did it, and nothing is withheld from the timeline to achieve that. A left-hand label column runs down the competency block so the two halves of the document read as one argument rather than two lists.',
  bestFor: [
    'Senior candidates whose job titles undersell what they actually do',
    'Applicants moving between industries with a solid record in each',
    'Roles where a recruiter screens on capability and a hiring manager on history',
  ],
  features: [
    'Competency table with the claim beside its evidence',
    'Full chronological history retained below',
    'Tinted rule under every section heading',
    'Single column, five-out-of-five parser safety',
  ],
  keywords: [
    'hybrid cv template',
    'combination resume template',
    'skills and experience cv template',
    'hybrid resume format',
  ],
};

/**
 * Hybrid CV — the combination format.
 *
 * The difference from `functional-cv` is one variant and one omission: competencies render
 * `grouped`, which sets the capability in a label column beside its evidence rather than
 * above it, and `experience` keeps its default `stack` with the bullets intact.
 *
 * That is the whole distinction between the two formats, and it is worth being literal
 * about it: a functional CV asks the reader to accept a case *instead of* the timeline, a
 * hybrid asks them to read the case *first*. The second is a much easier thing to ask,
 * which is why this one keeps the history at full strength.
 */
export default function HybridCV({ cv, customization: c }: CVTemplateProps) {
  const accent = c.accentColor;
  const accentText = accentOn(accent);
  const muted = mutedOn(c.textColor, 0.36);
  const sections = visibleSections(cv);

  return (
    <div style={{ padding: `${c.pageMargin}px` }}>
      <header
        style={{
          borderBottom: `2.5px solid ${accent}`,
          paddingBottom: '0.7em',
          display: 'flex',
          flexWrap: 'wrap',
          alignItems: 'flex-end',
          justifyContent: 'space-between',
          gap: '0.4em 1.5em',
        }}
      >
        <div style={{ minWidth: 0 }}>
          <h1
            style={{
              fontSize: '2.25em',
              lineHeight: 1.1,
              fontWeight: headingWeight(c, 600),
              letterSpacing: '-0.01em',
              color: c.secondaryColor,
            }}
          >
            {displayName(cv)}
          </h1>
          {cv.personal.title ? (
            <p style={{ marginTop: '0.12em', fontWeight: bodyWeight(c, 600), color: accentText }}>
              {cv.personal.title}
            </p>
          ) : null}
        </div>
        <div style={{ textAlign: 'right' }}>
          <ContactList
            cv={cv}
            accent={accent}
            color={muted}
            icons={c.showIcons}
            layout="stack"
            gap="0.18em"
            fontSize="0.86em"
          />
        </div>
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
                fontSize: '0.92em',
                fontWeight: headingWeight(c, 700),
                textTransform: headingTransform(c),
                letterSpacing: headingTracking(c),
                color: accentText,
                borderBottom: `1px solid ${tint(accent, 0.62)}`,
                paddingBottom: '0.25em',
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
              variants={{
                // The claim beside its evidence, not above it — a reference table the
                // reader can scan before committing to the history below.
                competencies: 'grouped',
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
              skillColumns={2}
              skillDisplay="text"
            />
          </section>
        ))}
      </div>
    </div>
  );
}
