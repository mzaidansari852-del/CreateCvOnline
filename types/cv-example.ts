import type { CVData } from './cv';

/**
 * A worked CV example.
 *
 * The point of one of these pages is the document itself: a real `CVData` object,
 * rendered with the same code that produces the PDF, with the reasoning written out
 * beside it. Everything else here is commentary on that document, which is why the
 * summary and the highlighted bullets are read back out of `cv` rather than retyped —
 * the page cannot end up explaining a sentence the example does not contain.
 */

/** One step of the walk-through: a part of the document, and why it is written that way. */
export interface CvExampleCommentary {
  section: string;
  text: string;
}

export interface CvExampleFaqEntry {
  question: string;
  answer: string;
}

export interface CvExample {
  slug: string;
  /** Sentence case, used in links and breadcrumbs: "Software engineer". */
  role: string;
  /** Career stage of the person in the example. */
  stage: string;
  /** Page title, without the brand. */
  metaTitle: string;
  /** Meta description. Keep between 80 and 200 characters. */
  metaDescription: string;
  keywords: string[];
  /** The `<h1>`. */
  heading: string;
  /** One paragraph under the heading. */
  intro: string;
  /** Shown as a visible note next to the document. Never omitted. */
  fictionNote: string;
  /** Registry id of the template the example is rendered in. Validated at module load. */
  templateId: string;
  /** The document itself. Built with `cvDataSchema.parse` so it cannot drift. */
  cv: CVData;
  /** Why the professional summary is written the way it is. */
  summaryNote: string;
  /**
   * Notes on the highlighted bullets, index for index against the first experience
   * entry's `achievements`. Length is checked against the CV at module load.
   */
  bulletNotes: string[];
  commentary: CvExampleCommentary[];
  /** What to change with less experience than the person in the example. */
  lessExperience: string[];
  /** What to change for a US résumé. */
  usResume: string[];
  faq: CvExampleFaqEntry[];
  /** Slugs of other examples. Validated at module load. */
  relatedExamples: string[];
  /** Slugs of `/cv-for/` guides. Validated at module load. */
  relatedProfessions: string[];
}
