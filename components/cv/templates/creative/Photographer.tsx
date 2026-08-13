import { contactEntries, ContactIcon, Photo, SectionContent } from '@/components/cv/parts';
import { fullName, headingTracking, headingTransform, tint } from '@/lib/cv/format';
import { visibleSections } from '@/lib/cv/sections';
import type { CVTemplateProps, TemplateMeta } from '@/types/cv';

export const meta: TemplateMeta = {
  id: 'creative-05',
  slug: 'photographer-cv',
  name: 'Photographer',
  category: 'creative',
  premium: true,
  atsScore: 2,
  columns: 1,
  hasPhoto: true,
  accentDefault: '#262626',
  tagline: 'A hairline gallery frame around a centred, letterspaced document.',
  description:
    'Photographer frames the whole page in a hairline border, then centres a large portrait, your name in wide letterspaced type and every heading beneath it, so the document reads like a print hung in a gallery. Colour is kept almost entirely out of the design — the accent survives only in the rules and list marks — which means a black-and-white print loses nothing at all. Centred headings and the frame are what make it beautiful and also what make it unsuitable for applicant tracking systems, so keep it for clients, galleries and agents.',
  bestFor: [
    'Photographers, cinematographers and retouchers',
    'Artists applying to galleries and residencies',
    'Freelancers sending a CV straight to a client',
  ],
  features: [
    'Inset hairline frame around the page',
    'Large centred portrait',
    'Wide letterspaced name',
    'Centred tiny-caps section headings',
  ],
  keywords: [
    'photographer cv template',
    'photography resume template',
    'artist cv template',
    'minimalist creative cv',
  ],
};

const FRAME_INSET = 14;

/**
 * Photographer — an inset hairline frame around a centred, near-monochrome document.
 *
 * The frame is a real border on a flowing box rather than a background, so nothing is
 * clipped when the content runs onto a second page.
 */
export default function Photographer({ cv, customization: c }: CVTemplateProps) {
  const accent = c.accentColor;
  const sections = visibleSections(cv);
  const contacts = contactEntries(cv);
  const hairline = tint(c.textColor, 0.74);
  const muted = tint(c.textColor, 0.35);
  const tracking = headingTransform(c) === 'uppercase' ? '0.24em' : headingTracking(c);

  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        minHeight: 'inherit',
        boxSizing: 'border-box',
        padding: FRAME_INSET,
      }}
    >
      <div
        style={{
          flex: 1,
          boxSizing: 'border-box',
          border: `1px solid ${hairline}`,
          padding: `${c.pageMargin}px ${Math.round(c.pageMargin * 1.3)}px ${c.pageMargin}px`,
        }}
      >
        <header style={{ textAlign: 'center' }}>
          {c.showPhoto ? (
            <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '1.25em' }}>
              <Photo
                cv={cv}
                c={c}
                size={168}
                border={hairline}
                borderWidth={1}
                fallbackBackground={tint(accent, 0.88)}
                fallbackColor={accent}
              />
            </div>
          ) : null}

          <h1
            style={{
              fontSize: '1.8em',
              lineHeight: 1.25,
              fontWeight: 500,
              letterSpacing: '0.3em',
              textIndent: '0.3em',
              textTransform: 'uppercase',
              color: c.secondaryColor,
            }}
          >
            {fullName(cv) || 'Your Name'}
          </h1>

          {cv.personal.title ? (
            <p
              style={{
                marginTop: '0.6em',
                fontSize: '0.76em',
                letterSpacing: '0.22em',
                textIndent: '0.22em',
                textTransform: 'uppercase',
                color: muted,
              }}
            >
              {cv.personal.title}
            </p>
          ) : null}

          <span
            aria-hidden
            style={{
              display: 'block',
              width: '2.6em',
              height: 1,
              background: accent,
              margin: '1em auto',
            }}
          />

          {contacts.length > 0 ? (
            <div
              style={{
                display: 'flex',
                flexWrap: 'wrap',
                justifyContent: 'center',
                gap: '0.35em 1.15em',
                fontSize: '0.84em',
                color: muted,
              }}
            >
              {contacts.map((entry) => (
                <span
                  key={entry.key}
                  style={{ display: 'inline-flex', alignItems: 'center', gap: '0.4em', minWidth: 0 }}
                >
                  {c.showIcons ? <ContactIcon name={entry.icon} size="1em" color={accent} /> : null}
                  {entry.href ? (
                    <a href={entry.href} style={{ color: 'inherit' }}>
                      {entry.label}
                    </a>
                  ) : (
                    <span>{entry.label}</span>
                  )}
                </span>
              ))}
            </div>
          ) : null}
        </header>

        {sections.map((section) => (
          <section
            key={section.id}
            className="cv-section"
            style={{ marginTop: `${c.sectionSpacing * 1.5}px` }}
          >
            <h2
              className="cv-section-title"
              style={{
                fontSize: '0.7em',
                fontWeight: 700,
                textAlign: 'center',
                textTransform: headingTransform(c),
                letterSpacing: tracking,
                textIndent: tracking,
                color: c.secondaryColor,
                marginBottom: '0.9em',
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
              rule={hairline}
              gap={1.15}
              variants={{
                experience: 'minimal',
                interests: 'tags',
                education: 'compact',
                projects: 'compact',
                certifications: 'compact',
                awards: 'compact',
                publications: 'compact',
                languages: 'inline',
                references: 'grid',
              }}
              skillColumns={3}
            />
          </section>
        ))}
      </div>
    </div>
  );
}
