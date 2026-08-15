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
  id: 'classic-03',
  slug: 'academic-cv',
  name: 'Academic CV',
  category: 'classic',
  premium: true,
  atsScore: 5,
  columns: 1,
  hasPhoto: false,
  accentDefault: '#1e3a8a',
  fonts: { heading: 'libre-baskerville', body: 'source-serif' },
  metrics: { lineHeight: 1.54, pageMargin: 66 },
  tagline: 'Numbered sections and hanging-indent publications, built to run to four pages.',
  description:
    'Academic CV is designed for a document that keeps going: section headings are numbered so a reviewer can refer to "section 4" on a six-page CV, and each is closed by a rule across the full measure. Publications are set with a hanging indent, which keeps a long author list readable instead of letting it merge into the entry above. The line rhythm is deliberately dense, so adding teaching, grants and conference sections costs you less paper than it would in a modern layout.',
  bestFor: [
    'Faculty and postdoctoral applications',
    'PhD candidates with a publication record',
    'Researchers submitting a multi-page CV',
  ],
  features: [
    'Numbered section headings with full-width rules',
    'Hanging-indent publication list',
    'Centred name, title and contact block',
    'Dense rhythm tuned for long documents',
  ],
  keywords: [
    'academic cv template',
    'research cv template',
    'postdoc cv template',
    'phd cv template',
  ],
};

/**
 * Academic CV — numbered sections for a document that runs long.
 *
 * The numbering comes from the position of each section in the user's own ordering, so it
 * stays correct when sections are reordered, disabled or left empty. Publications get a
 * hanging indent: the wrapper carries a negative text indent so continuation lines sit in
 * from the entry's first line, the way a bibliography is set.
 */
export default function Academic({ cv, customization: c }: CVTemplateProps) {
  const accent = c.accentColor;
  const accentText = accentOn(accent);
  const rule = tint(accent, 0.42);
  const sections = visibleSections(cv);
  const spacing = Math.round(c.sectionSpacing * 0.9);

  return (
    <div style={{ padding: c.pageMargin }}>
      <header style={{ textAlign: 'center', marginBottom: `${spacing}px` }}>
        <h1
          style={{
            fontSize: '2.8em',
            lineHeight: 1.14,
            fontWeight: headingWeight(c, 500),
            ...centredTracking('0.05em'),
            color: c.secondaryColor,
          }}
        >
          {displayName(cv)}
        </h1>
        {cv.personal.title ? (
          <p style={{ marginTop: '0.2em', fontSize: '1.04em', color: accentText }}>
            {cv.personal.title}
          </p>
        ) : null}
        <div style={{ marginTop: '0.45em' }}>
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
              fontSize: '0.98em',
              fontWeight: headingWeight(c, 700),
              fontVariant: 'small-caps',
              textTransform: headingTransform(c),
              letterSpacing: headingTracking(c),
              color: c.secondaryColor,
              borderBottom: `1px solid ${rule}`,
              paddingBottom: '0.18em',
              marginBottom: '0.45em',
            }}
          >
            <span aria-hidden style={{ color: accentText, marginRight: '0.45em' }}>
              {index + 1}.
            </span>
            {section.label}
          </h2>
          <div
            style={
              section.id === 'publications'
                ? { paddingLeft: '1.6em', textIndent: '-1.6em' }
                : undefined
            }
          >
            <SectionContent
              sectionId={section.id}
              cv={cv}
              c={c}
              accent={accent}
              color={c.textColor}
              gap={0.72}
              variants={{
                publications: 'stack',
                education: 'stack',
                experience: 'stack',
                projects: 'stack',
                languages: 'inline',
                certifications: 'compact',
                awards: 'compact',
                volunteer: 'compact',
                interests: 'inline',
                references: 'grid',
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
 * Centred running-text contact block. Kept as inline content rather than a flex row so an
 * address that wraps onto a second line stays centred under the first.
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
            <span aria-hidden style={{ padding: '0 0.45em', opacity: 0.5 }}>
              ·
            </span>
          ) : null}
        </span>
      ))}
    </div>
  );
}
