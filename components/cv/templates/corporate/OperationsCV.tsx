import { ContactList, SectionContent } from '@/components/cv/parts';
import {
  fullName,
  headingTracking,
  headingTransform,
  readableOn,
  tint,
} from '@/lib/cv/format';
import { visibleSections } from '@/lib/cv/sections';
import type { CVTemplateProps, TemplateMeta } from '@/types/cv';

export const meta: TemplateMeta = {
  id: 'corporate-10',
  slug: 'operations-cv',
  name: 'Operations CV',
  category: 'corporate',
  premium: true,
  atsScore: 5,
  columns: 1,
  hasPhoto: false,
  accentDefault: '#334155',
  tagline: 'Numbered accent squares turn the document into an ordered sequence of steps.',
  description:
    'Operations CV numbers every section with a filled accent square, so the page reads as an ordered process rather than a stack of unrelated headings. Experience and education both use a left date gutter, keeping the timeline in one narrow column and the substance in another — which helps when roles overlap or run across sites and shift patterns. Skills print as plain text flowed into three columns, fitting a long list of systems, methodologies and equipment into a few lines instead of a page.',
  bestFor: [
    'Operations and supply chain managers',
    'Logistics, warehouse and production leads',
    'Continuous improvement and quality specialists',
  ],
  features: [
    'Numbered accent square on every section heading',
    'Double rule beneath the header block',
    'Left date gutter for roles and qualifications',
    'Three-column plain-text skills list',
  ],
  keywords: [
    'operations manager cv template',
    'supply chain cv template',
    'logistics resume template',
    'process improvement cv',
  ],
};

/**
 * Operations CV — process grid.
 *
 * Sections are numbered from the resolved order returned by `visibleSections`, so the
 * sequence always matches whatever order the author arranged in the editor. Skills flow
 * through a three-column multi-column box; text still reflows across a page break because
 * nothing here clips its overflow.
 */
export default function OperationsCV({ cv, customization: c }: CVTemplateProps) {
  const accent = c.accentColor;
  const onAccent = readableOn(accent);
  const sections = visibleSections(cv);
  const name = fullName(cv);

  return (
    <div style={{ padding: c.pageMargin }}>
      <header>
        {cv.personal.title ? (
          <p
            style={{
              fontSize: '0.78em',
              fontWeight: 700,
              color: accent,
              textTransform: 'uppercase',
              letterSpacing: '0.18em',
              marginBottom: '0.35em',
            }}
          >
            {cv.personal.title}
          </p>
        ) : null}
        <h1
          style={{
            fontSize: '2.15em',
            lineHeight: 1.08,
            fontWeight: 700,
            color: c.secondaryColor,
            letterSpacing: '-0.012em',
          }}
        >
          {name || 'Your Name'}
        </h1>
        <div style={{ marginTop: '0.6em' }}>
          <ContactList
            cv={cv}
            accent={accent}
            color={c.textColor}
            icons={c.showIcons}
            layout="inline"
            gap="0.4em 1.2em"
            fontSize="0.88em"
          />
        </div>
        <span
          aria-hidden
          style={{ display: 'block', height: 2, background: accent, marginTop: '0.75em' }}
        />
        <span
          aria-hidden
          style={{ display: 'block', height: 1, background: tint(accent, 0.6), marginTop: 2 }}
        />
      </header>

      <main>
        {sections.map((section, index) => (
          <section
            key={section.id}
            className="cv-section"
            style={{ marginTop: index === 0 ? c.sectionSpacing * 0.9 : c.sectionSpacing }}
          >
            <h2
              className="cv-section-title"
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '0.6em',
                marginBottom: '0.6em',
                fontSize: '0.95em',
                fontWeight: 700,
                color: c.secondaryColor,
                textTransform: headingTransform(c),
                letterSpacing: headingTracking(c),
              }}
            >
              <span
                aria-hidden
                style={{
                  width: '1.5em',
                  height: '1.5em',
                  flexShrink: 0,
                  background: accent,
                  color: onAccent,
                  borderRadius: 2,
                  display: 'inline-flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: '0.8em',
                  fontWeight: 700,
                  letterSpacing: '0.02em',
                }}
              >
                {String(index + 1).padStart(2, '0')}
              </span>
              {section.label}
            </h2>

            <div
              style={
                section.id === 'skills' ? { columnCount: 3, columnGap: '1.5em' } : undefined
              }
            >
              <SectionContent
                sectionId={section.id}
                cv={cv}
                c={c}
                accent={accent}
                color={c.textColor}
                muted="#5a6472"
                variants={{
                  experience: 'two-col',
                  education: 'two-col',
                  projects: 'stack',
                  certifications: 'compact',
                  awards: 'compact',
                  volunteer: 'compact',
                  languages: 'grid',
                  interests: 'inline',
                  references: 'grid',
                }}
                skillDisplay="text"
              />
            </div>
          </section>
        ))}
      </main>
    </div>
  );
}
