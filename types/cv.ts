import { z } from 'zod';

// A leaf module — no imports of its own, so this cannot create a cycle back through the
// i18n layer, which does depend on these types.
import { DEFAULT_LOCALE, LOCALES } from '@/lib/i18n/locales';

/**
 * The single normalised CV document shape.
 *
 * Every one of the 50+ templates consumes exactly this structure, which is what makes
 * "switch template without losing data" a non-event: the data never changes shape.
 *
 * Validation lives next to the types so the same schema is used by the editor, the
 * server actions and the API routes. Nothing writes to Firestore without passing through
 * `cvDataSchema`.
 */

/* -------------------------------------------------------------------------- */
/* Primitives                                                                  */
/* -------------------------------------------------------------------------- */

const trimmed = (max: number) => z.string().trim().max(max);

/** `YYYY-MM`, `YYYY` or an empty string. Stored as text so partial dates are lossless. */
export const partialDateSchema = z
  .string()
  .trim()
  .max(10)
  .refine(
    (value) =>
      // The day group is nested inside the month group on purpose: keeping them as two
      // independent optional groups would let `2024-13` through, because the invalid
      // month simply falls through to the day position.
      value === '' || /^\d{4}(-(0[1-9]|1[0-2])(-(0[1-9]|[12]\d|3[01]))?)?$/.test(value),
    { message: 'Use YYYY, YYYY-MM or YYYY-MM-DD' },
  );

export const skillLevelSchema = z.enum([
  'beginner',
  'elementary',
  'intermediate',
  'advanced',
  'expert',
]);
export type SkillLevel = z.infer<typeof skillLevelSchema>;

export const languageLevelSchema = z.enum([
  'elementary',
  'limited-working',
  'professional-working',
  'full-professional',
  'native',
]);
export type LanguageLevel = z.infer<typeof languageLevelSchema>;

/* -------------------------------------------------------------------------- */
/* Sections                                                                    */
/* -------------------------------------------------------------------------- */

export const personalInfoSchema = z.object({
  firstName: trimmed(60).default(''),
  lastName: trimmed(60).default(''),
  title: trimmed(120).default(''),
  email: trimmed(160).default(''),
  phone: trimmed(40).default(''),
  location: trimmed(120).default(''),
  website: trimmed(200).default(''),
  linkedin: trimmed(200).default(''),
  github: trimmed(200).default(''),
  photoUrl: trimmed(600).default(''),
  /** Free-form extra contact rows (Behance, Dribbble, ORCID, …). */
  links: z
    .array(
      z.object({
        id: z.string(),
        label: trimmed(40),
        url: trimmed(300),
      }),
    )
    .max(8)
    .default([]),
});
export type PersonalInfo = z.infer<typeof personalInfoSchema>;

export const experienceItemSchema = z.object({
  id: z.string(),
  role: trimmed(140).default(''),
  company: trimmed(140).default(''),
  location: trimmed(120).default(''),
  startDate: partialDateSchema.default(''),
  endDate: partialDateSchema.default(''),
  current: z.boolean().default(false),
  description: trimmed(3000).default(''),
  achievements: z.array(trimmed(500)).max(20).default([]),
  tags: z.array(trimmed(40)).max(20).default([]),
});
export type ExperienceItem = z.infer<typeof experienceItemSchema>;

export const educationItemSchema = z.object({
  id: z.string(),
  degree: trimmed(160).default(''),
  field: trimmed(160).default(''),
  institution: trimmed(160).default(''),
  location: trimmed(120).default(''),
  startDate: partialDateSchema.default(''),
  endDate: partialDateSchema.default(''),
  current: z.boolean().default(false),
  grade: trimmed(60).default(''),
  description: trimmed(2000).default(''),
});
export type EducationItem = z.infer<typeof educationItemSchema>;

export const skillItemSchema = z.object({
  id: z.string(),
  name: trimmed(80).default(''),
  level: skillLevelSchema.default('advanced'),
  category: trimmed(60).default(''),
});
export type SkillItem = z.infer<typeof skillItemSchema>;

