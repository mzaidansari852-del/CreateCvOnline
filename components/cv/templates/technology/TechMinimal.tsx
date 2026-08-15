import { ContactIcon, contactEntries, SectionContent } from '@/components/cv/parts';
import {
  accentOn,
  fullName,
  headingTracking,
  headingTransform,
  headingWeight,
} from '@/lib/cv/format';
import { visibleSections } from '@/lib/cv/sections';
import type { CVTemplateProps, TemplateMeta } from '@/types/cv';

export const meta: TemplateMeta = {
  id: 'tech-10',
  slug: 'tech-minimal-cv',
  name: 'Tech Minimal',
  category: 'technology',
  premium: false,
  atsScore: 5,
  columns: 1,
  hasPhoto: false,
  accentDefault: '#111827',
  fonts: { heading: 'inter', body: 'roboto' },
  metrics: { lineHeight: 1.54, pageMargin: 48 },
  tagline:
    'Type and space only — left-aligned, tightly set, and impossible for a parser to misread.',
  description:
    'Tech Minimal strips a CV back to typography: no rules, no boxes, no coloured bands, so the only thing a reader ranks is what you have shipped. Contact details run as one dot-separated line under your name, skills read as plain comma-separated text, and roles are set compactly enough that a decade of work still fits in two pages. Because the document is a single linear column, what an applicant tracking system extracts is exactly what a person sees.',
  bestFor: [
    'Software engineers who dislike decorated CVs',
    'Applications through a strict ATS or job board',
    'Candidates compressing a long history into two pages',
  ],
  features: [
    'No rules, boxes or background colour anywhere',
    'Single dot-separated contact line',
    'Compact role entries and inline education',
    'Plain-text skills grouped by category',
  ],
  keywords: [
    'minimalist cv template',
    'developer cv template',
    'simple tech resume template',
    'ats friendly cv template',
  ],
};

/**
 * Tech Minimal — the least chrome of any template here.
 *
 * Everything is flush left and set on a tight rhythm; the only piece of punctuation the
 * design allows itself is the middle dot between contact details. Section headings carry no
 * rule at all, so the whitespace above them is what separates one block from the next.
 */
export default function TechMinimal({ cv, customization: c }: CVTemplateProps) {
  const accent = c.accentColor;
  const accentText = accentOn(accent);
  const sections = visibleSections(cv);
  const contacts = contactEntries(cv);
  const name = fullName(cv);

  return (
    <div style={{ padding: c.pageMargin }}>
      <header style={{ marginBottom: `${Math.round(c.sectionSpacing * 0.85)}px` }}>
        <h1
          style={{
            fontSize: '2em',
            lineHeight: 1.12,
            fontWeight: headingWeight(c, 700),
            letterSpacing: '-0.012em',
            color: c.secondaryColor,
          }}
        >
          {name || 'Your Name'}
        </h1>
        {cv.personal.title ? (
          <p style={{ fontSize: '1.02em', marginTop: '0.1em', color: accentText }}>
            {cv.personal.title}
          </p>
        ) : null}

        {contacts.length > 0 ? (
          <div
            style={{
              display: 'flex',
              flexWrap: 'wrap',
              alignItems: 'center',
              columnGap: '0.4em',
              rowGap: '0.1em',
              marginTop: '0.45em',
              fontSize: '0.94em',
              color: '#5b6472',
            }}
          >
            {contacts.map((entry, index) => (
              <span
                key={entry.key}
                style={{ display: 'inline-flex', alignItems: 'center', gap: '0.3em', minWidth: 0 }}
              >
                {c.showIcons ? (
                  <ContactIcon name={entry.icon} size="0.88em" color={accent} />
                ) : null}
                {entry.href ? (
                  <a href={entry.href} style={{ color: 'inherit' }}>
                    {entry.label}
                  </a>
                ) : (
                  <span>{entry.label}</span>
                )}
                {index < contacts.length - 1 ? (
                  <span aria-hidden style={{ marginLeft: '0.1em', opacity: 0.55 }}>
                    ·
                  </span>
                ) : null}
              </span>
            ))}
          </div>
        ) : null}
      </header>

      {sections.map((section, index) => (
        <section
          key={section.id}
          className="cv-section"
          style={{ marginTop: index === 0 ? 0 : `${Math.round(c.sectionSpacing * 0.85)}px` }}
        >
          <h2
            className="cv-section-title"
            style={{
              fontSize: '0.78em',
              fontWeight: headingWeight(c, 700),
              textTransform: headingTransform(c),
              letterSpacing: headingTracking(c),
              color: c.secondaryColor,
              marginBottom: '0.35em',
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
            gap={0.7}
            variants={{
              experience: 'compact',
              education: 'inline',
              languages: 'inline',
              projects: 'compact',
              certifications: 'compact',
              awards: 'compact',
              volunteer: 'compact',
              publications: 'compact',
              interests: 'inline',
            }}
            skillDisplay="text"
          />
        </section>
      ))}
    </div>
  );
}
