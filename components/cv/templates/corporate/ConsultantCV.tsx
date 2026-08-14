import { ContactIcon, SectionContent, contactEntries } from '@/components/cv/parts';
import { accentOn, fullName, headingTracking, headingTransform, tint } from '@/lib/cv/format';
import { visibleSections } from '@/lib/cv/sections';
import type { CVData, CVTemplateProps, TemplateMeta } from '@/types/cv';

export const meta: TemplateMeta = {
  id: 'corporate-04',
  slug: 'consultant-cv',
  name: 'Consultant CV',
  category: 'corporate',
  premium: true,
  atsScore: 4,
  columns: 1,
  hasPhoto: false,
  accentDefault: '#b45309',
  tagline: 'Section labels sit in a ruled left margin so the text column runs uninterrupted.',
  description:
    'Consultant CV moves every section label into a ruled left margin, so the body runs as one uninterrupted column of text from the first line to the last — the structure of a well-set case document rather than a form. Your name sits large on the left of the header with contact details aligned to the same baseline on the right, and the line beneath it works as a positioning statement. It suits a CV that will be read closely rather than skimmed.',
  bestFor: [
    'Strategy and management consultants',
    'Independent advisers and interim specialists',
    'Analysts presenting dense written evidence',
  ],
  features: [
    'Side-label sections with a vertical rule',
    'One uninterrupted body text column',
    'Baseline-aligned header contact block',
    'Positioning statement beneath the name',
  ],
  keywords: [
    'consultant cv template',
    'consulting resume template',
    'advisory cv template',
    'strategy consultant cv',
  ],
};

/** Width of the side-label gutter, in em. */
const LABEL_WIDTH = '8.5em';

/**
 * Consultant CV — side-label archetype.
 *
 * Each section is a two-column grid whose left cell holds only the heading; because grid
 * items stretch, the cell's right border draws a rule for the exact height of that
 * section, and the body column stays a single uninterrupted measure of text.
 */
export default function ConsultantCV({ cv, customization: c }: CVTemplateProps) {
  const accent = c.accentColor;
  const accentText = accentOn(accent);
  const sections = visibleSections(cv);
  const labelInk = tint(c.textColor, 0.35);
  const rule = tint(accent, 0.62);

  return (
    <div
      style={{
        padding: c.pageMargin,
        display: 'flex',
        flexDirection: 'column',
        minHeight: 'inherit',
      }}
    >
      <header
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'baseline',
          gap: '1.8em',
        }}
      >
        <div style={{ minWidth: 0 }}>
          <h1
            style={{
              fontSize: '2.45em',
              lineHeight: 1.04,
              fontWeight: 700,
              color: c.secondaryColor,
              letterSpacing: '-0.022em',
            }}
          >
            {fullName(cv) || 'Your Name'}
          </h1>
          {cv.personal.title ? (
            <p
              style={{
                marginTop: '0.32em',
                fontSize: '1.05em',
                fontWeight: 600,
                color: accentText,
              }}
            >
              {cv.personal.title}
            </p>
          ) : null}
        </div>
        <ContactColumn cv={cv} accent={accent} color={c.textColor} icons={c.showIcons} />
      </header>

      <div aria-hidden style={{ height: 1, background: rule, marginTop: '1em' }} />

      <div style={{ marginTop: `${c.pageMargin * 0.55}px`, flex: 1 }}>
        {sections.map((section, index) => (
          <section
            key={section.id}
            className="cv-section"
            style={{
              display: 'grid',
              gridTemplateColumns: `${LABEL_WIDTH} minmax(0, 1fr)`,
              columnGap: '1.4em',
              marginTop: index === 0 ? 0 : `${c.sectionSpacing}px`,
            }}
          >
            <div style={{ borderRight: `1px solid ${rule}`, paddingRight: '1.1em' }}>
              <h2
                className="cv-section-title"
                style={{
                  fontSize: '0.78em',
                  fontWeight: 700,
                  lineHeight: 1.5,
                  textAlign: 'right',
                  color: labelInk,
                  textTransform: headingTransform(c),
                  letterSpacing: headingTracking(c),
                  paddingTop: '0.15em',
                }}
              >
                {section.label}
              </h2>
            </div>
            <div style={{ minWidth: 0 }}>
              <SectionContent
                sectionId={section.id}
                cv={cv}
                c={c}
                accent={accent}
                color={c.textColor}
                variants={{
                  experience: 'stack',
                  education: 'inline',
                  projects: 'compact',
                  certifications: 'compact',
                  awards: 'compact',
                  languages: 'inline',
                  interests: 'inline',
                  references: 'grid',
                }}
                skillColumns={2}
              />
            </div>
          </section>
        ))}
      </div>
    </div>
  );
}

/** Right-aligned contact stack, baseline-aligned with the name. */
function ContactColumn({
  cv,
  accent,
  color,
  icons,
}: {
  cv: CVData;
  accent: string;
  color: string;
  icons: boolean;
}) {
  const entries = contactEntries(cv);
  if (entries.length === 0) return null;

  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'flex-end',
        gap: '0.2em',
        minWidth: 0,
        fontSize: '0.88em',
        color,
      }}
    >
      {entries.map((entry) => (
        <span
          key={entry.key}
          style={{ display: 'inline-flex', alignItems: 'center', gap: '0.4em', minWidth: 0 }}
        >
          {icons ? <ContactIcon name={entry.icon} size="0.95em" color={accent} /> : null}
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
  );
}