/**
 * One area of expertise, with the evidence for it.
 *
 * This is what makes a functional CV a different *document* rather than a different
 * arrangement of the same one. A chronological CV proves a claim by where it sits in a
 * timeline; a functional CV proves it here, by grouping the achievements under the
 * capability they demonstrate and letting the dates come second.
 *
 * It is deliberately not the `skills` array with a description bolted on. A skill is a
 * word with a rating — forty of them fit on a page. A competency is a short case, and
 * three to six is the whole section. Conflating them is how a functional template ends up
 * printing a bar chart with paragraphs next to it.
 */
export const competencyItemSchema = z.object({
  id: z.string(),
  /** The capability being claimed — "Programme delivery", "Regulatory reporting". */
  name: trimmed(120).default(''),
  /** One or two lines framing the claim. Optional: the bullets often carry it alone. */
  description: trimmed(1200).default(''),
  /** The evidence. Written the same way as experience achievements, minus the employer. */
  achievements: z.array(trimmed(500)).max(12).default([]),
});
export type CompetencyItem = z.infer<typeof competencyItemSchema>;

export const languageItemSchema = z.object({
  id: z.string(),
  name: trimmed(60).default(''),
  level: languageLevelSchema.default('professional-working'),
});
export type LanguageItem = z.infer<typeof languageItemSchema>;

export const certificationItemSchema = z.object({
  id: z.string(),
  name: trimmed(160).default(''),
  issuer: trimmed(140).default(''),
  date: partialDateSchema.default(''),
  expiryDate: partialDateSchema.default(''),
  credentialId: trimmed(120).default(''),
  url: trimmed(300).default(''),
});
export type CertificationItem = z.infer<typeof certificationItemSchema>;

export const projectItemSchema = z.object({
  id: z.string(),
  name: trimmed(140).default(''),
  role: trimmed(120).default(''),
  startDate: partialDateSchema.default(''),
  endDate: partialDateSchema.default(''),
  url: trimmed(300).default(''),
  description: trimmed(2000).default(''),
  highlights: z.array(trimmed(400)).max(12).default([]),
  tags: z.array(trimmed(40)).max(20).default([]),
});
export type ProjectItem = z.infer<typeof projectItemSchema>;

export const awardItemSchema = z.object({
  id: z.string(),
  title: trimmed(160).default(''),
  issuer: trimmed(140).default(''),
  date: partialDateSchema.default(''),
  description: trimmed(800).default(''),
});
export type AwardItem = z.infer<typeof awardItemSchema>;

export const volunteerItemSchema = z.object({
  id: z.string(),
  role: trimmed(140).default(''),
  organization: trimmed(140).default(''),
  location: trimmed(120).default(''),
  startDate: partialDateSchema.default(''),
  endDate: partialDateSchema.default(''),
  current: z.boolean().default(false),
  description: trimmed(1500).default(''),
});
export type VolunteerItem = z.infer<typeof volunteerItemSchema>;

export const publicationItemSchema = z.object({
  id: z.string(),
  title: trimmed(240).default(''),
  publisher: trimmed(160).default(''),
  date: partialDateSchema.default(''),
  url: trimmed(300).default(''),
  authors: trimmed(300).default(''),
  description: trimmed(1000).default(''),
});
export type PublicationItem = z.infer<typeof publicationItemSchema>;

export const interestItemSchema = z.object({
  id: z.string(),
  name: trimmed(60).default(''),
  description: trimmed(200).default(''),
});
export type InterestItem = z.infer<typeof interestItemSchema>;

export const referenceItemSchema = z.object({
  id: z.string(),
  name: trimmed(120).default(''),
  role: trimmed(140).default(''),
  company: trimmed(140).default(''),
  email: trimmed(160).default(''),
  phone: trimmed(40).default(''),
  relationship: trimmed(120).default(''),
});
export type ReferenceItem = z.infer<typeof referenceItemSchema>;

export const customSectionSchema = z.object({
  id: z.string(),
  title: trimmed(80).default('Custom section'),
  items: z
    .array(
      z.object({
        id: z.string(),
        heading: trimmed(160).default(''),
        subheading: trimmed(160).default(''),
        date: trimmed(60).default(''),
        description: trimmed(2000).default(''),
      }),
    )
    .max(30)
    .default([]),
});
export type CustomSection = z.infer<typeof customSectionSchema>;

