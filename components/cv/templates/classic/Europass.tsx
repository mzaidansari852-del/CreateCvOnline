import { Photo, SectionContent, contactEntries } from '@/components/cv/parts';
import {
  accentOn,
  bodyWeight,
  fullName,
  headingWeight,
  languageShort,
  mutedOn,
  tint,
} from '@/lib/cv/format';
import { visibleSections } from '@/lib/cv/sections';
import type { CVData, CVTemplateProps, TemplateMeta } from '@/types/cv';

export const meta: TemplateMeta = {
  id: 'classic-12',
  slug: 'europass-cv',
  name: 'Europass CV',
  category: 'classic',
  premium: false,
  atsScore: 5,
  columns: 1,
  hasPhoto: true,
  accentDefault: '#003399',
  fonts: { heading: 'open-sans', body: 'open-sans' },
  metrics: { lineHeight: 1.52, pageMargin: 56 },
  standard: 'Europass (European Commission)',
  tagline: 'The European standard layout, with a real CEFR self-assessment grid.',
  description:
    'Europass CV follows the structure the European Commission standardised and that public bodies, universities and many EU employers ask for by name: a labelled left gutter naming each block, personal details at the top, then work experience and education with the dates set apart from the detail. Languages get the treatment the format is known for — a mother-tongue row followed by a CEFR grid stating your level for understanding, speaking and writing separately, taken from the levels you have already recorded. It is set in the standard EU blue by default and is a plain single column underneath, so it parses as cleanly as any ATS template.',
  bestFor: [
    'Applications to EU institutions, agencies and public bodies',
    'Academic and research posts across Europe',
    'Anyone asked to "send a Europass" and given no other guidance',
  ],
  features: [
    'Labelled left gutter in the standard Europass structure',
    'CEFR self-assessment grid built from your recorded levels',
    'Mother tongue stated separately, as the format requires',
    'Standard EU blue accent, single column, parser-safe',
  ],
  keywords: [
    'europass cv template',
    'europass cv format',
    'european cv template',
    'eu cv template',
  ],
};

/** Width of the label gutter, in base em. The format's most recognisable feature. */
const GUTTER = '9.2em';

/**
 * The Europass form names each contact row rather than showing an icon, and the names it
 * uses are part of what makes the document recognisable as a Europass.
 */
const CONTACT_LABEL: Record<string, string> = {
  email: 'Email',
  phone: 'Telephone',
  location: 'Address',
  website: 'Website',
  linkedin: 'LinkedIn',
  github: 'GitHub',
};

/**
 * The three CEFR competences the Europass grid reports separately.
 *
 * The form asks for five (listening, reading, spoken interaction, spoken production,
 * writing) against a single stored level per language, and inventing five different values
 * from one would be fabricating a self-assessment on the candidate's behalf. Three columns
 * with the recorded level in each is the honest version of the same grid: it says what the
 * user actually told us, in the vocabulary the reader is expecting.
 */
const COMPETENCES = ['Understanding', 'Speaking', 'Writing'] as const;

function motherTongues(cv: CVData) {
  return cv.languages.filter((language) => language.name && language.level === 'native');
}
function otherLanguages(cv: CVData) {
  return cv.languages.filter((language) => language.name && language.level !== 'native');
}

/**
 * One labelled block: the gutter name on the left, the content on the right.
 *
 * Defined at module scope rather than inside the template. A component created during
 * render is a new type on every pass, so React unmounts and remounts the whole subtree
 * each time — which throws away the DOM the contrast tests measure and, in the editor,
 * makes every keystroke re-create every section.
 */
function Row({
  label,
  gutter,
  rule,
  accentText,
  spacing,
  weight,
  children,
}: {
  label: string;
  gutter: string;
  rule: string;
  accentText: string;
  spacing: number;
  weight: number;
  children: React.ReactNode;
}) {
  return (
    <section
      className="cv-section"
      style={{
        display: 'grid',
        gridTemplateColumns: `${gutter} 1fr`,
        gap: '0 1.3em',
        alignItems: 'start',
        borderTop: `1px solid ${rule}`,
        paddingTop: '0.7em',
        marginTop: `${spacing * 0.75}px`,
      }}
    >
      <h2
        className="cv-section-title"
        style={{ fontSize: '0.86em', fontWeight: weight, color: accentText, lineHeight: 1.35 }}
      >
        {label}
      </h2>
      <div style={{ minWidth: 0 }}>{children}</div>
    </section>
  );
}

/**
 * Europass — the European standard.
 *
 * Two things make this the Europass rather than "a CV with a label column". The gutter
 * carries the block names the format defines, and the language section is a grid rather
 * than a list. Everything else is a conventional single column, which is also true of the
 * official document.
 *
 * The languages block is rendered here instead of going through `SectionContent`, because
 * no shared variant should know about CEFR competence columns — that is a property of this
 * one format, not of the language section in general.
 */
