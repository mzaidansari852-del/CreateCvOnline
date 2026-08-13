import type { BlogPost } from '@/types/blog';

import { hiringDesk } from './authors';

const post: BlogPost = {
  slug: 'cv-for-software-engineers',
  title: 'The software engineer’s CV: stack and projects',
  description:
    'How to write the stack section, which projects earn their space, what open source signals, and the six things an engineering manager reads in 30 seconds.',
  excerpt:
    'Two readers, thirty seconds each. What an engineering hiring manager actually looks for, how to write a stack section, and which projects and links earn their space.',
  category: 'By role',
  tags: ['Software engineering', 'Technical CV', 'Open source', 'Portfolio'],
  publishedAt: '2026-02-10',
  updatedAt: '2026-08-06',
  readingMinutes: 0, // computed from the body by lib/blog.ts — leave at 0.
  author: hiringDesk,
  faq: [
    {
      question: 'Should a software engineer’s CV be one page or two?',
      answer:
        'Two pages is normal outside the US once you have four or five years of experience, and nobody in engineering hiring penalises a well-organised second page. US-market resumes still lean strongly to one page. What actually matters is that the first half of page one contains your current stack, your most recent scope and one shipped result.',
    },
    {
      question: 'Do I need a GitHub profile to get hired?',
      answer:
        'No. Plenty of strong engineers have nothing public because their work is proprietary, and no competent hiring manager treats an empty profile as a negative. What is a negative is linking to a profile whose top repositories are an abandoned tutorial project and a fork from four years ago — an unlinked profile is better than a neglected one.',
    },
    {
      question: 'Should I put a take-home assignment on my CV?',
      answer:
        'Not as a portfolio piece. Take-homes are graded against a brief you cannot show, most companies ask that solutions are not published, and a reviewer who recognises the exercise will read it as a shortcut. If you want a public artefact, extend the idea into a project of your own with a real README.',
    },
    {
      question: 'How do I show seniority without a senior title?',
      answer:
        'Through scope and consequence: what you owned rather than contributed to, how many people depended on it, what happened when it broke, which decisions were yours. “Designed and owned the payments retry system handling 40k transactions a day” signals more than a title ever will.',
    },
  ],
  body: [
    {
      type: 'paragraph',
      text: 'An engineering CV is read twice by two people who want completely different things. A recruiter checks it against a list — years, languages, frameworks, location, notice period — in under a minute. Then, if it survives, an engineering manager skims it for about thirty seconds looking for one thing: is this person likely to be good at the work my team does?',
    },
    {
      type: 'paragraph',
      text: 'Most engineering CVs are written for neither. They are a list of technologies attached to a list of employers, with the actual engineering — the systems, the decisions, the failures survived — left out entirely.',
    },
    {
      type: 'heading',
      level: 2,
      text: 'What the manager skims for',
    },
    {
      type: 'list',
      ordered: true,
      items: [
        '**Current stack and depth.** Not everything you have touched — what you would be productive in on day one.',
        '**Scope.** The size and nature of the systems you have worked on. A CRUD app for 50 internal users and a payments service at 40k transactions a day are different jobs with the same job title.',
        '**What you personally did.** “The team migrated to Kubernetes” tells them nothing about you.',
        '**Evidence of shipping.** Things that reached production and stayed there.',
        '**Trajectory.** Increasing ownership over time, or a plausible reason it changed.',
        '**Red flags.** Unexplained gaps, six jobs in three years, a stack that has not moved in a decade, or claims that are obviously inflated.',
      ],
    },
    {
      type: 'paragraph',
      text: 'Everything below is about getting those six things into the top half of page one.',
    },
    {
      type: 'heading',
      level: 2,
      text: 'The stack section',
    },
    {
      type: 'paragraph',
      text: 'Put it directly under the summary, not at the bottom — it is the fastest read on the page and it is what the recruiter is checking. Group it, order the groups by what the advert asks for, and be honest about levels. No bars, no percentages, no star ratings.',
    },
    {
      type: 'code',
      language: 'text',
      code: `Languages    Go (primary, 5 yrs), TypeScript (4 yrs), Python (scripting, data)
Backend      gRPC, PostgreSQL, Redis, Kafka, RESTful service design
Infra        Kubernetes, Terraform, AWS (EKS, RDS, S3, SQS), GitHub Actions
Practice     Code review, incident response and on-call, design documents,
             trunk-based development`,
    },
    {
      type: 'callout',
      tone: 'warning',
      title: 'The interview tax on a long list',
      text: 'Every technology on your CV is a question you have consented to. If you list Rust because you did one weekend tutorial, you will be asked about Rust by someone who writes it daily. Cut anything you would not want a whole interview round on, or mark the level explicitly.',
    },
    {
      type: 'heading',
      level: 2,
      text: 'Experience bullets that read as engineering',
    },
    {
      type: 'paragraph',
      text: 'The useful pattern is **what you built, the constraint it was built under, and what changed**. The constraint is what separates an engineer from a list of nouns — anyone can add a cache; adding one without breaking read-after-write consistency is engineering.',
    },
    {
      type: 'table',
      head: ['Weak', 'Strong'],
      rows: [
        [
          'Worked on the payments service using Go and Kafka.',
          'Owned the payments retry pipeline (Go, Kafka) handling ~40k transactions a day; introduced idempotency keys that eliminated double-charge incidents.',
        ],
        [
          'Involved in the migration to Kubernetes.',
          'Migrated 24 services from EC2 to EKS over five months with no customer-visible downtime, writing the Terraform modules the other four teams then used.',
        ],
        [
          'Improved application performance.',
          'Cut p95 checkout latency from 1.9s to 620ms by replacing N+1 queries with a batched loader and adding a read replica.',
        ],
        [
          'Mentored junior developers.',
          'Ran the code review rota and onboarding for three joiners; two moved from junior to mid-level within the year.',
        ],
      ],
    },
    {
      type: 'paragraph',
      text: 'Percentages are fine, but concrete units are better: milliseconds, requests per second, number of services, size of the dataset, size of the team. Round the numbers and never inflate them — a senior engineer interviewing you will ask how it was measured.',
    },
    {
      type: 'heading',
      level: 2,
      text: 'Projects: which ones earn their space',
    },
    {
      type: 'paragraph',
      text: 'A projects section is essential early in a career and optional later, where it should only appear if it shows something your day job does not. The test is whether a reader learns something new about your judgement.',
    },
    {
      type: 'checklist',
      items: [
        'It has users, or it solved a problem you actually had. A to-do app has neither.',
        'You can describe a real decision in it: why this database, why not a queue, what you would change.',
        'It is finished enough to run. A README with a screenshot and a two-command setup beats 20 abandoned repositories.',
        'It is recent, or the skill it demonstrates still matters.',
        'Three lines maximum on the CV: what it is, the stack, the one interesting thing.',
      ],
    },
    {
      type: 'code',
      language: 'text',
      code: `Tramline - open-source CLI for staged database migrations (Go, SQLite)
Runs migrations in shadow tables and diffs the result before promoting.
~400 GitHub stars; used in CI at two companies I know of. Wrote the
conflict-detection logic and the docs.`,
    },
    {
      type: 'heading',
      level: 2,
      text: 'Open source, honestly',
    },
    {
      type: 'paragraph',
      text: 'Open source is a strong signal when it is real and a weak one when it is decorative. What reads as real: sustained contribution to a project you did not start, maintainership with issues and releases you handle, a merged change to something the reviewer has heard of, documentation work on a widely used library. What reads as decorative: forks, one-line typo fixes listed as “contributor to Kubernetes”, and star counts on repositories nobody uses.',
    },
    {
      type: 'paragraph',
      text: 'If you contribute occasionally, say what you did rather than where: “merged three fixes to the Django ORM query compiler (2024–2025)” is specific and checkable. And if your public work is thin, leave the section out. Its absence is not read as a negative; a padded version is.',
    },
    {
      type: 'heading',
      level: 2,
      text: 'Links, and the state you leave them in',
    },
    {
      type: 'paragraph',
      text: 'Link GitHub, a portfolio or a personal site only if a visitor will find something coherent within ten seconds. Before you add the link, do the ten-second test yourself: open it in a private window and see what a stranger sees.',
    },
    {
      type: 'list',
      items: [
        'Pin three repositories that represent your current level, and give each a README that opens with what it is and why it exists.',
        'Remove or archive tutorial follow-alongs and dead experiments, or accept that they are the first thing a reviewer sees.',
        'Keep take-home solutions private — most companies ask, and publishing them helps candidates after you cheat.',
        'For a personal site, one page describing three projects beats a design-heavy site with nothing behind it.',
        'Write links in full text (github.com/yourname), not hidden behind “click here”, so they survive a printed CV and a plain-text parse.',
      ],
    },
    {
      type: 'heading',
      level: 2,
      text: 'Format and length',
    },
    {
      type: 'paragraph',
      text: 'Single column, two pages, plain section headings. Engineering roles at larger companies almost always route through an applicant tracking system, and a two-column CV with a skills sidebar is exactly the layout that parses badly — see [make your CV ATS-safe in 20 minutes](/blog/ats-cv-guide). The [technology templates](/templates) here are built single-column with room for a stack block, projects and links.',
    },
    {
      type: 'quote',
      text: 'The best engineering CVs read like a short technical postmortem of a career: here is what I built, here is what constrained it, here is what happened.',
    },
    {
      type: 'paragraph',
      text: 'One last thing worth doing: before you send it, read your own CV as if you were interviewing yourself, and write down the five questions you would ask. If you cannot answer any one of them for twenty minutes, that line is a liability, not an asset.',
    },
  ],
  related: ['cv-examples-by-role', 'ats-cv-guide', 'cv-for-students-and-graduates'],
};

export default post;
