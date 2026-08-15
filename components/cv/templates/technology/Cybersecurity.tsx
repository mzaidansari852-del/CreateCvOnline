import { ContactIcon, SectionContent, contactEntries } from '@/components/cv/parts';
import {
  accentOn,
  fullName,
  headingTracking,
  headingTransform,
  headingWeight,
  mutedOn,
  readableOn,
  shade,
} from '@/lib/cv/format';
import { splitSections, visibleSections } from '@/lib/cv/sections';
import type { CVCustomization, CVTemplateProps, TemplateMeta } from '@/types/cv';

export const meta: TemplateMeta = {
  id: 'tech-06',
  slug: 'cybersecurity-cv',
  name: 'Cybersecurity CV',
  category: 'technology',
  premium: true,
  atsScore: 4,
  columns: 2,
  hasPhoto: false,
  accentDefault: '#22c55e',
  fonts: { heading: 'ibm-plex-sans', body: 'roboto' },
  metrics: { lineHeight: 1.42, pageMargin: 44 },
  tagline: 'A dark banner and a monospaced contact block over a certification-first sidebar.',
  description:
    'Cybersecurity CV reverses your name out of a solid dark banner and sets the contact details beneath it as a monospaced key–value block, the shape security teams read all day. The body splits 70/30 with certifications at the very top of the narrow column, because the CISSP, OSCP or CISM line is usually what decides whether the rest of the page gets read. Skills and languages follow underneath as tags, leaving the wide column free for incident, audit and engineering detail.',
  bestFor: [
    'Security analysts and SOC engineers',
    'Penetration testers and red team operators',
    'Certification-heavy security and GRC professionals',
  ],
  features: [
    'Solid dark banner with the name reversed out',
    'Monospaced key–value contact grid',
    'Certifications lead the narrow column',
    'Accent-bordered section headings',
  ],
  keywords: [
    'cyber security cv template',
    'information security resume template',
    'penetration tester cv',
    'security analyst cv template',
  ],
};

/** The narrow column, in the order it renders regardless of the author's section order. */
const ASIDE_SECTIONS = ['certifications', 'skills', 'languages'];

const MONO = "ui-monospace, SFMono-Regular, Menlo, Consolas, 'Liberation Mono', monospace";

const CONTACT_LABELS: Record<string, string> = {
  email: 'Email',
  phone: 'Phone',
  location: 'Location',
  website: 'Web',
  linkedin: 'LinkedIn',
  github: 'GitHub',
};

/**
 * Cybersecurity — dark banner over a certification-first split body.
 *
 * The banner is top-only: no `pageBackground` is exported, so page two starts clean rather
 * than repeating a dark band behind continued content. Sidebar order is fixed rather than
 * author-controlled because a credential list that appears below the fold is worth very
 * little in this field.
 */
