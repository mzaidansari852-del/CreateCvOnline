/**
 * The article registry — exactly one line per article.
 *
 * Adding an article to the blog is two steps and no more:
 *
 *   1. create `content/blog/<slug>.ts` with a `BlogPost` as its default export;
 *   2. add one line below.
 *
 * Nothing else in the app needs to change: the index page, the sitemap-facing
 * helpers in `lib/blog.ts`, `generateStaticParams` and the related-post links all
 * read from `content/blog/index.ts`, which collects everything exported here.
 *
 * Order is irrelevant — `index.ts` sorts by publication date. Keep the lines
 * alphabetical so a missing article is obvious at a glance.
 */

export { default as atsCvGuide } from './ats-cv-guide';
export { default as commonCvMistakes } from './common-cv-mistakes';
export { default as cvExamplesByRole } from './cv-examples-by-role';
export { default as cvForInternationalJobs } from './cv-for-international-jobs';
export { default as cvForManagersAndExecutives } from './cv-for-managers-and-executives';
export { default as cvForMoroccoAndMena } from './cv-for-morocco-and-mena';
export { default as cvForSoftwareEngineers } from './cv-for-software-engineers';
export { default as cvForStudentsAndGraduates } from './cv-for-students-and-graduates';
export { default as howToWriteAProfessionalCv } from './how-to-write-a-professional-cv';
export { default as howToWriteAProfessionalSummary } from './how-to-write-a-professional-summary';
