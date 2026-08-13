import { ContactList, Photo, SectionContent } from '@/components/cv/parts';
import { fullName, headingTracking, headingTransform, tint } from '@/lib/cv/format';
import { visibleSections } from '@/lib/cv/sections';
import type { CVTemplateProps, TemplateMeta } from '@/types/cv';

export const meta: TemplateMeta = {
  id: 'corporate-07',
  slug: 'hr-cv',
  name: 'Human Resources CV',
  category: 'corporate',
  premium: true,
  atsScore: 4,
  columns: 1,
  hasPhoto: true,
  accentDefault: '#6d28d9',
  tagline: 'Every section is a bordered card with its own tinted heading strip.',
  description:
    'Human Resources CV boxes each section into a bordered card topped by a tinted heading strip, which makes a document that mixes policy work, HRIS experience and headcount numbers easy to read block by block. The header pairs a photo with a two-column contact grid, so everything a people team checks first sits above the first card. Card spacing is driven entirely by the section-spacing control, so the whole document tightens to one page without deleting content.',
  bestFor: [
    'HR generalists and business partners',
    'Talent acquisition and people operations specialists',
    'Learning, development and reward professionals',
  ],
  features: [
    'One rounded card per section',
    'Tinted heading strip across each card',
    'Photo header with a two-column contact grid',
    'Spacing control compresses the page without edits',
  ],
  keywords: [
    'hr cv template',
    'human resources resume template',
    'recruiter cv template',
    'people operations cv',
  ],
};

const CARD_RADIUS = 6;

/**
 * Human Resources CV — stacked cards.
 *
 * Each section is a self-contained bordered card. The heading strip carries its own top
 * corner radii rather than relying on `overflow: hidden`, so a card that runs onto a second
 * page still prints every line of its body.
 */
export default function HumanResourcesCV({ cv, customization: c }: CVTemplateProps) {
  const accent = c.accentColor;
  const border = tint(accent, 0.74);
  const strip = tint(accent, 0.93);
  const sections = visibleSections(cv);
  const name = fullName(cv);

  return (
    <div style={{ padding: c.pageMargin }}>
      <header style={{ display: 'flex', alignItems: 'center', gap: '1.3em' }}>
        <Photo cv={cv} c={c} size={96} border={border} borderWidth={3} fallbackBackground={accent} />
        <div style={{ minWidth: 0, flex: 1 }}>
          <h1
            style={{
              fontSize: '2.1em',
              lineHeight: 1.1,
              fontWeight: 700,
              color: c.secondaryColor,
              letterSpacing: '-0.01em',
            }}
          >
            {name || 'Your Name'}
          </h1>
          {cv.personal.title ? (
            <p style={{ marginTop: '0.15em', fontSize: '1.05em', fontWeight: 600, color: accent }}>
              {cv.personal.title}
            </p>
          ) : null}
          <div style={{ marginTop: '0.6em' }}>
            <ContactList
              cv={cv}
              accent={accent}
              color={c.textColor}
              icons={c.showIcons}
              layout="grid"
              fontSize="0.88em"
            />
          </div>
        </div>
      </header>

      <main>
        {sections.map((section) => (
          <section
            key={section.id}
            className="cv-section"
            style={{
              marginTop: c.sectionSpacing,
              border: `1px solid ${border}`,
              borderRadius: CARD_RADIUS,
            }}
          >
            <h2
              className="cv-section-title"
              style={{
                background: strip,
                borderBottom: `1px solid ${border}`,
                borderTopLeftRadius: CARD_RADIUS - 1,
                borderTopRightRadius: CARD_RADIUS - 1,
                padding: '0.42em 0.9em',
                fontSize: '0.92em',
                fontWeight: 700,
                color: c.secondaryColor,
                textTransform: headingTransform(c),
                letterSpacing: headingTracking(c),
              }}
            >
              {section.label}
            </h2>
            <div style={{ padding: '0.75em 0.9em 0.85em' }}>
              <SectionContent
                sectionId={section.id}
                cv={cv}
                c={c}
                accent={accent}
                color={c.textColor}
                muted="#5a6270"
                rule={border}
                variants={{
                  experience: 'stack',
                  education: 'stack',
                  projects: 'compact',
                  certifications: 'compact',
                  volunteer: 'stack',
                  languages: 'grid',
                  interests: 'inline',
                  references: 'grid',
                }}
                skillColumns={2}
              />
            </div>
          </section>
        ))}
      </main>
    </div>
  );
}
