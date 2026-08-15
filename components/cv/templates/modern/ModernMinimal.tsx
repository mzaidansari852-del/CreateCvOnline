import { ContactList, SectionContent } from '@/components/cv/parts';
import {
  bodyWeight,
  centredTracking,
  displayName,
  headingTracking,
  headingTransform,
  headingWeight,
  mutedOn,
} from '@/lib/cv/format';
import { visibleSections } from '@/lib/cv/sections';
import type { CVTemplateProps, TemplateMeta } from '@/types/cv';

export const meta: TemplateMeta = {
  id: 'modern-02',
  slug: 'modern-minimal',
  name: 'Modern Minimal',
  category: 'modern',
  premium: false,
  atsScore: 5,
  columns: 1,
  hasPhoto: false,
  accentDefault: '#111827',
  fonts: { heading: 'ibm-plex-sans', body: 'ibm-plex-sans' },
  metrics: { lineHeight: 1.54, pageMargin: 46 },
  tagline: 'No rules, no boxes, no icons — the hierarchy is carried entirely by space.',
  description:
    'Modern Minimal takes every rule, panel and icon off the page and lets spacing do the work: a light, widely tracked name over one centred line of contact details, then small grey labels announcing each section with nothing drawn underneath them. Skills print as plain text and education collapses to one line per degree, which keeps a long career inside two pages without shrinking the type. With no decoration to misread, it also parses cleanly in every applicant tracking system.',
  bestFor: [
    'Roles where restraint reads as confidence',
    'Text-heavy CVs that need room to breathe',
    'Applications submitted through strict online portals',
  ],
  features: [
    'No dividers, boxes or icons anywhere',
    'Centred name with a single contact line',
    'Plain-text skills and one-line education',
    'Extra-wide spacing between sections',
  ],
  keywords: [
    'minimalist cv template',
    'simple cv template',
    'clean resume template',
    'black and white cv template',
  ],
};

/**
 * Modern Minimal — whitespace-only hierarchy.
 *
 * Deliberately draws nothing: no rules, no tinted blocks, no contact icons. Rank is
 * signalled by size, weight, tracking and the amount of air above a heading, which is why
 * every section gets close to double the usual `sectionSpacing` on top.
 */
export default function ModernMinimal({ cv, customization: c }: CVTemplateProps) {
  const accent = c.accentColor;
  const muted = mutedOn(c.textColor, 0.45);
  const sections = visibleSections(cv);

  return (
    <div style={{ padding: `${c.pageMargin * 1.15}px ${c.pageMargin}px ${c.pageMargin}px` }}>
      <header style={{ textAlign: 'center', marginBottom: `${c.sectionSpacing * 1.8}px` }}>
        <h1
          style={{
            fontSize: '2.75em',
            lineHeight: 1.18,
            fontWeight: headingWeight(c, 500),
            ...centredTracking('0.15em'),
            color: c.textColor,
          }}
        >
          {displayName(cv)}
        </h1>

        {cv.personal.title ? (
          <p
            style={{
              marginTop: '0.9em',
              fontSize: '0.86em',
              fontWeight: bodyWeight(c, 400),
              letterSpacing: '0.26em',
              textTransform: 'uppercase',
              color: muted,
            }}
          >
            {cv.personal.title}
          </p>
        ) : null}

        <div style={{ marginTop: '1.15em' }}>
          <ContactList
            cv={cv}
            accent={accent}
            color={muted}
            icons={false}
            layout="inline"
            separator="  ·  "
            fontSize="0.9em"
          />
        </div>
      </header>

      {sections.map((section, index) => (
        <section
          key={section.id}
          className="cv-section"
          style={{ marginTop: index === 0 ? 0 : `${c.sectionSpacing * 1.9}px` }}
        >
          <h2
            className="cv-section-title"
            style={{
              fontSize: '0.74em',
              fontWeight: headingWeight(c, 600),
              textTransform: headingTransform(c),
              letterSpacing: headingTracking(c),
              color: muted,
              marginBottom: '0.95em',
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
              experience: 'minimal',
              education: 'inline',
              languages: 'inline',
              interests: 'inline',
              projects: 'compact',
              certifications: 'compact',
              awards: 'compact',
              volunteer: 'compact',
              publications: 'compact',
              references: 'stack',
            }}
            skillDisplay="text"
            skillColumns={1}
            gap={1.15}
          />
        </section>
      ))}
    </div>
  );
}
