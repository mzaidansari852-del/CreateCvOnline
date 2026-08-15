import { contactEntries, ContactIcon, SectionContent } from '@/components/cv/parts';
import {
  accentOn,
  bodyWeight,
  fullName,
  headingTracking,
  headingTransform,
  headingWeight,
  mutedOn,
  tint,
} from '@/lib/cv/format';
import { visibleSections } from '@/lib/cv/sections';
import type { CVTemplateProps, TemplateMeta } from '@/types/cv';

export const meta: TemplateMeta = {
  id: 'classic-10',
  slug: 'timeless-cv',
  name: 'Timeless',
  category: 'classic',
  premium: true,
  atsScore: 5,
  columns: 1,
  hasPhoto: false,
  accentDefault: '#334155',
  fonts: { heading: 'garamond', body: 'source-serif' },
  metrics: { lineHeight: 1.48, pageMargin: 54 },
  tagline: 'Name left, contact ranged right, and a date gutter running down the whole page.',
  description:
    'Timeless divides the header rather than centring it — name and role on the left, contact details ranged right — and then gives every role and every degree its own left-hand date gutter, so a reader can follow your chronology down one edge without re-reading the job titles. Section headings are set in letterspaced capitals over a 2px rule that runs the full measure, the only heavy line on the page. Margins are wider than usual to hold the line length in the comfortable range even at the smallest font size.',
  bestFor: [
    'Managers with a long, linear career',
    'Applications a person reads before a system does',
    'Anyone with roles at several employers',
  ],
  features: [
    'Split header with ranged-right contact details',
    'Left date gutter for roles and degrees',
    'Letterspaced capitals over a 2px rule',
    'Wide margins for a comfortable line length',
  ],
  keywords: [
    'classic cv template',
    'traditional cv template',
    'chronological cv template',
    'professional cv template',
  ],
};

/**
 * Timeless — the balanced classic.
 *
 * Two structural decisions do the work: the header is a two-column grid so the contact
 * block can range right against the name, and both experience and education use the shared
 * date-gutter variant so dates line up in a single column from the first job to the last
 * qualification. The contact rows are laid out here rather than with `ContactList` because
 * ranged-right rows need the icon trailing the label, mirrored against the right margin.
 */
export default function Timeless({ cv, customization: c }: CVTemplateProps) {
  const accent = c.accentColor;
  const accentText = accentOn(accent);
  const muted = mutedOn(c.textColor, 0.32);
  const rule = tint(c.textColor, 0.72);
  const tracking = c.headingCase === 'uppercase' ? '0.17em' : headingTracking(c);
  const sections = visibleSections(cv);
  const contacts = contactEntries(cv);
  const name = fullName(cv);

  return (
    <div style={{ padding: `${c.pageMargin}px ${Math.round(c.pageMargin * 1.3)}px` }}>
      <header
        style={{
          display: 'grid',
          gridTemplateColumns: 'minmax(0, 1fr) auto',
          gap: '1.5em',
          alignItems: 'start',
        }}
      >
        <div style={{ minWidth: 0 }}>
          <h1
            style={{
              fontSize: '3em',
              lineHeight: 1.12,
              fontWeight: headingWeight(c, 400),
              letterSpacing: '0.01em',
              color: c.secondaryColor,
            }}
          >
            {name || 'Your Name'}
          </h1>
          {cv.personal.title ? (
            <p
              style={{
                marginTop: '0.3em',
                fontSize: '0.96em',
                fontWeight: bodyWeight(c, 600),
                textTransform: 'uppercase',
                letterSpacing: '0.12em',
                color: accentText,
              }}
            >
              {cv.personal.title}
            </p>
          ) : null}
        </div>

        {contacts.length > 0 ? (
          <div style={{ minWidth: 0, fontSize: '0.9em', color: muted, paddingTop: '0.2em' }}>
            {contacts.map((entry, index) => (
              <div
                key={entry.key}
                style={{
                  display: 'flex',
                  justifyContent: 'flex-end',
                  alignItems: 'center',
                  gap: '0.45em',
                  marginTop: index === 0 ? 0 : '0.2em',
                  minWidth: 0,
                }}
              >
                {entry.href ? (
                  <a href={entry.href} style={{ color: 'inherit' }}>
                    {entry.label}
                  </a>
                ) : (
                  <span>{entry.label}</span>
                )}
                {c.showIcons ? (
                  <ContactIcon name={entry.icon} size="0.95em" color={accent} />
                ) : null}
              </div>
            ))}
          </div>
        ) : null}
      </header>

      {sections.map((section, index) => (
        <section
          key={section.id}
          className="cv-section"
          style={{
            marginTop: `${index === 0 ? Math.round(c.sectionSpacing * 1.4) : c.sectionSpacing}px`,
          }}
        >
          <h2
            className="cv-section-title"
            style={{
              fontSize: '0.94em',
              fontWeight: headingWeight(c, 700),
              color: c.secondaryColor,
              textTransform: headingTransform(c),
              letterSpacing: tracking,
              paddingBottom: '0.32em',
              borderBottom: `2px solid ${accent}`,
              marginBottom: '0.7em',
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
            rule={rule}
            gap={1.05}
            variants={{
              experience: 'two-col',
              education: 'two-col',
              projects: 'stack',
              certifications: 'stack',
              awards: 'stack',
              volunteer: 'stack',
              publications: 'stack',
              languages: 'grid',
              interests: 'inline',
              references: 'grid',
            }}
            skillColumns={2}
          />
        </section>
      ))}
    </div>
  );
}