/* -------------------------------------------------------------------------- */
/* Section registry                                                            */
/* -------------------------------------------------------------------------- */

export const BUILT_IN_SECTION_IDS = [
  'summary',
  'competencies',
  'experience',
  'education',
  'skills',
  'languages',
  'projects',
  'certifications',
  'awards',
  'volunteer',
  'publications',
  'interests',
  'references',
] as const;

export type BuiltInSectionId = (typeof BUILT_IN_SECTION_IDS)[number];

/** A section id is either a built-in key or `custom:<uuid>`. */
export const sectionIdSchema = z
  .string()
  .refine(
    (value) =>
      (BUILT_IN_SECTION_IDS as readonly string[]).includes(value) || value.startsWith('custom:'),
    { message: 'Unknown section id' },
  );

export const sectionConfigSchema = z.object({
  id: sectionIdSchema,
  /** Author-facing heading. Templates render this verbatim (respecting heading case rules). */
  label: trimmed(60),
  enabled: z.boolean().default(true),
});
export type SectionConfig = z.infer<typeof sectionConfigSchema>;

/* -------------------------------------------------------------------------- */
/* Customization                                                               */
/* -------------------------------------------------------------------------- */

export const fontKeySchema = z.enum([
  'inter',
  'roboto',
  'open-sans',
  'lato',
  'poppins',
  'ibm-plex-sans',
  'source-serif',
  'merriweather',
  'lora',
  'playfair',
  'libre-baskerville',
  'georgia',
  'garamond',
  'arial',
  'times',
]);
export type FontKey = z.infer<typeof fontKeySchema>;

export const paperSizeSchema = z.enum(['a4', 'letter']);
export type PaperSize = z.infer<typeof paperSizeSchema>;

export const dateFormatSchema = z.enum([
  'month-year-short', // Jan 2024
  'month-year-long', // January 2024
  'numeric', // 01/2024
  'year-only', // 2024
]);
export type DateFormatKey = z.infer<typeof dateFormatSchema>;

