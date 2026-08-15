import { ContactList, SectionContent } from '@/components/cv/parts';
import {
  accentOn,
  bodyWeight,
  fullName,
  headingTracking,
  headingTransform,
  headingWeight,
  mutedOn,
  readableOn,
  tint,
} from '@/lib/cv/format';
import { splitSections, visibleSections } from '@/lib/cv/sections';
import type { CVCustomization, CVTemplateProps, TemplateMeta } from '@/types/cv';

export const meta: TemplateMeta = {
  id: 'tech-03',
  slug: 'full-stack-developer-cv',
  name: 'Full Stack Developer',
  category: 'technology',
  premium: true,
  atsScore: 4,
  columns: 2,
  hasPhoto: false,
  accentDefault: '#0891b2',
  fonts: { heading: 'inter', body: 'inter' },
  metrics: { lineHeight: 1.36, pageMargin: 36 },
  tagline: 'Your stack across the top, then employment on the left and projects on the right.',
  description:
    'Full Stack Developer opens with a rail of your first eight technologies directly beneath your name, so the stack is read before a single line of prose. Underneath, the page splits: employment history runs down a wide left column under filled accent tabs, while projects, education and the shorter sections sit in a narrower right column under outlined tabs of the same shape. The two tab styles make it obvious at a glance which column is your job history and which is supporting evidence.',
  bestFor: [
    'Full stack and web developers',
    'Engineers with substantial side or open-source projects',
    'Applications where the tech stack decides the shortlist',
  ],
  features: [
    'Eight-chip technology rail under the header',
    'Wide experience column beside a narrow projects column',
    'Filled and outlined tab headings separate the two columns',
    'Timeline layout for employment history',
  ],
  keywords: [
    'full stack developer cv template',
    'software engineer cv template',
    'developer resume template',
    'tech cv template with projects',
  ],
};

/** Only employment history occupies the wide left column; everything else goes right. */
const LEFT_COLUMN_SECTIONS = ['experience'];
/** How many skills the header rail shows before the full skills section takes over. */
const STACK_RAIL_LIMIT = 8;

/**
 * Full Stack Developer — split-stack layout.
 *
 * The header is full width so the technology rail can run edge to edge underneath it; the
 * body below is the only two-column part of the document. Left and right columns are told
 * apart by their heading chrome rather than by a divider, which keeps the gutter clean when
 * one column runs onto a second page.
 */