export default function Europass({ cv, customization: c }: CVTemplateProps) {
  const accent = c.accentColor;
  const accentText = accentOn(accent);
  const muted = mutedOn(c.textColor, 0.34);
  const rule = tint(accent, 0.78);
  const sections = visibleSections(cv).filter((section) => section.id !== 'languages');
  const languageSection = visibleSections(cv).find((section) => section.id === 'languages');
  const name = fullName(cv);
  const contacts = contactEntries(cv);

  return (
    <div style={{ padding: `${c.pageMargin}px` }}>
      <header
        style={{
          display: 'grid',
          gridTemplateColumns: `${GUTTER} 1fr`,
          gap: '0 1.3em',
          alignItems: 'start',
        }}
      >
        <div
          style={{
            fontSize: '0.86em',
            fontWeight: bodyWeight(c, 700),
            color: accentText,
            lineHeight: 1.35,
          }}
        >
          Personal information
        </div>
        <div style={{ display: 'flex', gap: '1.2em', alignItems: 'flex-start', minWidth: 0 }}>
          <div style={{ minWidth: 0, flex: 1 }}>
            <h1
              style={{
                fontSize: '2.05em',
                lineHeight: 1.14,
                fontWeight: headingWeight(c, 600),
                color: c.secondaryColor,
              }}
            >
              {name || 'Your Name'}
            </h1>
            {cv.personal.title ? (
              <p style={{ marginTop: '0.1em', color: muted }}>{cv.personal.title}</p>
            ) : null}
            {contacts.length > 0 ? (
              <dl
                style={{
                  marginTop: '0.6em',
                  display: 'grid',
                  gridTemplateColumns: 'auto 1fr',
                  gap: '0.18em 0.7em',
                  fontSize: '0.9em',
                }}
              >
                {contacts.map((entry) => (
                  <div key={entry.key} style={{ display: 'contents' }}>
                    <dt style={{ color: muted, whiteSpace: 'nowrap' }}>
                      {CONTACT_LABEL[entry.key] ?? 'Link'}
                    </dt>
                    <dd style={{ color: c.textColor, minWidth: 0, overflowWrap: 'anywhere' }}>
                      {entry.label}
                    </dd>
                  </div>
                ))}
              </dl>
            ) : null}
          </div>
          <Photo cv={cv} c={c} size={96} border={rule} borderWidth={1} fallbackBackground={accent} />
        </div>
      </header>

      {sections.map((section) => (
        <Row
          key={section.id}
          label={section.label}
          gutter={GUTTER}
          rule={rule}
          accentText={accentText}
          spacing={c.sectionSpacing}
          weight={headingWeight(c, 700)}
        >
          <SectionContent
            sectionId={section.id}
            cv={cv}
            c={c}
            accent={accent}
            color={c.textColor}
            muted={muted}
            variants={{
              competencies: 'grouped',
              experience: 'stack',
              education: 'stack',
              projects: 'compact',
              certifications: 'compact',
              awards: 'compact',
              volunteer: 'compact',
              publications: 'compact',
              interests: 'inline',
              references: 'grid',
            }}
            skillDisplay="text"
          />
        </Row>
      ))}

      {languageSection ? (
        <Row
          label={languageSection.label}
          gutter={GUTTER}
          rule={rule}
          accentText={accentText}
          spacing={c.sectionSpacing}
          weight={headingWeight(c, 700)}
        >
          {motherTongues(cv).length > 0 ? (
            <p style={{ marginBottom: otherLanguages(cv).length > 0 ? '0.6em' : 0 }}>
              <span style={{ color: muted }}>Mother tongue: </span>
              <span style={{ fontWeight: bodyWeight(c, 700) }}>
                {motherTongues(cv)
                  .map((language) => language.name)
                  .join(', ')}
              </span>
            </p>
          ) : null}

          {otherLanguages(cv).length > 0 ? (
            <table
              style={{
                width: '100%',
                borderCollapse: 'collapse',
                fontSize: '0.9em',
                tableLayout: 'fixed',
              }}
            >
              <caption
                style={{
                  captionSide: 'top',
                  textAlign: 'left',
                  color: muted,
                  fontSize: '0.95em',
                  paddingBottom: '0.35em',
                }}
              >
                Other languages — Common European Framework of Reference levels
              </caption>
              <thead>
                <tr>
                  <th
                    scope="col"
                    style={{
                      textAlign: 'left',
                      fontWeight: bodyWeight(c, 700),
                      color: accentText,
                      borderBottom: `1px solid ${rule}`,
                      padding: '0.22em 0.5em 0.22em 0',
                    }}
                  >
                    Language
                  </th>
                  {COMPETENCES.map((competence) => (
                    <th
                      key={competence}
                      scope="col"
                      style={{
                        textAlign: 'left',
                        fontWeight: bodyWeight(c, 700),
                        color: accentText,
                        borderBottom: `1px solid ${rule}`,
                        padding: '0.22em 0.5em',
                      }}
                    >
                      {competence}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {otherLanguages(cv).map((language) => (
                  <tr key={language.id}>
                    <th
                      scope="row"
                      style={{
                        textAlign: 'left',
                        fontWeight: bodyWeight(c, 700),
                        color: c.textColor,
                        borderBottom: `1px solid ${tint(accent, 0.9)}`,
                        padding: '0.22em 0.5em 0.22em 0',
                      }}
                    >
                      {language.name}
                    </th>
                    {COMPETENCES.map((competence) => (
                      <td
                        key={competence}
                        style={{
                          color: c.textColor,
                          borderBottom: `1px solid ${tint(accent, 0.9)}`,
                          padding: '0.22em 0.5em',
                        }}
                      >
                        {languageShort(language.level)}
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          ) : null}
        </Row>
      ) : null}
    </div>
  );
}