export default function Cybersecurity({ cv, customization: c }: CVTemplateProps) {
  const accent = c.accentColor;
  const banner = shade(c.secondaryColor, 0.2);
  const onBanner = readableOn(banner);
  const accentOnBanner = accentOn(accent, banner);
  // Dimmed toward the band and then measured, rather than a fixed alpha over whatever
  // colour the user picked — see `mutedOn`.
  const bannerMuted = mutedOn(onBanner, 0.34, banner);
  const muted = mutedOn(c.textColor, 0.4);

  const sections = visibleSections(cv);
  const { main, aside } = splitSections(sections, ASIDE_SECTIONS);
  const asideRank = (id: string) => {
    const index = ASIDE_SECTIONS.indexOf(id);
    return index === -1 ? ASIDE_SECTIONS.length : index;
  };
  const asideOrdered = [...aside].sort((a, b) => asideRank(a.id) - asideRank(b.id));

  const entries = contactEntries(cv);
  const name = fullName(cv);
  const twoColumns = main.length > 0 && asideOrdered.length > 0;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', minHeight: 'inherit' }}>
      <header
        style={{
          background: banner,
          color: onBanner,
          padding: `${c.pageMargin * 0.85}px ${c.pageMargin}px`,
        }}
      >
        <h1
          style={{
            fontSize: '2.45em',
            lineHeight: 1.1,
            fontWeight: headingWeight(c, 600),
            letterSpacing: '0.01em',
            color: onBanner,
          }}
        >
          {name || 'Your Name'}
        </h1>

        {cv.personal.title ? (
          <p
            style={{
              marginTop: '0.25em',
              fontFamily: MONO,
              fontSize: '0.92em',
              letterSpacing: '0.04em',
              color: accentOnBanner,
            }}
          >
            {cv.personal.title}
          </p>
        ) : null}

        {entries.length > 0 ? (
          <div
            style={{
              marginTop: '1em',
              paddingTop: '0.85em',
              borderTop: `1px solid ${bannerMuted}`,
              display: 'grid',
              gridTemplateColumns: 'repeat(2, minmax(0, 1fr))',
              columnGap: '1.8em',
              rowGap: '0.3em',
              fontFamily: MONO,
              fontSize: '0.82em',
            }}
          >
            {entries.map((entry) => (
              <div
                key={entry.key}
                style={{ display: 'flex', alignItems: 'center', gap: '0.6em', minWidth: 0 }}
              >
                <span
                  style={{
                    width: '5.8em',
                    flexShrink: 0,
                    color: bannerMuted,
                    textTransform: 'uppercase',
                    letterSpacing: '0.06em',
                  }}
                >
                  {CONTACT_LABELS[entry.key] ?? 'Link'}
                </span>
                <span
                  style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '0.4em',
                    minWidth: 0,
                    color: onBanner,
                  }}
                >
                  {c.showIcons ? (
                    <ContactIcon name={entry.icon} size="0.95em" color={accent} />
                  ) : null}
                  {entry.href ? (
                    <a href={entry.href} style={{ color: 'inherit' }}>
                      {entry.label}
                    </a>
                  ) : (
                    <span>{entry.label}</span>
                  )}
                </span>
              </div>
            ))}
          </div>
        ) : null}
      </header>

      <div
        style={{
          flex: 1,
          padding: `${c.pageMargin * 0.85}px ${c.pageMargin}px ${c.pageMargin}px`,
          display: 'grid',
          gridTemplateColumns: twoColumns ? '70% 1fr' : '1fr',
          columnGap: '1.7em',
          alignItems: 'start',
        }}
      >
        {main.length > 0 ? (
          <div style={{ minWidth: 0 }}>
            {main.map((section, index) => (
              <section
                key={section.id}
                className="cv-section"
                style={{ marginTop: index === 0 ? 0 : `${c.sectionSpacing}px` }}
              >
                <SectionHeading label={section.label} accent={accent} c={c} size="0.98em" />
                <SectionContent
                  sectionId={section.id}
                  cv={cv}
                  c={c}
                  accent={accent}
                  color={c.textColor}
                  muted={muted}
                  variants={{
                    experience: 'compact',
                    education: 'compact',
                    projects: 'compact',
                    awards: 'compact',
                    volunteer: 'compact',
                    publications: 'compact',
                    interests: 'inline',
                    references: 'stack',
                  }}
                />
              </section>
            ))}
          </div>
        ) : null}

        {asideOrdered.length > 0 ? (
          <div style={{ minWidth: 0 }}>
            {asideOrdered.map((section, index) => (
              <section
                key={section.id}
                className="cv-section"
                style={{ marginTop: index === 0 ? 0 : `${c.sectionSpacing}px` }}
              >
                <SectionHeading label={section.label} accent={accent} c={c} size="0.86em" />
                <SectionContent
                  sectionId={section.id}
                  cv={cv}
                  c={c}
                  accent={accent}
                  color={c.textColor}
                  muted={muted}
                  variants={{ certifications: 'compact', languages: 'stack' }}
                  skillDisplay="tags"
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

function SectionHeading({
  label,
  accent,
  c,
  size,
}: {
  label: string;
  accent: string;
  c: CVCustomization;
  size: string;
}) {
  return (
    <h2
      className="cv-section-title"
      style={{
        fontSize: size,
        fontWeight: headingWeight(c, 800),
        lineHeight: 1.3,
        textTransform: headingTransform(c),
        letterSpacing: headingTracking(c),
        color: c.secondaryColor,
        borderLeft: `3px solid ${accent}`,
        paddingLeft: '0.6em',
        marginBottom: '0.6em',
      }}
    >
      {label}
    </h2>
  );
}