export default function FullStackDeveloper({ cv, customization: c }: CVTemplateProps) {
  const accent = c.accentColor;
  const accentText = accentOn(accent);
  const muted = mutedOn(c.textColor, 0.4);
  const sections = visibleSections(cv);
  const { main: right, aside: left } = splitSections(sections, LEFT_COLUMN_SECTIONS);
  const stack = cv.skills.filter((skill) => skill.name).slice(0, STACK_RAIL_LIMIT);
  const name = fullName(cv);
  const twoColumns = left.length > 0 && right.length > 0;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', minHeight: 'inherit' }}>
      <header
        style={{
          padding: `${c.pageMargin}px ${c.pageMargin}px ${c.pageMargin * 0.6}px`,
        }}
      >
        <h1
          style={{
            fontSize: '2.55em',
            lineHeight: 1.08,
            fontWeight: headingWeight(c, 500),
            letterSpacing: '-0.02em',
            color: c.secondaryColor,
          }}
        >
          {name || 'Your Name'}
        </h1>

        {cv.personal.title ? (
          <p
            style={{
              marginTop: '0.2em',
              fontSize: '1.08em',
              fontWeight: bodyWeight(c, 600),
              color: accentText,
            }}
          >
            {cv.personal.title}
          </p>
        ) : null}

        <div style={{ marginTop: '0.7em' }}>
          <ContactList
            cv={cv}
            accent={accent}
            color={muted}
            icons={c.showIcons}
            layout="inline"
            gap="0.35em 1.15em"
            fontSize="0.92em"
          />
        </div>
      </header>

      {stack.length > 0 ? (
        <div
          style={{
            background: tint(accent, 0.93),
            borderTop: `1px solid ${tint(accent, 0.7)}`,
            borderBottom: `1px solid ${tint(accent, 0.7)}`,
            padding: `0.5em ${c.pageMargin}px`,
            display: 'flex',
            flexWrap: 'wrap',
            gap: '0.35em',
          }}
        >
          {stack.map((skill) => (
            <span
              key={skill.id}
              style={{
                fontSize: '0.8em',
                fontWeight: bodyWeight(c, 600),
                lineHeight: 1.7,
                padding: '0 0.55em',
                borderRadius: 3,
                background: '#ffffff',
                border: `1px solid ${tint(accent, 0.55)}`,
                color: accentText,
                whiteSpace: 'nowrap',
              }}
            >
              {skill.name}
            </span>
          ))}
        </div>
      ) : null}

      <div
        style={{
          flex: 1,
          padding: `${c.pageMargin * 0.8}px ${c.pageMargin}px ${c.pageMargin}px`,
          display: 'grid',
          gridTemplateColumns: twoColumns ? '1.55fr 1fr' : '1fr',
          columnGap: '1.9em',
          alignItems: 'start',
        }}
      >
        {left.length > 0 ? (
          <div style={{ minWidth: 0 }}>
            {left.map((section, index) => (
              <section
                key={section.id}
                className="cv-section"
                style={{ marginTop: index === 0 ? 0 : `${c.sectionSpacing}px` }}
              >
                <SectionTab label={section.label} accent={accent} c={c} filled />
                {/* Block wrapper: the tab is inline-block, so an inline body (tags, a
                    one-line interests list) would otherwise sit beside it. */}
                <div>
                  <SectionContent
                    sectionId={section.id}
                    cv={cv}
                    c={c}
                    accent={accent}
                    color={c.textColor}
                    muted={muted}
                    variants={{ experience: 'timeline' }}
                  />
                </div>
              </section>
            ))}
          </div>
        ) : null}

        {right.length > 0 ? (
          <div style={{ minWidth: 0 }}>
            {right.map((section, index) => (
              <section
                key={section.id}
                className="cv-section"
                style={{ marginTop: index === 0 ? 0 : `${c.sectionSpacing}px` }}
              >
                <SectionTab label={section.label} accent={accent} c={c} filled={false} />
                <div>
                  <SectionContent
                    sectionId={section.id}
                    cv={cv}
                    c={c}
                    accent={accent}
                    color={c.textColor}
                    muted={muted}
                    variants={{
                      education: 'compact',
                      projects: 'compact',
                      certifications: 'compact',
                      awards: 'compact',
                      volunteer: 'compact',
                      publications: 'compact',
                      languages: 'stack',
                      interests: 'inline',
                      references: 'stack',
                    }}
                    skillColumns={1}
                    gap={0.85}
                  />
                </div>
              </section>
            ))}
          </div>
        ) : null}
      </div>
    </div>
  );
}

/**
 * Section heading shared by both columns: the same rounded tab, filled in the employment
 * column and outlined in the supporting column.
 */
function SectionTab({
  label,
  accent,
  c,
  filled,
}: {
  label: string;
  accent: string;
  c: CVCustomization;
  filled: boolean;
}) {
  return (
    <h2
      className="cv-section-title"
      style={{
        display: 'inline-block',
        fontSize: '0.82em',
        fontWeight: headingWeight(c, 700),
        lineHeight: 1.5,
        textTransform: headingTransform(c),
        letterSpacing: headingTracking(c),
        padding: '0.12em 0.7em',
        borderRadius: 4,
        marginBottom: '0.7em',
        background: filled ? accent : 'transparent',
        border: `1.5px solid ${filled ? accent : tint(accent, 0.45)}`,
        // Filled: measured against the accent itself. Unfilled: against the page, where a
        // mid-tone cyan was setting every section heading at 3.68:1.
        color: filled ? readableOn(accent) : accentOn(accent),
      }}
    >
      {label}
    </h2>
  );
}
