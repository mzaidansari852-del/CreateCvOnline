import { z } from 'zod';

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

export const cvDataSchema = z.object({
  personal: personalInfoSchema,
  summary: trimmed(3000).default(''),
  experience: z.array(experienceItemSchema).max(40).default([]),
  education: z.array(educationItemSchema).max(20).default([]),
  skills: z.array(skillItemSchema).max(80).default([]),
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
  pageBackground?: (customization: CVCustomization) => string | undefined;
}