const hexColor = z
  .string()
  .trim()
  .regex(/^#(?:[0-9a-fA-F]{3}|[0-9a-fA-F]{6})$/, 'Must be a hex colour such as #1f3af5');

export const cvCustomizationSchema = z.object({
  templateId: z.string().trim().min(1).default('modern-01'),
  accentColor: hexColor.default('#1f3af5'),
  secondaryColor: hexColor.default('#0a0e18'),
  textColor: hexColor.default('#1f2430'),
  headingFont: fontKeySchema.default('inter'),
  bodyFont: fontKeySchema.default('inter'),
  /** Base body size in px at 96dpi. 8.5 – 13. */
  fontSize: z.number().min(8).max(14).default(10.5),
  lineHeight: z.number().min(1.1).max(2).default(1.5),
  /** Vertical rhythm between sections, in px. */
  sectionSpacing: z.number().min(6).max(48).default(18),
  /** Page padding, in px. */
  pageMargin: z.number().min(16).max(96).default(44),
  paperSize: paperSizeSchema.default('a4'),
  headingCase: z.enum(['uppercase', 'capitalize', 'none']).default('uppercase'),
  showPhoto: z.boolean().default(true),
  photoShape: z.enum(['circle', 'rounded', 'square']).default('circle'),
  showIcons: z.boolean().default(true),
  dateFormat: dateFormatSchema.default('month-year-short'),
  /** Skill rendering strategy — templates that support bars/dots honour this. */
  skillDisplay: z.enum(['bars', 'dots', 'tags', 'text']).default('bars'),
});
export type CVCustomization = z.infer<typeof cvCustomizationSchema>;

/* -------------------------------------------------------------------------- */
/* Document                                                                    */
/* -------------------------------------------------------------------------- */

/* -------------------------------------------------------------------------- */
/* Cover letter                                                                */
/* -------------------------------------------------------------------------- */

/**
 * The cover letter that goes with this CV.
 *
 * It lives on the CV rather than in a collection of its own, and that is the design
 * decision worth defending. Every competitor sells "matched pairs" — a letter whose
 * masthead, typeface and accent are the same as the CV's — and the way that promise
 * usually breaks is that the two documents are separate records which drift: you restyle
 * the CV in March and the letter you send in April is still wearing February's design.
 *
 * Here the letter cannot drift, because it has no design of its own. It renders from the
 * CV's `customization` and the CV's `personal` block, and the only thing stored is the
 * part that is genuinely different: who it is addressed to and what it says. A tailored
 * letter per application is then a duplicate of the CV, which is a thing the product
 * already does well.
 *
 * `enabled` is separate from "has content" on purpose. Someone who drafts a letter, turns
 * it off to send the CV alone, and comes back next week expects the draft to still be
 * there.
 */
export const coverLetterSchema = z.object({
  enabled: z.boolean().default(false),
  /** Free text so "Hiring Team" and a named person are equally first-class. */
  recipientName: trimmed(120).default(''),
  recipientRole: trimmed(120).default(''),
  company: trimmed(140).default(''),
  companyAddress: trimmed(300).default(''),
  /** The role being applied for; used in the subject line. */
  vacancy: trimmed(160).default(''),
  reference: trimmed(80).default(''),
  /**
   * `YYYY-MM-DD`, or empty for "the day it is exported".
   *
   * Empty is the default because a letter dated the day you wrote it and sent three weeks
   * later is worse than one with no date at all.
   */
  date: partialDateSchema.default(''),
  salutation: trimmed(120).default(''),
  /** One string; blank lines separate paragraphs, as they do everywhere else here. */
  body: trimmed(8000).default(''),
  signOff: trimmed(60).default(''),
  /** Shown under the sign-off. Defaults to the CV's name when blank. */
  signature: trimmed(120).default(''),
});
export type CoverLetter = z.infer<typeof coverLetterSchema>;

export const cvDataSchema = z.object({
  personal: personalInfoSchema,
  summary: trimmed(3000).default(''),
  experience: z.array(experienceItemSchema).max(40).default([]),
  education: z.array(educationItemSchema).max(20).default([]),
  skills: z.array(skillItemSchema).max(80).default([]),
  competencies: z.array(competencyItemSchema).max(10).default([]),
  languages: z.array(languageItemSchema).max(20).default([]),
  projects: z.array(projectItemSchema).max(30).default([]),
  certifications: z.array(certificationItemSchema).max(30).default([]),
  awards: z.array(awardItemSchema).max(20).default([]),
  volunteer: z.array(volunteerItemSchema).max(20).default([]),
  publications: z.array(publicationItemSchema).max(30).default([]),
  interests: z.array(interestItemSchema).max(20).default([]),
  references: z.array(referenceItemSchema).max(10).default([]),
  customSections: z.array(customSectionSchema).max(6).default([]),
  /** Ordered. Array position *is* the render order. */
  sections: z.array(sectionConfigSchema).default([]),
  coverLetter: coverLetterSchema.default(() => coverLetterSchema.parse({})),
  /**
   * The language of the *document*, which is not the language of the interface.
   *
   * Someone applying in Paris and Berlin from one account needs a French CV and a German
   * Lebenslauf side by side, so this belongs to the CV rather than to the user. It drives
   * the section headings and the date formatting the templates print — not the content,
   * which is the applicant's own words in whatever language they choose to write them.
   *
   * Defaults to English so every CV written before this field existed parses unchanged.
   */
  language: z.enum(LOCALES).default(DEFAULT_LOCALE),
});
export type CVData = z.infer<typeof cvDataSchema>;

export const cvDocumentSchema = z.object({
  id: z.string(),
  ownerId: z.string(),
  title: trimmed(120).default('Untitled CV'),
  data: cvDataSchema,
  customization: cvCustomizationSchema,
  /** ISO-8601 strings — Firestore Timestamps are converted at the repository boundary. */
  createdAt: z.string(),
  updatedAt: z.string(),
  /** Populated when the owner enables public sharing. */
  shareId: z.string().nullable().default(null),
  isPublic: z.boolean().default(false),
  downloadCount: z.number().int().min(0).default(0),
  lastDownloadedAt: z.string().nullable().default(null),
});
export type CVDocument = z.infer<typeof cvDocumentSchema>;

/** Lightweight projection used by dashboard lists — avoids shipping full CV bodies. */
export interface CVSummary {
  id: string;
  title: string;
  templateId: string;
  updatedAt: string;
  createdAt: string;
  isPublic: boolean;
  shareId: string | null;
  accentColor: string;
  fullName: string;
  headline: string;
  completeness: number;
}

/* -------------------------------------------------------------------------- */
/* Template contract                                                           */
/* -------------------------------------------------------------------------- */

export type TemplateCategory =
  | 'modern'
  | 'corporate'
  | 'creative'
  | 'technology'
  | 'classic'
  | 'ats';

/**
 * The one and only contract a template component must satisfy.
 * Adding a template = writing a component with this signature and registering it.
 */
export interface CVTemplateProps {
  cv: CVData;
  customization: CVCustomization;
}

/**
 * Everything about a template except its React component.
 *
 * Each template file exports its own `meta`, so adding a template is: drop a `.tsx` file
 * into `components/cv/templates/<category>/`, export a default component and a `meta`
 * object, and run `npm run generate:templates` (which also runs automatically on build).
 */
export interface TemplateMeta {
  id: string;
  /** URL-safe id used for `/templates/[slug]`. */
  slug: string;
  name: string;
  category: TemplateCategory;
  premium: boolean;
  /** 1–5, how safely an applicant tracking system can parse the layout. */
  atsScore: number;
  columns: 1 | 2;
  hasPhoto: boolean;
  accentDefault: string;
  /**
   * The typeface pairing this design was drawn for.
   *
   * Every template rendered in Inter until this existed, which is why fifty-six layouts
   * read as fifty-six arrangements of the same document rather than fifty-six designs.
   * Type does more for perceived difference than column count does: a serif Academic CV and
   * a geometric-sans Modern Tech are recognisably different things before you read a word,
   * and two one-column layouts in the same face are not, however carefully the rules and
   * spacing differ.
   *
   * Applied when a template is chosen, and only while the user has not picked their own —
   * see `DesignPanel`. It is a starting point, not a constraint.
   */
  fonts: { heading: FontKey; body: FontKey };
  /**
   * The page metrics this design was drawn for.
   *
   * Both were frozen at the schema default on all fifty-six templates — 1.5 leading, 44px
   * margins — which meant the one design variable that changes how a page *feels* before
   * you read it was doing no work at all.
   *
   * They are set from measurement rather than taste. `pageMargin` is banded by what kind
   * of document the template is (a Legal CV is a document and wants a document's margin; a
   * portfolio page is a poster and does not) and spread inside each band by measured line
   * length, so the widest-set templates get the most relief. `lineHeight` then follows the
   * measure that results: the longer a line, the more help the eye needs finding the start
   * of the next one. `tests/cv/metrics.test.ts` holds both to the measurements in
   * `docs/AUDIT_TEMPLATES.md`.
   */
  metrics: { lineHeight: number; pageMargin: number };
  /**
   * The external standard this template reproduces, if it reproduces one.
   *
   * Almost every template here is a design decision, and the design tests hold those to
   * house rules — Classic templates are set in a serif, ATS templates stay on conventional
   * faces, and so on. A template that implements a published format is a different kind of
   * object: the Europass is set in a sans because the European Commission set it in a sans,
   * and "fix" it to a serif and it stops being the thing the user searched for.
   *
   * Naming the standard rather than setting a boolean keeps the exemption legible — both to
   * the tests, which skip house rules for these, and to the reader, who is told which
   * authority the layout answers to.
   */
  standard?: string;
  /** Short marketing line used in cards and meta descriptions. */
  tagline: string;
  description: string;
  bestFor: string[];
  features: string[];
  keywords: string[];
}

export interface TemplateDefinition extends TemplateMeta {
  component: React.ComponentType<CVTemplateProps>;
  /**
   * Optional full-bleed page background (e.g. a coloured sidebar band).
   * Applied to the page element *and* to `<body>` in the print route, which is what
   * makes a sidebar continue onto pages 2, 3 … in the exported PDF.
   */
  /**
   * The page background a template needs painted on every sheet, not just the first.
   *
   * Takes the CV as well as the customization because whether the band should exist at all
   * is a question about content: a template that reserves a third of the page for skills,
   * languages and certifications must not paint that band when the user has turned all
   * three off. Returning `undefined` leaves the page white.
   */
  pageBackground?: (customization: CVCustomization, cv: CVData) => string | undefined;
}
