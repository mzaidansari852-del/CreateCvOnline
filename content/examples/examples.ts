/**
 * The worked-example registry — exactly one line per example.
 *
 * Adding an example page is two steps and no more:
 *
 *   1. create `content/examples/<slug>.ts` with a `CvExample` as its default export;
 *   2. add one line below.
 *
 * `/cv-examples/[role]`, its `generateStaticParams`, the sitemap and the cross-links from
 * the profession guides all read from `content/examples/index.ts`, which collects
 * everything exported here.
 *
 * Keep the lines alphabetical. Display order is decided by `lib/cv-examples.ts`.
 */

export { default as accountant } from './accountant';
export { default as marketingManager } from './marketing-manager';
export { default as projectManager } from './project-manager';
export { default as softwareEngineer } from './software-engineer';
export { default as student } from './student';
