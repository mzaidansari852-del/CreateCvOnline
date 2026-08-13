import { ContactList, Photo, SectionContent } from '@/components/cv/parts';
import {
  fullName,
  headingTracking,
  headingTransform,
  readableOn,
  shade,
  tint,
} from '@/lib/cv/format';
import { splitSections, visibleSections } from '@/lib/cv/sections';
import type { CVCustomization, CVTemplateProps, TemplateMeta } from '@/types/cv';

export const meta: TemplateMeta = {
  id: 'modern-04',
  slug: 'modern-corporate',
  name: 'Modern Corporate',
  category: 'modern',
  premium: true,
  atsScore: 4,
  columns: 2,
  hasPhoto: true,
  accentDefault: '#0f4c81',
  tagline: 'A dark masthead over a hairline-split body — structure without a coloured sidebar.',
  description:
    'Modern Corporate opens with a full-width dark band carrying your name, title, a two-column contact grid and an optional photo, then drops into a body split 63/37 by nothing more than a hairline rule — there is no coloured sidebar competing with the text. Dates sit in their own gutter beside every role and degree, so a reader follows the chronology in a single vertical scan while skills, languages, certifications and awards stay parked on the right. Because only the masthead is filled, the document still prints economically.',
  bestFor: [
    'Finance, consulting and legal applicants',
    'Managers presenting a long, dated career',
    'Internal promotion and secondment applications',
  ],
  features: [
    'Full-width dark header with contact grid',
    'Hairline-divided 63/37 body, no colour block',
    'Date-gutter experience and education',
    'Skills, languages and credentials in the aside',
    'Accent square section markers',
  ],
  keywords: [
    'corporate cv template',
    'two column cv template',
    'business resume template',
    'consulting cv template',
  ],
};

const ASIDE_SECTIONS = ['skills', 'languages', 'certifications', 'awards'];

/**
 * Modern Corporate — dark masthead, then a two-column body separated only by a rule.
 *
 * The aside is transparent by design: a filled sidebar would drag the eye away from the
 * chronology, which is the thing a corporate reader is actually scanning for. Everything
 * reversed out on the band goes through `readableOn` so a light secondary colour stays legible.
 */
export default function ModernCorporate({ cv, customization: c }: CVTemplateProps) {
  const accent = c.accentColor;
  const band = c.secondaryColor;
  const onBand = readableOn(band);
  const reversed = onBand === '#ffffff';
  const bandAccent = reversed ? tint(accent, 0.55) : shade(accent, 0.2);
  const bandMuted = reversed ? 'rgba(255,255,255,0.78)' : 'rgba(0,0,0,0.62)';
  const hairline = tint(c.textColor, 0.78);
  const gutter = c.pageMargin * 0.6;
  const topPad = c.pageMargin * 0.72;

  const sections = visibleSections(cv);
  const { main, aside } = splitSections(sections, ASIDE_SECTIONS);
  const name = fullName(cv);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', minHeight: 'inherit' }}>
      {/* ------------------------------------------------------------ masthead */}
      <header
        style={{
          background: band,
          color: onBand,
          padding: `${topPad}px ${c.pageMargin}px`,
          display: 'flex',
          alignItems: 'center',
          gap: '1.5em',
        }}
      >
        <div style={{ flex: 1, minWidth: 0 }}>
          <h1
            style={{
              fontSize: '2.1em',
              lineHeight: 1.1,
              fontWeight: 700,
              letterSpacing: '0.005em',
              color: onBand,
            }}
          >
            {name || 'Your Name'}
          </h1>
          {cv.personal.title ? (
            <p
              style={{
                marginTop: '0.25em',
                fontSize: '1.02em',
                fontWeight: 600,
                letterSpacing: '0.06em',
                textTransform: 'uppercase',
                color: bandAccent,
              }}
            >
              {cv.personal.title}
            </p>
          ) : null}
          <div style={{ marginTop: '0.9em', maxWidth: '32em' }}>
            <ContactList
              cv={cv}
              accent={bandAccent}
              color={bandMuted}
              icons={c.showIcons}
              iconColor={bandAccent}
              layout="grid"
              fontSize="0.9em"
            />
          </div>
        </div>

        <Photo cv={cv} c={c} size={98} border={bandAccent} borderWidth={2} fallbackBackground={accent} />
      </header>

      {/* ---------------------------------------------------------------- body */}
      <div style={{ display: 'grid', gridTemplateColumns: '63% 37%', flex: 1 }}>
        <main
          style={{
            padding: `${topPad}px ${gutter}px ${c.pageMargin}px ${c.pageMargin}px`,
            minWidth: 0,
          }}
        >
          {main.map((section, index) => (
            <section
              key={section.id}
              className="cv-section"
              style={{ marginTop: index === 0 ? 0 : `${c.sectionSpacing}px` }}
            >
              <SectionHeading label={section.label} accent={accent} color={c.secondaryColor} c={c} />
              <SectionContent
                sectionId={section.id}
                cv={cv}
                c={c}
                accent={accent}
                color={c.textColor}
                rule={hairline}
                variants={{
                  experience: 'two-col',
                  education: 'two-col',
                  projects: 'stack',
                  volunteer: 'stack',
                  publications: 'stack',
                  interests: 'inline',
                  references: 'grid',
                }}
              />
            </section>
          ))}
        </main>

        <aside
          style={{
            borderLeft: `1px solid ${hairline}`,
            padding: `${topPad}px ${c.pageMargin}px ${c.pageMargin}px ${gutter}px`,
            minWidth: 0,
          }}
        >
          {aside.map((section, index) => (
            <section
              key={section.id}
              className="cv-section"
              style={{ marginTop: index === 0 ? 0 : `${c.sectionSpacing}px` }}
            >
              <SectionHeading label={section.label} accent={accent} color={c.secondaryColor} c={c} />
              <SectionContent
                sectionId={section.id}
                cv={cv}
                c={c}
                accent={accent}
                color={c.textColor}
                rule={hairline}
                variants={{ certifications: 'compact', awards: 'compact', languages: 'stack' }}
                skillColumns={1}
              />
            </section>
          ))}
        </aside>
      </div>
    </div>
  );
}

function SectionHeading({
  label,
  accent,
  color,
  c,
}: {
  label: string;
  accent: string;
  color: string;
  c: CVCustomization;
}) {
  return (
    <h2
      className="cv-section-title"
      style={{
        display: 'flex',
        alignItems: 'center',
        gap: '0.55em',
        fontSize: '0.9em',
        fontWeight: 700,
        textTransform: headingTransform(c),
        letterSpacing: headingTracking(c),
        color,
        marginBottom: '0.6em',
      }}
    >
      <span
        aria-hidden
        style={{ width: '0.5em', height: '0.5em', background: accent, flexShrink: 0 }}
      />
      {label}
    </h2>
  );
}
