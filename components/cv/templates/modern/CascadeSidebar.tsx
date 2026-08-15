import { ContactList, Photo, SectionContent } from '@/components/cv/parts';
import {
  accentOn,
  bodyWeight,
  displayName,
  headingTracking,
  headingTransform,
  headingWeight,
  mix,
  mutedOn,
  readableOn,
  shade,
} from '@/lib/cv/format';
import { splitSections, visibleSections } from '@/lib/cv/sections';
import type { CVCustomization, CVData, CVTemplateProps, TemplateMeta } from '@/types/cv';

export const meta: TemplateMeta = {
  id: 'modern-11',
  slug: 'coloured-sidebar-cv',
  name: 'Coloured Sidebar',
  category: 'modern',
  premium: false,
  atsScore: 3,
  columns: 2,
  hasPhoto: true,
  accentDefault: '#0f4c81',
  fonts: { heading: 'poppins', body: 'open-sans' },
  metrics: { lineHeight: 1.44, pageMargin: 36 },
  tagline: 'A full-height saturated sidebar in your accent, with the type reversed out of it.',
  description:
    'Coloured Sidebar is the look most people picture when they picture a modern CV: a solid band of colour running the full height of the page, your photo and contact details reversed out of it in white, and the working history in black on white beside it. The band is painted on the page itself rather than inside the layout, so it continues to the bottom edge of every sheet including page two — the detail that separates this from a coloured box that stops where the text does. Text on the band is measured against the band, so an accent light enough to need dark type gets dark type automatically.',
  bestFor: [
    'Marketing, sales, hospitality and client-facing roles',
    'Anyone who wants a CV that reads as designed at a glance',
    'Applications sent directly to a person rather than through a portal',
  ],
  features: [
    'Full-bleed accent band that continues onto page two',
    'Reversed-out contact block and photo',
    'Automatic light or dark type depending on your accent',
    'Skills, languages and interests in the band; history beside it',
  ],
  keywords: [
    'cv template with coloured sidebar',
    'sidebar cv template',
    'coloured cv template',
    'modern cv template with photo',
  ],
};

/** Percentage of the page width the band occupies. Shared with `pageBackground`. */
const BAND_PERCENT = 34;
const BAND_SECTIONS = ['skills', 'languages', 'interests', 'certifications'];

/**
 * The band colour: the accent, deepened slightly so that white type clears AA on the
 * mid-tone accents people actually pick.
 */
function bandColour(accent: string): string {
  return shade(accent, 0.08);
}

/**
 * True when the band has something to hold.
 *
 * A third of the page painted solid with nothing on it is not a design, it is a mistake,
 * and it happens the moment a user turns off skills, languages and interests on a CV with
 * no photo and no contact rows. Rare, but the page background is drawn from the same
 * question the layout asks, so the two cannot disagree.
 */
function bandIsUsed(cv: CVData): boolean {
  const { aside } = splitSections(visibleSections(cv), BAND_SECTIONS);
  const { personal } = cv;
  const hasContact = Boolean(
    personal.email ||
      personal.phone ||
      personal.location ||
      personal.website ||
      personal.linkedin ||
      personal.github ||
      personal.links.length > 0,
  );
  return aside.length > 0 || Boolean(personal.photoUrl) || hasContact;
}

/**
 * Coloured Sidebar — the saturated band.
 *
 * The band is painted by `pageBackground`, not by this component. A coloured `<div>` inside
 * the flow stops at the end of its content and, worse, stops at the first page break — so
 * the second sheet of a two-page CV arrives with a white stripe where the design was. As a
 * page background it is redrawn on every sheet, and the print route copies it onto `<body>`
 * so the exported PDF matches.
 *
 * Every colour on the band is resolved against the band rather than against paper. That is
 * the whole reason `surface` exists on the parts: at an accent of `#facc15` this template
 * prints dark type on yellow, and at `#0f4c81` it prints white on navy, without either
 * being special-cased here.
 */
