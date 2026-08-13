import { ContactList, Photo, SectionContent } from '@/components/cv/parts';
import { fullName, headingTracking, headingTransform, tint } from '@/lib/cv/format';
import { visibleSections } from '@/lib/cv/sections';
import type { CVTemplateProps, TemplateMeta } from '@/types/cv';

export const meta: TemplateMeta = {
  id: 'modern-08',
  slug: 'modern-elegant',
  name: 'Modern Elegant',
  category: 'modern',
  premium: true,
  atsScore: 4,
  columns: 1,
  hasPhoto: true,
  accentDefault: '#a1662f',
  tagline: 'A centred masthead between double rules, with rule-flanked section headings.',
  description:
    'Modern Elegant centres the whole document: an optional portrait above your name, thin double rules framing it, a letterspaced title beneath and contact details on one centred line. Section headings sit in the middle of the measure flanked by short accent rules, giving the page an editorial rhythm that suits a hospitality, communications or client-facing CV. Experience and education keep their dates in a left gutter, so the centred styling never costs you scannability.',
  bestFor: [
    'Hospitality, luxury retail and events professionals',
    'Communications, PR and editorial roles',
    'Senior candidates who want a formal document',
  ],
  features: [
    'Centred masthead framed by double rules',
    'Optional circular portrait above the name',
    'Rule-flanked centred section headings',
    'Date-gutter experience and education',
  ],
  keywords: [
    'elegant cv template',
    'formal cv template',
    'centred cv template',
    'editorial resume template',
  ],
};

/**
 * Modern Elegant — centred, editorial.
 *
 * The masthead is framed by 3px `double` borders (the smallest width at which Chromium
 * actually renders two hairlines) and every section heading is centred between short accent
 * rules. Entry bodies stay left-aligned in a date gutter so the document remains scannable.
 */
export default function ModernElegant({ cv, customization: c }: CVTemplateProps) {
  const accent = c.accentColor;
  const muted = tint(c.textColor, 0.38);
  const frame = tint(accent, 0.45);
  const sections = visibleSections(cv);
  const name = fullName(cv);

  return (
    <div style={{ padding: `${c.pageMargin * 1.05}px ${c.pageMargin}px ${c.pageMargin}px` }}>
      <header style={{ textAlign: 'center' }}>
        {c.showPhoto ? (
          <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '1em' }}>
            <Photo cv={cv} c={c} size={104} border={frame} borderWidth={2} fallbackBackground={accent} />
          </div>
        ) : null}

        <div
          style={{
            borderTop: `3px double ${frame}`,
            borderBottom: `3px double ${frame}`,
            padding: '0.7em 0 0.75em',
          }}
        >
          <h1
            style={{
              fontSize: '2.6em',
              lineHeight: 1.1,
              fontWeight: 500,
              letterSpacing: '0.03em',
              color: c.secondaryColor,
            }}
          >
            {name || 'Your Name'}
          </h1>
          {cv.personal.title ? (
            <p
              style={{
                marginTop: '0.55em',
                fontSize: '0.86em',
                fontWeight: 600,
                letterSpacing: '0.28em',
                textTransform: 'uppercase',
                color: accent,
              }}
            >
              {cv.personal.title}
            </p>
          ) : null}
        </div>

        <div style={{ marginTop: '0.85em', display: 'flex', justifyContent: 'center' }}>
          <ContactList
            cv={cv}
            accent={accent}
            color={muted}
            icons={c.showIcons}
            layout="inline"
            gap="0.4em 1.05em"
            separator="  ·  "
            fontSize="0.9em"
          />
        </div>
      </header>

      {sections.map((section) => (
        <section
          key={section.id}
          className="cv-section"
          style={{ marginTop: `${c.sectionSpacing * 1.45}px` }}
        >
          <h2
            className="cv-section-title"
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '0.8em',
              fontSize: '0.95em',
              fontWeight: 600,
              textTransform: headingTransform(c),
              letterSpacing: headingTracking(c),
              color: c.secondaryColor,
              marginBottom: '0.7em',
            }}
          >
            <span aria-hidden style={{ width: '2.4em', height: 1, background: frame, flexShrink: 0 }} />
            {section.label}
            <span aria-hidden style={{ width: '2.4em', height: 1, background: frame, flexShrink: 0 }} />
          </h2>

          <SectionContent
            sectionId={section.id}
            cv={cv}
            c={c}
            accent={accent}
            color={c.textColor}
            muted={muted}
            rule={tint(c.textColor, 0.72)}
            variants={{
              experience: 'two-col',
              education: 'two-col',
              projects: 'stack',
              languages: 'grid',
              interests: 'inline',
              certifications: 'compact',
              awards: 'compact',
              references: 'grid',
            }}
            skillColumns={2}
          />
        </section>
      ))}
    </div>
  );
}
