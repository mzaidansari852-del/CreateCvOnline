import { contactEntries, ContactList, Photo, SectionContent } from '@/components/cv/parts';
import {
  bodyWeight,
  displayName,
  headingTracking,
  headingTransform,
  headingWeight,
  mutedOn,
  readableOn,
  shade,
  tint,
} from '@/lib/cv/format';
import { visibleSections } from '@/lib/cv/sections';
import type { CVTemplateProps, TemplateMeta } from '@/types/cv';

export const meta: TemplateMeta = {
  id: 'corporate-08',
  slug: 'marketing-cv',
  name: 'Marketing CV',
  category: 'corporate',
  premium: true,
  atsScore: 3,
  columns: 1,
  hasPhoto: true,
  accentDefault: '#db2777',
  fonts: { heading: 'poppins', body: 'lato' },
  metrics: { lineHeight: 1.54, pageMargin: 56 },
  tagline: 'A two-tone split header: tinted name panel beside a solid accent photo panel.',
  description:
    'Marketing CV splits the header in two — a tinted panel carrying your name and title beside a solid accent panel holding the photo and contact details reversed out of the colour. Section headings are set in small solid pills rather than rules, which gives the page the feel of a brand system without pushing the body out of a single readable column. Skills render as tags and projects as a two-up card grid, so channels, tools and campaigns read as a kit rather than a list.',
  bestFor: [
    'Brand, campaign and product marketers',
    'Digital, content and growth specialists',
    'Agency marketers presenting client project work',
  ],
  features: [
    'Two-tone 60 / 40 split header',
    'Photo and contact reversed out of the accent',
    'Pill-shaped section headings',
    'Tag skills and two-up project cards',
  ],
  keywords: [
    'marketing cv template',
    'digital marketing resume template',
    'brand manager cv template',
    'creative marketing cv',
  ],
};

/**
 * Marketing CV — split-tone header over a pill-headed single column.
 *
 * The header band is a two-cell grid: a tint panel and a solid panel. It is a top band, not
 * a full-height column, so no `pageBackground` is exported and later pages stay white.
 */
export default function MarketingCV({ cv, customization: c }: CVTemplateProps) {
  const accent = c.accentColor;
  const onAccent = readableOn(accent);
  // Dimmed toward the band and then measured, rather than a fixed alpha over whatever
  // colour the user picked — see `mutedOn`.
  const panelMuted = mutedOn(onAccent, 0.3, accent);
  const sections = visibleSections(cv);
  // Without a photo or a single contact row the accent panel would be a bare colour block,
  // so the header collapses to the tinted panel alone.
  const hasAccentPanel = c.showPhoto || contactEntries(cv).length > 0;

  return (
    <div>
      <header
        style={{
          display: 'grid',
          gridTemplateColumns: hasAccentPanel ? '60% 40%' : '100%',
        }}
      >
        <div
          style={{
            background: tint(accent, 0.9),
            padding: `${c.pageMargin * 0.78}px ${
              hasAccentPanel ? c.pageMargin * 0.6 : c.pageMargin
            }px ${c.pageMargin * 0.78}px ${c.pageMargin}px`,
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'center',
            minWidth: 0,
          }}
        >
          <h1
            style={{
              fontSize: '2.75em',
              lineHeight: 1.05,
              fontWeight: headingWeight(c, 500),
              color: c.secondaryColor,
              letterSpacing: '-0.02em',
            }}
          >
            {displayName(cv)}
          </h1>
          {cv.personal.title ? (
            <p
              style={{
                marginTop: '0.35em',
                fontSize: '0.92em',
                fontWeight: bodyWeight(c, 700),
                color: shade(accent, 0.2),
                textTransform: 'uppercase',
                letterSpacing: '0.14em',
              }}
            >
              {cv.personal.title}
            </p>
          ) : null}
        </div>

        {hasAccentPanel ? (
          <div
            style={{
              background: accent,
              color: onAccent,
              padding: `${c.pageMargin * 0.62}px ${c.pageMargin * 0.7}px`,
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'center',
              gap: '0.8em',
              minWidth: 0,
            }}
          >
            <Photo
              cv={cv}
              c={c}
              size={84}
              border={onAccent}
              borderWidth={2}
              fallbackBackground={shade(accent, 0.22)}
              fallbackColor={onAccent}
            />
            <ContactList
              cv={cv}
              accent={accent}
              surface={accent}
              color={panelMuted}
              icons={c.showIcons}
              layout="stack"
              iconColor={onAccent}
              fontSize="0.84em"
            />
          </div>
        ) : null}
      </header>

      <div
        style={{
          padding: `${c.pageMargin * 0.82}px ${c.pageMargin}px ${c.pageMargin}px`,
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
                display: 'inline-block',
                background: accent,
                color: onAccent,
                borderRadius: 999,
                padding: '0.18em 0.85em',
                marginBottom: '0.6em',
                fontSize: '0.82em',
                fontWeight: headingWeight(c, 700),
                textTransform: headingTransform(c),
                letterSpacing: headingTracking(c),
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
              muted="#5b6472"
              variants={{
                experience: 'stack',
                education: 'stack',
                projects: 'cards',
                certifications: 'compact',
                awards: 'compact',
                languages: 'grid',
                interests: 'tags',
                references: 'grid',
              }}
              skillDisplay="tags"
            />
          </section>
        ))}
      </div>
    </div>
  );
}
