import { ContactIcon, SectionContent, type ContactIconKey } from '@/components/cv/parts';
import {
  accentOn,
  bodyWeight,
  displayName,
  ensureProtocol,
  headingTracking,
  headingTransform,
  headingWeight,
  mutedOn,
  prettyUrl,
  tint,
} from '@/lib/cv/format';
import { visibleSections } from '@/lib/cv/sections';
import type { CVData, CVTemplateProps, TemplateMeta } from '@/types/cv';

export const meta: TemplateMeta = {
  id: 'modern-06',
  slug: 'modern-tech',
  name: 'Modern Tech',
  category: 'modern',
  premium: true,
  atsScore: 4,
  columns: 1,
  hasPhoto: false,
  accentDefault: '#0ea5e9',
  fonts: { heading: 'ibm-plex-sans', body: 'roboto' },
  metrics: { lineHeight: 1.54, pageMargin: 44 },
  tagline: 'A bordered header card with key: value contact rows and // section markers.',
  description:
    'Modern Tech frames your identity inside a bordered card: name, role and contact details set out as key: value pairs across two columns, the way a config file reads. Section headings are prefixed with a // comment marker in the accent colour and separated by dashed rules, and skills group themselves by category into tags so a reader can take in a stack at a glance. Everything stays in one column, so the layout survives the parser on the other side of the job board.',
  bestFor: [
    'Software engineers and site reliability engineers',
    'Data, platform and infrastructure specialists',
    'Developers applying to product companies and startups',
  ],
  features: [
    'Bordered terminal-style header card',
    'Contact details as key: value pairs',
    'Comment-marker section headings',
    'Category-grouped skill tags',
    'Dashed dividers between sections',
  ],
  keywords: [
    'developer cv template',
    'software engineer resume template',
    'tech cv template',
    'programmer cv template',
  ],
};

interface ContactRow {
  id: string;
  key: string;
  value: string;
  href: string;
  icon: ContactIconKey;
}

/** Contact details as `key: value` rows — the terminal-card equivalent of `ContactList`. */
function contactRows(cv: CVData): ContactRow[] {
  const p = cv.personal;
  const rows: ContactRow[] = [];

  if (p.email)
    rows.push({
      id: 'email',
      key: 'email',
      value: p.email,
      href: `mailto:${p.email}`,
      icon: 'mail',
    });
  if (p.phone)
    rows.push({
      id: 'phone',
      key: 'phone',
      value: p.phone,
      href: `tel:${p.phone.replace(/[^\d+]/g, '')}`,
      icon: 'phone',
    });
  if (p.location)
    rows.push({ id: 'location', key: 'location', value: p.location, href: '', icon: 'pin' });
  if (p.website)
    rows.push({
      id: 'website',
      key: 'web',
      value: prettyUrl(p.website),
      href: ensureProtocol(p.website),
      icon: 'globe',
    });
  if (p.linkedin)
    rows.push({
      id: 'linkedin',
      key: 'linkedin',
      value: prettyUrl(p.linkedin),
      href: ensureProtocol(p.linkedin),
      icon: 'linkedin',
    });
  if (p.github)
    rows.push({
      id: 'github',
      key: 'github',
      value: prettyUrl(p.github),
      href: ensureProtocol(p.github),
      icon: 'github',
    });

  for (const link of p.links) {
    if (!link.url) continue;
    rows.push({
      id: link.id,
      key: (link.label || 'link').toLowerCase(),
      value: prettyUrl(link.url),
      href: ensureProtocol(link.url),
      icon: 'link',
    });
  }

  return rows;
}

/**
 * Modern Tech — a bordered "terminal card" header over dashed-rule sections.
 *
 * The card is the only filled element on the page; everything below it is separated by
 * 1px dashed rules, which keeps a dense engineering CV readable without columns.
 */
export default function ModernTech({ cv, customization: c }: CVTemplateProps) {
  const accent = c.accentColor;
  /*
   * The lightest surface the document paints on is not paper — it is this panel. Text
   * clamped against it is legible here and, being darker still, legible on white too, so a
   * single declaration covers every section instead of one per background.
   */
  const panel = tint(accent, 0.94);
  const accentText = accentOn(accent, panel);
  const muted = mutedOn(c.textColor, 0.4, panel);
  const dashed = tint(c.textColor, 0.7);
  const sections = visibleSections(cv);
  const rows = contactRows(cv);

  return (
    <div style={{ padding: c.pageMargin }}>
      <header
        className="cv-block"
        style={{
          border: `1px solid ${tint(accent, 0.68)}`,
          borderRadius: 4,
          background: tint(accent, 0.94),
          padding: '0.95em 1.15em',
        }}
      >
        <h1
          style={{ fontSize: '2.1em', lineHeight: 1.12, fontWeight: headingWeight(c, 600), color: c.secondaryColor }}
        >
          {displayName(cv)}
        </h1>
        {cv.personal.title ? (
          <p
            style={{ marginTop: '0.12em', fontSize: '1.02em', fontWeight: bodyWeight(c, 600), color: accentText }}
          >
            {cv.personal.title}
          </p>
        ) : null}

        {rows.length > 0 ? (
          <div
            style={{
              marginTop: '0.8em',
              display: 'grid',
              gridTemplateColumns: 'repeat(2, minmax(0, 1fr))',
              columnGap: '1.4em',
              rowGap: '0.28em',
              fontSize: '0.9em',
            }}
          >
            {rows.map((row) => (
              <div
                key={row.id}
                style={{
                  display: 'flex',
                  flexWrap: 'wrap',
                  alignItems: 'center',
                  gap: '0.38em',
                  minWidth: 0,
                }}
              >
                {c.showIcons ? <ContactIcon name={row.icon} size="0.95em" color={accent} /> : null}
                <span style={{ color: accentText, fontWeight: bodyWeight(c, 600) }}>{row.key}:</span>
                {row.href ? (
                  <a href={row.href} style={{ color: c.textColor, minWidth: 0 }}>
                    {row.value}
                  </a>
                ) : (
                  <span style={{ color: c.textColor, minWidth: 0 }}>{row.value}</span>
                )}
              </div>
            ))}
          </div>
        ) : null}
      </header>

      <div>
        {sections.map((section, index) => (
          <section
            key={section.id}
            className="cv-section"
            style={{
              marginTop: `${c.sectionSpacing * (index === 0 ? 1.1 : 1)}px`,
              paddingTop: index === 0 ? 0 : `${c.sectionSpacing}px`,
              borderTop: index === 0 ? undefined : `1px dashed ${dashed}`,
            }}
          >
            <h2
              className="cv-section-title"
              style={{
                fontSize: '0.96em',
                fontWeight: headingWeight(c, 700),
                textTransform: headingTransform(c),
                letterSpacing: headingTracking(c),
                color: c.secondaryColor,
                marginBottom: '0.55em',
              }}
            >
              <span
                aria-hidden
                style={{ color: accentText, marginRight: '0.4em', fontWeight: headingWeight(c, 700) }}
              >
                {'//'}
              </span>
              {section.label}
            </h2>

            <SectionContent
              sectionId={section.id}
              cv={cv}
              c={c}
              accent={accent}
              color={c.textColor}
              muted={muted}
              rule={dashed}
              variants={{
                experience: 'stack',
                education: 'compact',
                projects: 'compact',
                languages: 'inline',
                interests: 'inline',
                certifications: 'compact',
                awards: 'compact',
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
