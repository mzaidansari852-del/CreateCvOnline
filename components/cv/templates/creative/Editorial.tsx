import { ContactList, SectionContent } from '@/components/cv/parts';
import {
  centredTracking,
  accentOn,
  mutedOn,
  fullName,
  headingTracking,
  headingTransform,
  tint,
} from '@/lib/cv/format';
import { type ResolvedSection, visibleSections } from '@/lib/cv/sections';
import type { CVCustomization, CVData, CVTemplateProps, TemplateMeta } from '@/types/cv';

export const meta: TemplateMeta = {
  id: 'creative-09',
  slug: 'editorial-cv',
  name: 'Editorial',
  category: 'creative',
  premium: true,
  atsScore: 3,
  columns: 2,
  hasPhoto: false,
  accentDefault: '#1c1917',
  tagline: 'A masthead name, a standfirst summary and two text columns — a CV set like a feature.',
  description:
    'Editorial borrows the anatomy of a magazine opener: your name is a masthead ruled top and bottom across the full width, and your summary runs underneath as a standfirst in larger type with generous side margins. Everything after it flows into two text columns, alternating left and right in your chosen section order, each heading opening with an oversized accent initial. No photo, no icons-as-decoration — the typography does the work, which makes it a strong choice when the CV is read rather than scanned by software.',
  bestFor: [
    'Writers, editors and journalists',
    'Communications and PR professionals',
    'Consultants presenting a dense, text-heavy record',
  ],
  features: [
    'Full-width masthead with thick and hairline rules',
    'Summary set as a wide-margin standfirst',
    'Two text columns divided by a hairline rule',
    'Oversized accent initial on every heading',
    'Skills written as prose rather than charted',
  ],
  keywords: [
    'editorial cv template',
    'magazine style resume',
    'two column cv template',
    'writer cv template',
  ],
};

/**
 * Editorial — magazine anatomy.
 *
 * Masthead, standfirst, then a two-column text well. Sections are dealt into the columns
 * by their position in the user's own order (even left, odd right), so re-ordering
 * sections in the editor moves them between columns predictably.
 */
export default function Editorial({ cv, customization: c }: CVTemplateProps) {
  const accent = c.accentColor;
  const accentText = accentOn(accent);
  const sections = visibleSections(cv);
  const summary = sections.find((section) => section.id === 'summary');
  const rest = sections.filter((section) => section.id !== 'summary');
  const left = rest.filter((_, index) => index % 2 === 0);
  const right = rest.filter((_, index) => index % 2 === 1);
  const name = fullName(cv);
  const muted = mutedOn(c.textColor, 0.34);
  const hairline = tint(c.textColor, 0.72);

  return (
    <div style={{ padding: c.pageMargin, minHeight: 'inherit' }}>
      <header style={{ borderTop: `6px solid ${accent}`, paddingTop: '0.5em' }}>
        <h1
          style={{
            fontSize: '3em',
            lineHeight: 1.02,
            fontWeight: 700,
            letterSpacing: '-0.025em',
            textAlign: 'center',
            color: c.secondaryColor,
          }}
        >
          {name || 'Your Name'}
        </h1>
      </header>

      <div
        style={{
          borderTop: `1px solid ${hairline}`,
          marginTop: '0.5em',
          paddingTop: '0.45em',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'baseline',
          flexWrap: 'wrap',
          gap: '0.3em 1.2em',
        }}
      >
        {cv.personal.title ? (
          <p
            style={{
              fontSize: '0.9em',
              fontWeight: 600,
              textTransform: 'uppercase',
              letterSpacing: '0.18em',
              color: accentText,
            }}
          >
            {cv.personal.title}
          </p>
        ) : null}
        <ContactList
          cv={cv}
          accent={accent}
          color={muted}
          icons={c.showIcons}
          layout="inline"
          gap="0.2em 1em"
          fontSize="0.86em"
        />
      </div>

      {summary ? (
        <section
          className="cv-section"
          style={{
            marginTop: `${c.sectionSpacing}px`,
            paddingLeft: '2.4em',
            paddingRight: '2.4em',
          }}
        >
          <h2
            className="cv-section-title"
            style={{
              fontSize: '0.74em',
              fontWeight: 700,
              textAlign: 'center',
              textTransform: 'uppercase',
              ...centredTracking('0.22em'),
              color: muted,
              marginBottom: '0.5em',
            }}
          >
            {summary.label}
          </h2>
          <div style={{ fontSize: '1.22em', lineHeight: 1.45, textAlign: 'center' }}>
            <SectionContent
              sectionId={summary.id}
              cv={cv}
              c={c}
              accent={accent}
              color={c.textColor}
            />
          </div>
        </section>
      ) : null}

      <div
        style={{
          display: 'grid',
          gridTemplateColumns: '1fr 1fr',
          marginTop: `${c.sectionSpacing}px`,
        }}
      >
        <div style={{ paddingRight: '1.5em' }}>
          <Column sections={left} cv={cv} c={c} accent={accent} muted={muted} />
        </div>
        <div style={{ paddingLeft: '1.5em', borderLeft: `1px solid ${hairline}` }}>
          <Column sections={right} cv={cv} c={c} accent={accent} muted={muted} />
        </div>
      </div>
    </div>
  );
}

function Column({
  sections,
  cv,
  c,
  accent,
  muted,
}: {
  sections: ResolvedSection[];
  cv: CVData;
  c: CVCustomization;
  accent: string;
  muted: string;
}) {
  const accentText = accentOn(accent);
  return (
    <>
      {sections.map((section, index) => {
        const initial = section.label.charAt(0);
        const remainder = section.label.slice(1);

        return (
          <section
            key={section.id}
            className="cv-section"
            style={{ marginTop: index === 0 ? 0 : `${c.sectionSpacing}px` }}
          >
            <h2
              className="cv-section-title"
              style={{
                display: 'flex',
                alignItems: 'baseline',
                gap: '0.04em',
                fontSize: '0.96em',
                fontWeight: 700,
                color: c.secondaryColor,
                textTransform: headingTransform(c),
                letterSpacing: headingTracking(c),
                marginBottom: '0.45em',
              }}
            >
              <span style={{ fontSize: '2em', lineHeight: 0.85, color: accentText }}>
                {initial}
              </span>
              <span>{remainder}</span>
            </h2>
            <SectionContent
              sectionId={section.id}
              cv={cv}
              c={c}
              accent={accent}
              color={c.textColor}
              muted={muted}
              rule={tint(c.textColor, 0.72)}
              variants={{
                experience: 'compact',
                education: 'compact',
                projects: 'compact',
                certifications: 'compact',
                awards: 'compact',
                volunteer: 'compact',
                publications: 'compact',
                languages: 'inline',
                interests: 'inline',
                references: 'stack',
              }}
              // Level bars would be the only graphic on an otherwise typographic page, and
              // a half-width column is too narrow to carry a bar and its label.
              skillDisplay="text"
              skillColumns={1}
            />
          </section>
        );
      })}
    </>
  );
}
