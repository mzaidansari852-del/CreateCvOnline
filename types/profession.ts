/**
 * The profession content contract.
 *
 * One of these describes everything `/cv-for/[profession]` renders. The shape is
 * deliberately structured rather than free-form prose: the page is assembled from
 * these fields, so a profession that forgets its metrics or its rewrites cannot be
 * published looking complete, and the word-count and template-id checks in
 * `lib/professions.ts` have something concrete to walk.
 */

/** One thing a hiring manager looks for, in the order they look for it. */
export interface ProfessionScanStep {
  title: string;
  description: string;
}

/** A number that actually carries weight in this job family. */
export interface ProfessionMetric {
  name: string;
  detail: string;
}

/** A section of the document, with the reason it sits where it sits. */
export interface ProfessionSectionNote {
  section: string;
  note: string;
}

export interface ProfessionSectionPlan {
  /** Recommended order, top of the page first. */
  order: ProfessionSectionNote[];
  /** Sections that cost more space than they earn in this field. */
  drop: ProfessionSectionNote[];
}

/** A weak line, the rewrite, and exactly what changed between them. */
export interface ProfessionRewrite {
  before: string;
  after: string;
  change: string;
}

/** Terms a parser is plausibly matching for, grouped so they can be scanned. */
export interface ProfessionKeywordGroup {
  group: string;
  examples: string[];
}

export interface ProfessionAtsGuidance {
  intro: string[];
  groups: ProfessionKeywordGroup[];
  /** The honest hedge. Never a guarantee about a specific employer's system. */
  caveat: string;
}

export interface ProfessionMistake {
  title: string;
  description: string;
}

/** A recommended template, by registry id. Validated at module load. */
export interface ProfessionTemplatePick {
  id: string;
  reason: string;
}

/** How the US résumé convention differs for this role specifically. */
export interface ProfessionUsNotes {
  intro: string;
  points: string[];
}

export interface ProfessionFaqEntry {
  question: string;
  answer: string;
}

export interface Profession {
  slug: string;
  /** Sentence case, used in links and breadcrumbs: "Software engineer". */
  role: string;
  /** Collective form used mid-sentence: "software engineers". */
  rolePlural: string;
  /** Grouping used by the `/cv-for` index. */
  field: string;
  /** Page title, without the brand — `pageMetadata` appends it. */
  metaTitle: string;
  /** Meta description. Keep between 80 and 200 characters. */
  metaDescription: string;
  keywords: string[];
  /** The `<h1>`. */
  heading: string;
  /** One paragraph under the heading. */
  intro: string;
  /** Two or three paragraphs framing the field before the detail starts. */
  overview: string[];
  scanOrder: ProfessionScanStep[];
  metrics: ProfessionMetric[];
  sectionPlan: ProfessionSectionPlan;
  rewrites: ProfessionRewrite[];
  ats: ProfessionAtsGuidance;
  mistakes: ProfessionMistake[];
  templates: ProfessionTemplatePick[];
  /** Build order for this role, emitted as HowTo structured data. */
  steps: { name: string; text: string }[];
  us: ProfessionUsNotes;
  faq: ProfessionFaqEntry[];
  /** Slugs of related professions. Validated at module load. */
  related: string[];
  /** Slug under `/cv-examples/` when a worked example exists for this role. */
  exampleSlug?: string;
}
