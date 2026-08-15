import { contactEntries, ContactIcon, SectionContent } from '@/components/cv/parts';
import {
  accentOn,
  centredTracking,
  displayName,
  headingTracking,
  headingTransform,
  headingWeight,
  tint,
} from '@/lib/cv/format';
import { visibleSections } from '@/lib/cv/sections';
import type { CVData, CVTemplateProps, TemplateMeta } from '@/types/cv';

export const meta: TemplateMeta = {
  id: 'classic-04',
  slug: 'legal-cv',
  name: 'Legal CV',
  category: 'classic',
  premium: true,
  atsScore: 5,
  columns: 1,
  hasPhoto: false,
  accentDefault: '#0f172a',
  fonts: { heading: 'times', body: 'times' },
  metrics: { lineHeight: 1.60, pageMargin: 62 },
  tagline: 'Justified copy under centred, underlined headings — a CV that reads like a filing.',
  description:
    'Legal CV borrows the conventions of a court document: your name centred in widely spaced capitals above a hairline rule, headings centred and underlined in small caps, and body copy justified to a hard right edge. Spacing is tight and conservative, so admissions, matters and clerkships fit without the document ever looking padded. It is deliberately unfashionable, which is exactly what chambers and firms that still read CVs on paper expect.',
  bestFor: [
    'Solicitors, barristers and paralegals',
    'Training contract and pupillage applications',
    'Compliance, judicial and in-house counsel roles',
  ],
  features: [
    'Centred name with a hairline rule beneath',
    'Underlined small-caps section headings',
    'Justified body copy',
    'Tight, conservative vertical spacing',
  ],
  keywords: [
    'legal cv template',
    'lawyer cv template',
    'solicitor cv template',
    'training contract cv',
  ],
};

/**
 * Legal CV — a formal, filing-like document.
 *
 * Two things carry the design: the ruled masthead and the centred underlined headings.
 * Body copy is justified, which is unusual for a CV and completely normal for the
 * profession this template is aimed at.
 */
export default function Legal({ cv, customization: c }: CVTemplateProps) {
  const accent = c.accentColor;
  const accentText = accentOn(accent);
  const rule = tint(accent, 0.4);
  const sections = visibleSections(cv);
  const spacing = Math.round(c.sectionSpacing * 0.9);

  return (
    <div style={{ padding: c.pageMargin }}>
      <header style={{ textAlign: 'center', marginBottom: `${spacing}px` }}>
        <div style={{ borderBottom: `1px solid ${rule}`, paddingBottom: '0.45em' }}>
          <h1
            style={{
              fontSize: '1.8em',
              lineHeight: 1.2,
              fontWeight: headingWeight(c, 700),
              textTransform: 'uppercase',
              ...centredTracking('0.2em'),
              color: c.secondaryColor,
            }}
          >
            {displayName(cv)}
          </h1>
          {cv.personal.title ? (
            <p
              style={{
                marginTop: '0.25em',
                fontSize: '1em',
                letterSpacing: '0.05em',
                color: accentText,
              }}
            >
              {cv.personal.title}
            </p>
          ) : null}
        </div>
        <div style={{ marginTop: '0.5em' }}>
          <CentredContacts cv={cv} accent={accent} color={c.textColor} icons={c.showIcons} />
        </div>
      </header>

      {sections.map((section, index) => (
        <section
          key={section.id}
          className="cv-section"
          style={{ marginTop: index === 0 ? 0 : `${spacing}px` }}
        >
          <h2
            className="cv-section-title"
            style={{
              textAlign: 'center',
              fontSize: '0.96em',
              fontWeight: headingWeight(c, 700),
              color: c.secondaryColor,
              marginBottom: '0.5em',
            }}
          >
            <span
              style={{
                display: 'inline-block',
                borderBottom: `1px solid ${rule}`,
                paddingBottom: '0.1em',
                fontVariant: 'small-caps',
                textTransform: headingTransform(c),
                letterSpacing: headingTracking(c),
              }}
            >
              {section.label}
            </span>
          </h2>
          <div style={{ textAlign: 'justify' }}>
            <SectionContent
              sectionId={section.id}
              cv={cv}
              c={c}
              accent={accent}
              color={c.textColor}
              gap={0.78}
              variants={{
                experience: 'stack',
                references: 'stack',
                education: 'stack',
                projects: 'stack',
                languages: 'grid',
                certifications: 'stack',
                awards: 'compact',
                volunteer: 'compact',
                publications: 'stack',
                interests: 'inline',
              }}
              skillColumns={2}
            />
          </div>
        </section>
      ))}
    </div>
  );
}

/**
 * Centred contact block set as running text with pipe separators, so a wrapped second line
 * stays centred beneath the rule instead of aligning left.
 */
function CentredContacts({
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
    <div style={{ textAlign: 'center', fontSize: '0.9em', color }}>
      {entries.map((entry, index) => (
        <span key={entry.key} style={{ whiteSpace: 'nowrap' }}>
          {icons ? (
            <span
              style={{ display: 'inline-block', verticalAlign: '-0.13em', marginRight: '0.32em' }}
            >
              <ContactIcon name={entry.icon} size="0.9em" color={accent} />
            </span>
          ) : null}
          {entry.href ? (
            <a href={entry.href} style={{ color: 'inherit' }}>
              {entry.label}
            </a>
          ) : (
            <span>{entry.label}</span>
          )}
          {index < entries.length - 1 ? (
            <span aria-hidden style={{ padding: '0 0.5em', opacity: 0.45 }}>
              |
            </span>
          ) : null}
        </span>
      ))}
    </div>
  );
}
