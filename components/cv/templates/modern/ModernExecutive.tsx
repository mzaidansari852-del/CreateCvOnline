import { ContactList, Photo, SectionContent } from '@/components/cv/parts';
import {
  mutedOn,
  accentOn,
  fullName,
  headingTracking,
  headingTransform,
  readableOn,
  shade,
  tint,
} from '@/lib/cv/format';
import { splitSections, visibleSections } from '@/lib/cv/sections';
import type { CVCustomization, CVTemplateProps, TemplateMeta } from '@/types/cv';

export const meta: TemplateMeta = {
  id: 'modern-03',
  slug: 'modern-executive',
  name: 'Modern Executive',
  category: 'modern',
  premium: true,
  atsScore: 3,
  columns: 2,
  hasPhoto: true,
  accentDefault: '#1f3af5',
  tagline: 'A full-height dark sidebar keeps contact details out of the way of your story.',
  description:
    'Modern Executive moves everything scannable — contact details, skills, languages, certifications — into a dark full-height sidebar, leaving the whole main column for the narrative of your career. The experience section uses a timeline so a long tenure at one company reads as progression rather than repetition. The sidebar band continues across every page of the exported PDF.',
  bestFor: [
    'Senior managers and directors',
    'Department heads presenting a long career',
    'Roles where the CV is read by a person, not only a parser',
  ],
  features: [
    'Full-height coloured sidebar that continues across pages',
    'Timeline experience layout',
    'Skill and language level bars',
    'Centred photo with accent ring',
  ],
  keywords: [
    'executive cv template',
    'two column cv template',
    'sidebar cv template',
    'senior manager cv',
  ],
};

const SIDEBAR_PERCENT = 34;
const SIDEBAR_SECTIONS = ['skills', 'languages', 'certifications', 'interests', 'references'];

/**
 * Modern Executive — reference implementation for two-column templates with a
 * full-bleed coloured sidebar.
 *
 * The sidebar band is painted by `modernExecutiveBackground`, which the print route
 * copies onto `<body>`; that is what makes the band continue onto page 2 and beyond in the
 * exported PDF instead of stopping at the end of page 1.
 */
export default function ModernExecutive({ cv, customization: c }: CVTemplateProps) {
  const accent = c.accentColor;
  const dark = shade(c.secondaryColor, 0.05);
  /*
   * Two surfaces, so two accents. The sidebar is near-black, and the default accent on it
   * was 2.75:1 — the job title directly under the name, unreadable, on the template this
   * project holds up as the reference for two-column layouts.
   */
  const accentOnDark = accentOn(accent, dark);
  const onDark = readableOn(dark);
  // Dimmed toward the band and then measured, rather than a fixed alpha over whatever
  // colour the user picked — see `mutedOn`.
  const sidebarMuted = mutedOn(onDark, 0.3, dark);
  const sections = visibleSections(cv);
  const { main, aside } = splitSections(sections, SIDEBAR_SECTIONS);
  const pad = c.pageMargin * 0.72;

  return (
    <div
      style={{
        display: 'grid',
        gridTemplateColumns: `${SIDEBAR_PERCENT}% 1fr`,
        minHeight: 'inherit',
      }}
    >
      {/* ---------------------------------------------------------------- aside */}
      <aside style={{ color: onDark, padding: `${pad}px ${pad * 0.86}px` }}>
        {c.showPhoto ? (
          <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '1.1em' }}>
            <Photo
              cv={cv}
              c={c}
              size={104}
              border={accent}
              borderWidth={3}
              fallbackBackground={accent}
            />
          </div>
        ) : null}

        <h1
          style={{
            fontSize: '1.6em',
            lineHeight: 1.14,
            fontWeight: 800,
            color: onDark,
            textAlign: 'center',
          }}
        >
          {fullName(cv) || 'Your Name'}
        </h1>
        {cv.personal.title ? (
          <p
            style={{
              textAlign: 'center',
              color: accentOnDark,
              fontWeight: 600,
              marginTop: '0.3em',
              fontSize: '0.98em',
            }}
          >
            {cv.personal.title}
          </p>
        ) : null}

        <div style={{ marginTop: '1.3em' }}>
          <SidebarHeading label="Contact" accent={accent} c={c} onDark={onDark} />
          <ContactList
            cv={cv}
            accent={accent}
            surface={dark}
            color={onDark}
            icons={c.showIcons}
            layout="stack"
            iconColor={accent}
            fontSize="0.9em"
          />
        </div>

        {aside.map((section) => (
          <div key={section.id} style={{ marginTop: `${c.sectionSpacing}px` }}>
            <SidebarHeading label={section.label} accent={accent} c={c} onDark={onDark} />
            <SectionContent
              sectionId={section.id}
              cv={cv}
              c={c}
              accent={accent}
              surface={dark}
              color={onDark}
              muted={sidebarMuted}
              rule={sidebarMuted}
              variants={{
                skills: undefined,
                languages: 'bars',
                certifications: 'compact',
                interests: 'stack',
                references: 'stack',
              }}
              skillColumns={1}
            />
          </div>
        ))}
      </aside>

      {/* ----------------------------------------------------------------- main */}
      <div style={{ padding: `${pad}px ${c.pageMargin}px ${c.pageMargin}px ${pad}px` }}>
        {main.map((section, index) => (
          <section
            key={section.id}
            className="cv-section"
            style={{ marginTop: index === 0 ? 0 : `${c.sectionSpacing}px` }}
          >
            <h2
              className="cv-section-title"
              style={{
                fontSize: '1.02em',
                fontWeight: 800,
                color: c.secondaryColor,
                textTransform: headingTransform(c),
                letterSpacing: headingTracking(c),
                paddingBottom: '0.3em',
                borderBottom: `2px solid ${tint(accent, 0.55)}`,
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
              variants={{ experience: 'timeline', education: 'stack', projects: 'stack' }}
            />
          </section>
        ))}
      </div>
    </div>
  );
}

function SidebarHeading({
  label,
  accent,
  c,
  onDark,
}: {
  label: string;
  accent: string;
  c: CVCustomization;
  onDark: string;
}) {
  return (
    <h2
      className="cv-section-title"
      style={{
        fontSize: '0.88em',
        fontWeight: 800,
        color: onDark,
        textTransform: headingTransform(c),
        letterSpacing: headingTracking(c),
        paddingBottom: '0.3em',
        marginBottom: '0.55em',
        borderBottom: `1.5px solid ${accent}`,
      }}
    >
      {label}
    </h2>
  );
}

/** Full-bleed sidebar band — also applied to `<body>` when printing. */
export function pageBackground(c: CVCustomization): string {
  const dark = shade(c.secondaryColor, 0.05);
  return `linear-gradient(to right, ${dark} 0 ${SIDEBAR_PERCENT}%, #ffffff ${SIDEBAR_PERCENT}% 100%)`;
}
