import { ContactList, Photo, SectionContent } from '@/components/cv/parts';
import { fullName, headingTracking, headingTransform, tint } from '@/lib/cv/format';
import { visibleSections } from '@/lib/cv/sections';
import type { CVTemplateProps, TemplateMeta } from '@/types/cv';

export const meta: TemplateMeta = {
  id: 'modern-01',
  slug: 'modern-professional',
  name: 'Modern Professional',
  category: 'modern',
  premium: false,
  atsScore: 5,
  columns: 1,
  hasPhoto: true,
  accentDefault: '#1f3af5',
  tagline: 'A tinted header band over a clean single column — the safest modern choice.',
  description:
    'Modern Professional pairs a soft accent header with an uncluttered single-column body, so the design reads as contemporary without introducing anything an applicant tracking system can trip over. Contact details sit beside your name at the top where recruiters look first, and every section heading is separated by a thin accent rule that guides the eye down the page.',
  bestFor: [
    'Professionals with 2–15 years of experience',
    'Anyone applying through an online portal',
    'Career changers who need experience to lead',
  ],
  features: [
    'Single-column, parser-safe body',
    'Tinted header band with optional photo',
    'Accent rule section headings',
    'Two-column skills grid',
  ],
  keywords: [
    'modern cv template',
    'professional cv template',
    'modern resume template',
    'ats friendly modern cv',
  ],
};

/**
 * Modern Professional — the reference implementation every other template mirrors.
 *
 * Structure: full-bleed accent header band, single column body, section headings with a
 * short accent rule. Reads well on screen and survives ATS parsing because the body is a
 * plain single-column flow.
 */
export default function ModernProfessional({ cv, customization: c }: CVTemplateProps) {
  const accent = c.accentColor;
  const sections = visibleSections(cv);
  const name = fullName(cv);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', minHeight: 'inherit' }}>
      <header
        style={{
          background: tint(accent, 0.92),
          borderBottom: `3px solid ${accent}`,
          padding: `${c.pageMargin * 0.72}px ${c.pageMargin}px`,
          display: 'flex',
          alignItems: 'center',
          gap: '1.4em',
        }}
      >
        <Photo cv={cv} c={c} size={92} border="#ffffff" fallbackBackground={accent} />
        <div style={{ minWidth: 0, flex: 1 }}>
          <h1
            style={{
              fontSize: '2.35em',
              lineHeight: 1.08,
              fontWeight: 800,
              color: c.secondaryColor,
              letterSpacing: '-0.015em',
            }}
          >
            {name || 'Your Name'}
          </h1>
          {cv.personal.title ? (
            <p
              style={{
                fontSize: '1.14em',
                color: accent,
                fontWeight: 600,
                marginTop: '0.15em',
              }}
            >
              {cv.personal.title}
            </p>
          ) : null}
          <div style={{ marginTop: '0.7em' }}>
            <ContactList
              cv={cv}
              accent={accent}
              color={c.textColor}
              icons={c.showIcons}
              layout="inline"
              gap="0.55em 1.1em"
            />
          </div>
        </div>
      </header>

      <main
        style={{
          padding: `${c.pageMargin * 0.78}px ${c.pageMargin}px ${c.pageMargin}px`,
          flex: 1,
        }}
      >
        {sections.map((section, index) => (
          <section
            key={section.id}
            className="cv-section"
            style={{ marginTop: index === 0 ? 0 : `${c.sectionSpacing}px` }}
          >
            <h2
              className="cv-section-title"
              style={{
                fontSize: '0.98em',
                fontWeight: 800,
                textTransform: headingTransform(c),
                letterSpacing: headingTracking(c),
                color: c.secondaryColor,
                display: 'flex',
                alignItems: 'center',
                gap: '0.6em',
                marginBottom: '0.6em',
              }}
            >
              {section.label}
              <span
                aria-hidden
                style={{ flex: 1, height: 2, background: tint(accent, 0.7), borderRadius: 2 }}
              />
            </h2>
            <SectionContent
              sectionId={section.id}
              cv={cv}
              c={c}
              accent={accent}
              color={c.textColor}
              variants={{
                experience: 'stack',
                education: 'stack',
                projects: 'stack',
                languages: 'grid',
                interests: 'inline',
                references: 'grid',
              }}
              skillColumns={2}
            />
          </section>
        ))}
      </main>
    </div>
  );
}
