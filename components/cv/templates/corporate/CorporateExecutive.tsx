import { ContactList, SectionContent } from '@/components/cv/parts';
import {
  accentOn,
  bodyWeight,
  centredTracking,
  fullName,
  headingTracking,
  headingTransform,
  headingWeight,
  tint,
} from '@/lib/cv/format';
import { visibleSections } from '@/lib/cv/sections';
import type { CVTemplateProps, TemplateMeta } from '@/types/cv';

export const meta: TemplateMeta = {
  id: 'corporate-01',
  slug: 'executive-cv',
  name: 'Corporate Executive',
  category: 'corporate',
  premium: true,
  atsScore: 4,
  columns: 1,
  hasPhoto: false,
  accentDefault: '#14304f',
  fonts: { heading: 'source-serif', body: 'lato' },
  metrics: { lineHeight: 1.42, pageMargin: 44 },
  tagline: 'A double-ruled letterhead over a formal single column.',
  description:
    'Corporate Executive opens with a bordered letterhead: your name set in wide capitals inside a double rule, the title beneath it, and contact details on one centred line under a hairline. Below the letterhead the document is deliberately plain — a single column with small underlined section labels, the format boards, partners and search firms expect to receive. Nothing is hidden in a sidebar, so the printed page and the parsed text say the same thing in the same order.',
  bestFor: [
    'Board and C-suite candidates',
    'Partners and practice leads in professional services',
    'Finance, legal and public-sector roles with formal conventions',
  ],
  features: [
    'Double-ruled letterhead header',
    'Name set in wide-spaced capitals',
    'Centred single-line contact row',
    'Underlined section labels',
    'Conservative single-column body',
  ],
  keywords: [
    'executive cv template',
    'corporate cv template',
    'formal cv template',
    'board level cv template',
  ],
};

/**
 * Corporate Executive — letterhead archetype.
 *
 * The double rule is two nested bordered boxes rather than an `outline`, so the gap
 * between the rules is real padding that scales with the page margin and prints reliably.
 */
export default function CorporateExecutive({ cv, customization: c }: CVTemplateProps) {
  const accent = c.accentColor;
  const accentText = accentOn(accent);
  const sections = visibleSections(cv);
  const innerRule = tint(accent, 0.45);

  return (
    <div
      style={{
        padding: c.pageMargin,
        display: 'flex',
        flexDirection: 'column',
        minHeight: 'inherit',
      }}
    >
      <header style={{ border: `2px solid ${accent}`, padding: 3 }}>
        <div
          style={{
            border: `1px solid ${innerRule}`,
            padding: `${c.pageMargin * 0.44}px ${c.pageMargin * 0.5}px`,
            textAlign: 'center',
          }}
        >
          <h1
            style={{
              fontSize: '2.45em',
              lineHeight: 1.2,
              fontWeight: headingWeight(c, 600),
              textTransform: 'uppercase',
              ...centredTracking('0.16em'),
              color: c.secondaryColor,
            }}
          >
            {fullName(cv) || 'Your Name'}
          </h1>
          {cv.personal.title ? (
            <p
              style={{
                marginTop: '0.4em',
                fontSize: '0.92em',
                fontWeight: bodyWeight(c, 600),
                textTransform: 'uppercase',
                letterSpacing: '0.2em',
                color: accentText,
              }}
            >
              {cv.personal.title}
            </p>
          ) : null}

          <div aria-hidden style={{ height: 1, background: innerRule, margin: '0.85em 0 0.7em' }} />

          <div style={{ display: 'flex', justifyContent: 'center', textAlign: 'center' }}>
            <ContactList
              cv={cv}
              accent={accent}
              color={c.textColor}
              icons={c.showIcons}
              layout="inline"
              separator="   |   "
              gap="0.35em 1.15em"
              fontSize="0.9em"
            />
          </div>
        </div>
      </header>

      <div style={{ marginTop: `${c.pageMargin * 0.72}px`, flex: 1 }}>
        {sections.map((section, index) => (
          <section
            key={section.id}
            className="cv-section"
            style={{ marginTop: index === 0 ? 0 : `${c.sectionSpacing}px` }}
          >
            <h2
              className="cv-section-title"
              style={{
                fontSize: '0.85em',
                fontWeight: headingWeight(c, 700),
                textTransform: headingTransform(c),
                letterSpacing: headingTracking(c),
                color: accentText,
                paddingBottom: '0.3em',
                borderBottom: `1px solid ${innerRule}`,
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
              variants={{
                experience: 'stack',
                education: 'stack',
                projects: 'stack',
                certifications: 'stack',
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
