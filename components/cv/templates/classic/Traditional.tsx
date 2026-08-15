import { ContactList, SectionContent } from '@/components/cv/parts';
import { accentOn, displayName, headingTracking, headingTransform, headingWeight, tint } from '@/lib/cv/format';
import { visibleSections } from '@/lib/cv/sections';
import type { CVTemplateProps, TemplateMeta } from '@/types/cv';

export const meta: TemplateMeta = {
  id: 'classic-02',
  slug: 'traditional-cv',
  name: 'Traditional CV',
  category: 'classic',
  premium: false,
  atsScore: 5,
  columns: 1,
  hasPhoto: false,
  accentDefault: '#374151',
  fonts: { heading: 'georgia', body: 'georgia' },
  metrics: { lineHeight: 1.60, pageMargin: 64 },
  tagline: 'Headings sit out in the left margin, so every line of content shares one clean edge.',
  description:
    'Traditional CV sets each section heading in a fixed left-hand margin and aligns all of the content to a single indent beside it — the way typed CVs were laid out long before templates existed. There is exactly one rule on the page, beneath the header, so structure comes from alignment rather than decoration. It reads quickly because the eye only ever tracks one left edge, and it parses cleanly because underneath the alignment it is still one linear column.',
  bestFor: [
    'Conservative employers and long-established firms',
    'CVs with many short sections to keep tidy',
    'Anyone who wants structure without graphics',
  ],
  features: [
    'Section headings in a left margin gutter',
    'All content aligned to one common indent',
    'A single rule on the whole document',
    'Quiet, print-first typography',
  ],
  keywords: [
    'traditional cv template',
    'plain cv template',
    'simple cv layout',
    'no frills resume template',
  ],
};

/**
 * Width of the heading gutter. Every piece of content starts to the right of it, so this is
 * the single left edge the whole document is built on. Wide enough that an uppercase
 * heading with the user's tracking applied stays on one or two whole words.
 */
const GUTTER = '6.7em';

/**
 * Traditional CV — a hanging-indent document.
 *
 * Each section is a two-column grid: the heading occupies a fixed gutter on the left and
 * the body occupies everything to its right, so all content across the whole CV lines up on
 * one edge no matter how long the heading is.
 */
export default function Traditional({ cv, customization: c }: CVTemplateProps) {
  const accent = c.accentColor;
  const accentText = accentOn(accent);
  const sections = visibleSections(cv);

  return (
    <div style={{ padding: c.pageMargin }}>
      <header
        style={{
          borderBottom: `1px solid ${tint(accent, 0.45)}`,
          paddingBottom: '0.7em',
          marginBottom: `${c.sectionSpacing}px`,
        }}
      >
        <h1
          style={{
            fontSize: '1.95em',
            lineHeight: 1.14,
            fontWeight: headingWeight(c, 700),
            letterSpacing: '0.01em',
            color: c.secondaryColor,
          }}
        >
          {displayName(cv)}
        </h1>
        {cv.personal.title ? (
          <p style={{ fontSize: '1.02em', marginTop: '0.12em', color: accentText }}>
            {cv.personal.title}
          </p>
        ) : null}
        <div style={{ marginTop: '0.5em' }}>
          <ContactList
            cv={cv}
            accent={accent}
            color={c.textColor}
            icons={c.showIcons}
            layout="inline"
            separator="   •   "
            gap="0.3em 0.9em"
            fontSize="0.92em"
          />
        </div>
      </header>

      {sections.map((section, index) => (
        <section
          key={section.id}
          className="cv-section"
          style={{
            display: 'grid',
            gridTemplateColumns: `${GUTTER} 1fr`,
            columnGap: '1.2em',
            marginTop: index === 0 ? 0 : `${c.sectionSpacing}px`,
          }}
        >
          <h2
            className="cv-section-title"
            style={{
              fontSize: '0.7em',
              fontWeight: headingWeight(c, 700),
              lineHeight: 1.34,
              paddingTop: '0.3em',
              textTransform: headingTransform(c),
              letterSpacing: headingTracking(c),
              color: c.secondaryColor,
              // Wrap between words only: a broken word in the margin reads as a typo.
              overflowWrap: 'normal',
            }}
          >
            {section.label}
          </h2>
          <div style={{ minWidth: 0 }}>
            <SectionContent
              sectionId={section.id}
              cv={cv}
              c={c}
              accent={accent}
              color={c.textColor}
              gap={0.8}
              variants={{
                experience: 'minimal',
                education: 'compact',
                projects: 'compact',
                languages: 'inline',
                certifications: 'compact',
                awards: 'compact',
                volunteer: 'compact',
                publications: 'compact',
                interests: 'inline',
                references: 'stack',
              }}
              skillColumns={2}
            />
          </div>
        </section>
      ))}
    </div>
  );
}