export default function CascadeSidebar({ cv, customization: c }: CVTemplateProps) {
  const accent = c.accentColor;
  const band = bandColour(accent);
  const onBand = readableOn(band);
  const bandMuted = mix(onBand, band, 0.28);
  const sections = visibleSections(cv);
  const { main, aside } = splitSections(sections, BAND_SECTIONS);
  const muted = mutedOn(c.textColor, 0.36);

  return (
    <div
      style={{
        display: 'grid',
        gridTemplateColumns: `${BAND_PERCENT}% 1fr`,
        alignItems: 'start',
        minHeight: 'inherit',
      }}
    >
      <aside style={{ padding: `${c.pageMargin}px ${c.pageMargin * 0.72}px`, minWidth: 0 }}>
        {cv.personal.photoUrl ? (
          <div style={{ marginBottom: '1em' }}>
            <Photo
              cv={cv}
              c={c}
              size={116}
              border={mix(onBand, band, 0.55)}
              borderWidth={2}
              fallbackBackground={mix(onBand, band, 0.82)}
              fallbackColor={onBand}
            />
          </div>
        ) : null}

        <ContactList
          cv={cv}
          accent={onBand}
          color={onBand}
          surface={band}
          iconColor={bandMuted}
          icons={c.showIcons}
          layout="stack"
          gap="0.42em"
          fontSize="0.85em"
        />

        {aside.map((section) => (
          <section
            key={section.id}
            className="cv-section"
            style={{ marginTop: `${c.sectionSpacing}px` }}
          >
            <h2
              className="cv-section-title"
              style={{
                fontSize: '0.86em',
                fontWeight: headingWeight(c, 700),
                textTransform: headingTransform(c),
                letterSpacing: headingTracking(c),
                color: onBand,
                borderBottom: `1px solid ${mix(onBand, band, 0.6)}`,
                paddingBottom: '0.28em',
                marginBottom: '0.55em',
              }}
            >
              {section.label}
            </h2>
            <SectionContent
              sectionId={section.id}
              cv={cv}
              c={c}
              accent={onBand}
              surface={band}
              color={onBand}
              muted={bandMuted}
              variants={{
                languages: 'inline',
                interests: 'tags',
                certifications: 'compact',
                competencies: 'inline',
              }}
              /*
               * One column, always. The band is a third of the page wide; the shared
               * default of two columns turns a skill list into a pair of four-character
               * stacks with the ratings falling off the edge.
               */
              skillColumns={1}
            />
          </section>
        ))}
      </aside>

      <div style={{ padding: `${c.pageMargin}px ${c.pageMargin}px ${c.pageMargin}px 0` }}>
        <header>
          <h1
            style={{
              fontSize: '2.6em',
              lineHeight: 1.05,
              fontWeight: headingWeight(c, 500),
              letterSpacing: '-0.02em',
              color: c.secondaryColor,
            }}
          >
            {displayName(cv)}
          </h1>
          {cv.personal.title ? (
            <p
              style={{
                marginTop: '0.22em',
                fontSize: '0.95em',
                fontWeight: bodyWeight(c, 600),
                textTransform: 'uppercase',
                letterSpacing: '0.16em',
                // The band colour, but measured against paper rather than against the
                // band. A yellow accent reads at 1.9:1 on white; `accentOn` darkens it
                // until it clears AA and leaves a dark navy alone.
                color: accentOn(band),
              }}
            >
              {cv.personal.title}
            </p>
          ) : null}
        </header>

        {main.map((section) => (
          <section
            key={section.id}
            className="cv-section"
            style={{ marginTop: `${c.sectionSpacing}px` }}
          >
            <h2
              className="cv-section-title"
              style={{
                fontSize: '0.92em',
                fontWeight: headingWeight(c, 700),
                textTransform: headingTransform(c),
                letterSpacing: headingTracking(c),
                color: c.secondaryColor,
                marginBottom: '0.55em',
                display: 'flex',
                alignItems: 'center',
                gap: '0.7em',
              }}
            >
              {section.label}
              <span
                aria-hidden
                style={{ flex: 1, height: 1, background: mix(band, '#ffffff', 0.62) }}
              />
            </h2>
            <SectionContent
              sectionId={section.id}
              cv={cv}
              c={c}
              accent={band}
              color={c.textColor}
              muted={muted}
              variants={{
                competencies: 'stack',
                experience: 'stack',
                education: 'stack',
                projects: 'stack',
                awards: 'compact',
                volunteer: 'compact',
                publications: 'compact',
                references: 'grid',
              }}
            />
          </section>
        ))}
      </div>
    </div>
  );
}

/**
 * The band, painted on the page rather than in the layout, so it reaches the bottom edge of
 * every sheet instead of stopping at the end of the sidebar's content.
 */
export function pageBackground(c: CVCustomization, cv: CVData): string | undefined {
  if (!bandIsUsed(cv)) return undefined;
  const band = bandColour(c.accentColor);
  return `linear-gradient(to right, ${band} 0 ${BAND_PERCENT}%, #ffffff ${BAND_PERCENT}% 100%)`;
}
