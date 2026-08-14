import { CV_EXAMPLES } from '@/content/examples';
import { AUTHORED_PROFILES } from './sample-profiles';
import { createSampleCV } from './defaults';
import { TEMPLATES } from './template-registry';
import type { CVData } from '@/types/cv';

/**
 * Which CV each template page shows.
 *
 * All fifty-six showed the same one — a product designer — which made the template pages a
 * set of near-identical documents wearing different frames, and made the frames harder to
 * judge rather than easier. Somebody on `/templates/academic-cv` wants to know whether the
 * layout copes with a publication list, and the only way to answer that is to put one in it.
 *
 * ## Where the CVs come from
 *
 * Three sources, in descending order of how much new writing they cost:
 *
 *  - `content/examples` already contains five worked CVs written for the `/cv-examples`
 *    pages. Reusing them means the same document appears on two pages, which is real
 *    duplication — but it is two pages rather than fifty-six, in different templates and
 *    surrounded by different copy, and the alternative was writing five more careers.
 *  - `sample-profiles.ts` adds seven for the clusters the examples do not cover: nobody had
 *    written a solicitor, a researcher, a photographer or an operations director, and those
 *    are exactly the templates named after them.
 *  - `createSampleCV()` stays as the product designer, and as the default for everything
 *    that is not a template page — the editor's "start from an example", the registration
 *    preview, the PDF tests.
 *
 * ## Why the map is written out
 *
 * It could be derived from keywords, and it would then be wrong quietly. A template added
 * without a profile falls back to the designer, which is the behaviour this exists to end,
 * so `tests/cv/samples.test.ts` fails the build instead. Fifty-six lines is a small price
 * for that.
 */

export interface SampleProfile {
  id: string;
  /** "Academic researcher" — shown to the user as what the preview is showing. */
  label: string;
  cv: CVData;
}

const DEFAULT_PROFILE: SampleProfile = {
  id: 'product-designer',
  label: 'Product designer',
  cv: createSampleCV(),
};

/** The five documents already written for `/cv-examples`, reused rather than rewritten. */
const FROM_EXAMPLES: SampleProfile[] = CV_EXAMPLES.map((example) => ({
  id: example.slug,
  label: example.role,
  cv: example.cv,
}));

export const SAMPLE_PROFILES: SampleProfile[] = [
  DEFAULT_PROFILE,
  ...FROM_EXAMPLES,
  ...AUTHORED_PROFILES,
];

const BY_ID = new Map(SAMPLE_PROFILES.map((profile) => [profile.id, profile]));

/**
 * Template id → profile id.
 *
 * Profession-named templates get the matching profession first; the generic ones are spread
 * across what is left so that no profile carries more than about five pages. Grouped by
 * category to make the spread visible.
 */
const TEMPLATE_PROFILE: Record<string, string> = {
  // Modern — no professions in the names, so this is where the spread happens.
  'modern-01': 'marketing-manager',
  'modern-02': 'data-scientist',
  'modern-03': 'operations-director',
  'modern-04': 'hr-manager',
  'modern-05': 'product-designer',
  'modern-06': 'security-engineer',
  'modern-07': 'project-manager',
  'modern-08': 'researcher',
  'modern-09': 'marketing-manager',
  'modern-10': 'operations-director',

  // Corporate.
  'corporate-01': 'operations-director', // Executive
  'corporate-02': 'operations-director', // Business Professional
  'corporate-03': 'operations-director', // Manager
  'corporate-04': 'project-manager', // Consultant
  'corporate-05': 'accountant', // Finance
  'corporate-06': 'accountant', // Banking
  'corporate-07': 'hr-manager', // HR
  'corporate-08': 'marketing-manager', // Marketing
  'corporate-09': 'marketing-manager', // Sales
  'corporate-10': 'operations-director', // Operations

  // Creative.
  'creative-01': 'product-designer', // Creative Designer
  'creative-02': 'product-designer', // Graphic Designer
  'creative-03': 'product-designer', // UI/UX Designer
  'creative-04': 'photographer', // Art Director
  'creative-05': 'photographer', // Photographer
  'creative-06': 'marketing-manager', // Content Creator
  'creative-07': 'photographer', // Creative Professional
  'creative-08': 'product-designer', // Portfolio
  'creative-09': 'photographer', // Editorial
  'creative-10': 'photographer', // Visual Resume

  // Technology.
  'tech-01': 'software-engineer', // Software Engineer
  'tech-02': 'software-engineer', // Developer
  'tech-03': 'software-engineer', // Full Stack Developer
  'tech-04': 'data-scientist', // Data Scientist
  'tech-05': 'security-engineer', // DevOps
  'tech-06': 'security-engineer', // Cybersecurity
  'tech-07': 'security-engineer', // IT Professional
  'tech-08': 'project-manager', // Product Manager
  'tech-09': 'data-scientist', // AI Engineer
  'tech-10': 'data-scientist', // Tech Minimal

  // Classic.
  'classic-01': 'solicitor', // Classic Professional
  'classic-02': 'hr-manager', // Traditional
  'classic-03': 'researcher', // Academic
  'classic-04': 'solicitor', // Legal
  'classic-05': 'solicitor', // Government
  'classic-06': 'operations-director', // Executive Classic
  'classic-07': 'researcher', // Elegant Serif
  'classic-08': 'solicitor', // Formal
  'classic-09': 'accountant', // Simple Classic
  'classic-10': 'researcher', // Timeless

  // ATS.
  'ats-01': 'project-manager', // ATS CV
  'ats-02': 'software-engineer', // ATS Resume
  'ats-03': 'hr-manager', // ATS Simple
  'ats-04': 'student', // Student
  'ats-05': 'accountant', // Accountant
  'ats-06': 'student', // Entry Level
};

/**
 * The profile a template page should show.
 *
 * Falls back to the product designer rather than throwing, because a missing entry must not
 * take the site down — but the test suite fails on one, so it cannot reach production.
 */
export function sampleProfileFor(templateId: string): SampleProfile {
  const profileId = TEMPLATE_PROFILE[templateId];
  return (profileId ? BY_ID.get(profileId) : undefined) ?? DEFAULT_PROFILE;
}

/** Shorthand for the common case. */
export function sampleCvFor(templateId: string): CVData {
  return sampleProfileFor(templateId).cv;
}

/** Every template id the map covers — used by the completeness test. */
export const MAPPED_TEMPLATE_IDS = Object.keys(TEMPLATE_PROFILE);

/** How many template pages each profile carries. Used by the test that caps the spread. */
export function profileLoad(): Map<string, number> {
  const load = new Map<string, number>();
  for (const template of TEMPLATES) {
    const id = sampleProfileFor(template.id).id;
    load.set(id, (load.get(id) ?? 0) + 1);
  }
  return load;
}
