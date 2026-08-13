import { contactEntries, SectionContent } from "@/components/cv/parts";
import {
  fullName,
  headingTracking,
  headingTransform,
  tint,
} from "@/lib/cv/format";
import { visibleSections } from "@/lib/cv/sections";
import type { CVData, CVTemplateProps, TemplateMeta } from "@/types/cv";

export const meta: TemplateMeta = {
  id: "ats-03",
  slug: "ats-simple-cv",
  name: "ATS Simple",
  category: "ats",
  premium: false,
  atsScore: 5,
  columns: 1,
  hasPhoto: false,
  accentDefault: "#1f2937",
  tagline:
    "Plain single column with exactly one piece of colour: the section headings.",
  description:
    "ATS Simple keeps the bones of a plain-text CV and spends its entire colour budget in one place — section headings set in your accent with a fine rule beneath, which gives a recruiter something to scan without giving a parser anything to misread. Contact details sit on two short left-aligned lines, direct contact first and links second, so a long email address and a LinkedIn URL never collide in one wrapped run. Everything below the header is a single flow of body text with no icons, panels or graphics.",
  bestFor: [
    "Mid-level professionals applying online",
    "Candidates who want colour without parsing risk",
    "Referrals and internal applications",
  ],
  features: [
    "Accent-coloured headings over a 1.5px accent rule",
    "Two-line left-aligned contact block",
    "Monochrome body text below the headings",
    "Plain-text skills, grouped by your categories",
  ],
  keywords: [
    "simple cv template",
    "clean cv template",
    "ats cv with colour",
    "minimalist cv template",
  ],
};

const DIRECT_CONTACT_KEYS = new Set(["email", "phone", "location"]);

/**
 * Contact details as two plain lines: reachable-now details, then anything link-shaped.
 * Returns fewer lines when a group is empty, so the header never leaves a blank row.
 */
function contactLines(cv: CVData): string[] {
  const entries = contactEntries(cv);
  const direct = entries
    .filter((entry) => DIRECT_CONTACT_KEYS.has(entry.key))
    .map((entry) => entry.label);
  const online = entries
    .filter((entry) => !DIRECT_CONTACT_KEYS.has(entry.key))
    .map((entry) => entry.label);
  return [direct.join("  |  "), online.join("  |  ")].filter(Boolean);
}

/**
 * ATS Simple — ATS CV with one restrained accent.
 *
 * The accent colour is used for section headings and their rules and nowhere else: the
 * accent handed to the shared content renderers is the body ink, so the entries themselves
 * stay monochrome.
 */
export default function AtsSimple({ cv, customization: c }: CVTemplateProps) {
  const ink = c.textColor;
  const metaInk = tint(ink, 0.26);
  const accent = c.accentColor;
  const sections = visibleSections(cv);
  const name = fullName(cv);
  const lines = contactLines(cv);

  return (
    <div style={{ padding: c.pageMargin }}>
      <header>
        <h1
          style={{
            fontSize: "1.9em",
            lineHeight: 1.14,
            fontWeight: 700,
            color: ink,
          }}
        >
          {name || "Your Name"}
        </h1>
        {cv.personal.title ? (
          <p style={{ fontSize: "1.05em", marginTop: "0.12em", color: ink }}>
            {cv.personal.title}
          </p>
        ) : null}
        {lines.length > 0 ? (
          <div
            style={{ marginTop: "0.45em", fontSize: "0.95em", color: metaInk }}
          >
            {lines.map((line) => (
              <div key={line}>{line}</div>
            ))}
          </div>
        ) : null}
      </header>

      {sections.map((section) => (
        <section
          key={section.id}
          className="cv-section"
          style={{ marginTop: `${c.sectionSpacing}px` }}
        >
          <h2
            className="cv-section-title"
            style={{
              fontSize: "1em",
              fontWeight: 700,
              color: accent,
              textTransform: headingTransform(c),
              letterSpacing: headingTracking(c),
              borderBottom: `1.5px solid ${accent}`,
              paddingBottom: "0.2em",
              marginBottom: "0.45em",
            }}
          >
            {section.label}
          </h2>
          <SectionContent
            sectionId={section.id}
            showTags={false}
            cv={cv}
            c={c}
            accent={ink}
            color={ink}
            muted={section.id === "summary" ? ink : metaInk}
            gap={0.9}
            variants={{
              experience: "stack",
              education: "stack",
              projects: "compact",
              certifications: "stack",
              awards: "stack",
              volunteer: "stack",
              publications: "stack",
              languages: "stack",
              interests: "inline",
              references: "stack",
            }}
            skillDisplay="text"
            skillColumns={1}
          />
        </section>
      ))}
    </div>
  );
}
