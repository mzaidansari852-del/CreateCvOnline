import { ContactList, Photo, SectionContent } from '@/components/cv/parts';
import { accentOn, fullName, headingTracking, headingTransform, tint } from '@/lib/cv/format';
import { splitSections, visibleSections } from '@/lib/cv/sections';
import type { CVCustomization, CVTemplateProps, TemplateMeta } from '@/types/cv';

export const meta: TemplateMeta = {
  id: 'creative-01',
  slug: 'creative-designer-cv',
  name: 'Creative Designer',
  category: 'creative',
  premium: true,
  atsScore: 3,
  columns: 2,
  hasPhoto: true,
  accentDefault: '#ef476f',
  tagline: 'A pale accent sidebar carries the details while your name takes the main column.',
  description:
    'Creative Designer keeps the personality in the layout rather than in the typography: a light accent sidebar holds your photo, contact details, skills and languages, while the main column opens with an oversized name and runs a single, uninterrupted narrative beneath it. Because the band is a soft tint rather than a dark block it prints cleanly on an office laser printer and survives being photocopied. The two-column structure is still harder for older parsers than a plain single column, so keep a simpler version for portal applications.',
  bestFor: [
    'Designers applying to studios and agencies',
    'Portfolio-led roles read by a person, not a parser',
    'Anyone who wants colour without a heavy dark sidebar',
  ],
  features: [
    'Light accent sidebar that continues onto every page',
    'Large circular photo at the top of the sidebar',
    'Oversized name in the main column',
    'Accent dot section headings',
  ],
  keywords: [
    'creative cv template',
    'designer cv template',
    'creative resume template with photo',
    'colourful two column cv',
  ],
};

const SIDEBAR_PERCENT = 36;
const SIDEBAR_SECTIONS = ['skills', 'languages', 'interests'];
const SIDEBAR_TINT = 0.9;

/**
 * Creative Designer — two columns with a light tinted band down the left.
 *
 * The band is painted by `pageBackground` so it continues onto page 2 of the PDF; the
 * `<aside>` itself is transparent and merely occupies the column.
 */
export default function CreativeDesigner({ cv, customization: c }: CVTemplateProps) {
  const accent = c.accentColor;
  /*
   * The band is painted by `pageBackground` onto the page rather than by the `<aside>`,
   * which is what makes it continue onto page 2 — and also why nothing inside the column
   * knew it was sitting on a tint. Naming it here is what lets the text be measured.
   */
  const band = tint(accent, SIDEBAR_TINT);
  const accentText = accentOn(accent, band);
  const sections = visibleSections(cv);
  const { main, aside } = splitSections(sections, SIDEBAR_SECTIONS);
  const pad = c.pageMargin * 0.78;

  return (
    <div
      style={{
        display: 'grid',
        gridTemplateColumns: `${SIDEBAR_PERCENT}% 1fr`,
        minHeight: 'inherit',
      }}
    >
      {/* ---------------------------------------------------------------- aside */}
      <aside style={{ padding: `${pad}px ${pad * 0.82}px ${c.pageMargin}px` }}>
        {c.showPhoto ? (
          <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '1.2em' }}>
            <Photo
              cv={cv}
              c={c}
              size={132}
              border="#ffffff"
              borderWidth={5}
              fallbackBackground={accent}
            />
          </div>
        ) : null}

        <DotHeading label="Contact" accent={accent} c={c} color={c.secondaryColor} />
        <ContactList
          cv={cv}
          accent={accent}
          color={c.textColor}
          icons={c.showIcons}
          layout="stack"
          iconColor={accent}
          fontSize="0.88em"
        />

        {aside.map((section) => (
          <section
            key={section.id}
            className="cv-section"
            style={{ marginTop: `${c.sectionSpacing}px` }}
          >
            <DotHeading label={section.label} accent={accent} c={c} color={c.secondaryColor} />
            <SectionContent
              sectionId={section.id}
              cv={cv}
              c={c}
              accent={accent}
              surface={band}
              color={c.textColor}
              variants={{ languages: 'bars', interests: 'stack' }}
              skillColumns={1}
            />
          </section>
        ))}
      </aside>

      {/* ----------------------------------------------------------------- main */}
      <div style={{ padding: `${pad}px ${c.pageMargin}px ${c.pageMargin}px ${pad * 0.9}px` }}>
        <header style={{ marginBottom: `${c.sectionSpacing * 1.1}px` }}>
          <h1
            style={{
              fontSize: '3.05em',
              lineHeight: 0.98,
              fontWeight: 800,
              letterSpacing: '-0.025em',
              color: c.secondaryColor,
            }}
          >
            {fullName(cv) || 'Your Name'}
          </h1>
          {cv.personal.title ? (
            <p
              style={{
                marginTop: '0.5em',
                fontSize: '0.92em',
                fontWeight: 700,
                letterSpacing: '0.2em',
                textTransform: 'uppercase',
                color: accentText,
              }}
            >
              {cv.personal.title}
            </p>
          ) : null}
          <span
            aria-hidden
            style={{
              display: 'block',
              marginTop: '0.75em',
              width: '3.4em',
              height: 4,
              borderRadius: 4,
              background: accent,
            }}
          />
        </header>

        {main.map((section, index) => (
          <section
            key={section.id}
            className="cv-section"
            style={{ marginTop: index === 0 ? 0 : `${c.sectionSpacing}px` }}
          >
            <DotHeading
              label={section.label}
              accent={accent}
              c={c}
              color={c.secondaryColor}
              size="1.02em"
            />
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
                certifications: 'compact',
                references: 'grid',
              }}
            />
          </section>
        ))}
      </div>
    </div>
  );
}

function DotHeading({
  label,
  accent,
  c,
  color,
  size = '0.9em',
}: {
  label: string;
  accent: string;
  c: CVCustomization;
  color: string;
  size?: string;
}) {
  return (
    <h2
      className="cv-section-title"
      style={{
        display: 'flex',
        alignItems: 'baseline',
        gap: '0.5em',
        fontSize: size,
        fontWeight: 800,
        color,
        textTransform: headingTransform(c),
        letterSpacing: headingTracking(c),
        marginBottom: '0.55em',
      }}
    >
      <span
        aria-hidden
        style={{
          width: '0.48em',
          height: '0.48em',
          borderRadius: '50%',
          background: accent,
          flexShrink: 0,
        }}
      />
      {label}
    </h2>
  );
}

/** Light accent band down the left column — also applied to `<body>` when printing. */
export function pageBackground(c: CVCustomization): string {
  const band = tint(c.accentColor, SIDEBAR_TINT);
  return `linear-gradient(to right, ${band} 0 ${SIDEBAR_PERCENT}%, #ffffff ${SIDEBAR_PERCENT}% 100%)`;
}
