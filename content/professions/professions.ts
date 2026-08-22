/**
 * The profession registry — exactly one line per profession.
 *
 * Adding a profession page to the site is two steps and no more:
 *
 *   1. create `content/professions/<slug>.ts` with a `Profession` as its default export;
 *   2. add one line below.
 *
 * Nothing else changes: `/cv-for`, `/cv-for/[profession]`, `generateStaticParams`, the
 * sitemap and the related-profession links all read from `content/professions/index.ts`,
 * which collects everything exported here.
 *
 * Keep the lines alphabetical so a missing profession is obvious at a glance. Display
 * order is decided by `lib/professions.ts`, not by this file.
 */

export { default as accountant } from './accountant';
export { default as dataAnalyst } from './data-analyst';
export { default as graphicDesigner } from './graphic-designer';
export { default as humanResources } from './human-resources';
export { default as marketingManager } from './marketing-manager';
export { default as nurse } from './nurse';
export { default as projectManager } from './project-manager';
export { default as salesManager } from './sales-manager';
export { default as softwareEngineer } from './software-engineer';
export { default as student } from './student';
export { default as teacher } from './teacher';
