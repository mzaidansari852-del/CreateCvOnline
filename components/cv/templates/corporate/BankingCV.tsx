import { ContactList, SectionContent } from '@/components/cv/parts';
import {
  mutedOn,
  fullName,
  headingTracking,
  headingTransform,
  readableOn,
  tint,
} from '@/lib/cv/format';
import { splitSections, visibleSections } from '@/lib/cv/sections';
import type { CVCustomization, CVTemplateProps, TemplateMeta } from '@/types/cv';

export const meta: TemplateMeta = {
  id: 'corporate-06',
  slug: 'banking-cv',
  name: 'Banking CV',
  category: 'corporate',
  premium: true,
  atsScore: 4,
  columns: 2,
  hasPhoto: false,
  accentDefault: '#0b2545',
  tagline: 'A navy masthead over a 68/32 split — credentials right, deal history left.',
  description:
    'Banking CV opens with a solid navy masthead that reverses your name and one centred contact row out of the colour, then drops straight into a 68/32 body divided by a hairline rule. Skills, certifications and languages sit in the narrow right column so a hiring manager can check regulatory credentials at a glance, leaving the wide column entirely for coverage and transaction history. The colour band is confined to the top of the first page, so later pages stay plain white and print without a solid ink block.',
  bestFor: [
    'Investment and corporate banking analysts',
    'Risk, compliance and credit professionals',
    'Candidates with licences to display prominently',
  ],
  features: [
    'Reversed-out masthead with centred contact row',
    '68 / 32 body split by a hairline rule',
    'Credential column for skills, certifications and languages',
    'Colour limited to page one for cheaper printing',
  ],
  keywords: [
    'banking cv template',
    'investment banking resume template',
    'two column banking cv',
    'compliance cv template',
  ],
};

const SIDEBAR_SECTIONS = ['skills', 'certifications', 'languages'];

/**
 * Banking CV — masthead over a split body.
 *
 * Unlike a full-height sidebar template there is no `pageBackground`: the band belongs to
 * the top of the document only. The hairline between the columns comes from the aside's
 * left border, which stretches to the height of the taller column.
 */
export default function BankingCV({ cv, customization: c }: CVTemplateProps) {
  const accent = c.accentColor;
  const onBand = readableOn(accent);
  // Dimmed toward the band and then measured, rather than a fixed alpha over whatever
  // colour the user picked — see `mutedOn`.
  const bandMuted = mutedOn(onBand, 0.3, accent);
  const hairline = tint(c.secondaryColor, 0.82);
  const sections = visibleSections(cv);
  const { main, aside } = splitSections(sections, SIDEBAR_SECTIONS);
  const hasAside = aside.length > 0;
  const name = fullName(cv);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', minHeight: 'inherit' }}>
      <header
        style={{
          background: accent,
          color: onBand,
          padding: `${c.pageMargin * 0.66}px ${c.pageMargin}px`,
          textAlign: 'center',
        }}
      >
        <h1
          style={{
            fontSize: '2.1em',
            lineHeight: 1.1,
            fontWeight: 700,
            color: onBand,
            letterSpacing: '0.02em',
          }}
        >
          {name || 'Your Name'}
        </h1>
        {cv.personal.title ? (
          <p
            style={{
              marginTop: '0.3em',
              fontSize: '0.92em',
              fontWeight: 600,
              color: bandMuted,
              textTransform: 'uppercase',
              letterSpacing: '0.16em',
            }}
          >
            {cv.personal.title}
          </p>
        ) : null}
        <div style={{ display: 'flex', justifyContent: 'center', marginTop: '0.75em' }}>
          <ContactList
            cv={cv}
            accent={accent}
            surface={accent}
            color={bandMuted}
            icons={c.showIcons}
            layout="inline"
            iconColor={bandMuted}
            gap="0.35em 1.15em"
            fontSize="0.86em"
          />
        </div>
      </header>

      <div
        style={{
          flex: 1,
          display: 'grid',
          gridTemplateColumns: hasAside ? 'minmax(0, 68fr) minmax(0, 32fr)' : 'minmax(0, 1fr)',
          columnGap: '1.5em',
          padding: `${c.pageMargin * 0.78}px ${c.pageMargin}px ${c.pageMargin}px`,
        }}
      >
        <div style={{ minWidth: 0 }}>
          {main.map((section, index) => (
            <section
              key={section.id}
              className="cv-section"
              style={{ marginTop: index === 0 ? 0 : c.sectionSpacing }}
            >
              <BankingHeading label={section.label} accent={accent} c={c} />
              <SectionContent
                sectionId={section.id}
                cv={cv}
                c={c}
                accent={accent}
                color={c.textColor}
                muted="#55606e"
                variants={{
                  experience: 'stack',
                  education: 'stack',
                  projects: 'stack',
                  volunteer: 'stack',
                  publications: 'stack',
                  awards: 'stack',
                  interests: 'inline',
                  references: 'stack',
                }}
              />
            </section>
          ))}
        </div>

        {hasAside ? (
          <div
            style={{
              minWidth: 0,
              borderLeft: `1px solid ${hairline}`,
              paddingLeft: '1.5em',
            }}
          >
            {aside.map((section, index) => (
              <section
                key={section.id}
                className="cv-section"
                style={{ marginTop: index === 0 ? 0 : c.sectionSpacing }}
              >
                <BankingHeading label={section.label} accent={accent} c={c} />
                <SectionContent
                  sectionId={section.id}
                  cv={cv}
                  c={c}
                  accent={accent}
                  color={c.textColor}
                  muted="#55606e"
                  variants={{ certifications: 'compact', languages: 'stack' }}
                  skillColumns={1}
                />
              </section>
            ))}
          </div>
        ) : null}
      </div>
    </div>
  );
}

/** Bold dark label with a short accent underline. */
function BankingHeading({
  label,
  accent,
  c,
}: {
  label: string;
  accent: string;
  c: CVCustomization;
}) {
  return (
    <h2
      className="cv-section-title"
      style={{
        fontSize: '0.95em',
        fontWeight: 800,
        color: c.secondaryColor,
        textTransform: headingTransform(c),
        letterSpacing: headingTracking(c),
        marginBottom: '0.55em',
      }}
    >
      {label}
      <span
        aria-hidden
        style={{
          display: 'block',
          width: '1.6em',
          height: 2.5,
          background: accent,
          marginTop: '0.3em',
        }}
      />
    </h2>
  );
}
