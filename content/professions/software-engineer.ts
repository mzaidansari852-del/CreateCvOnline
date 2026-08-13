import type { Profession } from '@/types/profession';

const profession: Profession = {
  slug: 'software-engineer',
  role: 'Software engineer',
  rolePlural: 'software engineers',
  field: 'Technology & data',
  metaTitle: 'Software Engineer CV: What Managers Scan For',
  metaDescription:
    'How to write a software engineer CV: the order an engineering manager reads it in, the metrics that carry weight, three bullets rewritten, and templates that parse.',
  keywords: [
    'software engineer cv',
    'developer cv',
    'software engineer cv example',
    'engineering cv template',
    'cv for programmers',
    'technical cv',
  ],
  heading: 'How to write a software engineer CV',
  intro:
    'An engineering CV is read twice by two people who want different things: a recruiter checking it against a requirements list, and an engineer deciding whether you would be useful on their team by Friday. The document has to answer both in the top half of page one.',
  overview: [
    'Almost every weak engineering CV fails the same way. It lists technologies and it lists employers, and it leaves out the engineering — the systems, the constraints, the decisions that were yours and the things that broke. A reviewer who is themselves an engineer can tell the difference between someone who was in the room and someone who owned the thing within about three bullet points.',
    'The fix is not more detail. It is different detail: what you were responsible for, how big it was, what you changed about it and what happened as a result. Everything below is about getting that into a document a recruiter can also filter on, because both readers have to say yes.',
  ],
  scanOrder: [
    {
      title: 'Your current stack, in the first ten seconds',
      description:
        'The recruiter screen is a matching exercise. Whoever reads first is checking the languages, frameworks and infrastructure in the advert against what appears on your page — so the stack you would be productive in on day one belongs near the top, not in a footer under your interests.',
    },
    {
      title: 'The scope of what you have run',
      description:
        'An engineering manager then looks for size. A CRUD tool for fifty internal users and a payments service handling millions of requests a day carry the same job title and are not the same job. Requests per day, data volume, number of services, users served — one of these numbers on your most recent role changes how the rest of the page reads.',
    },
    {
      title: 'What you personally did',
      description:
        '“The team migrated to Kubernetes” tells a reader nothing about you. Name the part that was yours: designed it, owned it, led the migration, wrote the RFC, ran the incident. Attribution is not bragging in this field — a hiring manager who cannot separate you from your team will assume the smaller version.',
    },
    {
      title: 'Trajectory, and anything that needs explaining',
      description:
        'Last is a pattern check: increasing ownership over time, sensible tenure, and a stack that has moved this decade. Gaps and short stints are not disqualifying, but an unexplained six-month hole invites a worse story than the real one. One clause is enough.',
    },
  ],
  metrics: [
    {
      name: 'Scale of the system',
      detail:
        'Requests or events per day, rows in the table you own, monthly active users served, size of the fleet. This is the single most load-bearing number on an engineering CV because every other claim is read relative to it.',
    },
    {
      name: 'Reliability',
      detail:
        'p95 or p99 latency before and after, error rate, uptime against the SLO, incidents per quarter, mean time to recovery. Latency figures are especially persuasive because they are hard to fake and easy to ask about in an interview.',
    },
    {
      name: 'Delivery speed',
      detail:
        'Deploy frequency, lead time from merge to production, build or CI duration, change failure rate. These say something about how you work rather than what you know, which is exactly what a team lead is trying to find out.',
    },
    {
      name: 'Cost and efficiency',
      detail:
        'Infrastructure spend removed, instances decommissioned, query time cut, storage reclaimed. Cost work is under-reported on engineering CVs and disproportionately well received, because it is the kind of contribution a manager can defend in a budget meeting.',
    },
  ],
  sectionPlan: {
    order: [
      {
        section: 'Contact and links',
        note: 'Name, city, email, phone, GitHub and one portfolio or LinkedIn URL. Written as plain text, not hidden behind icons a parser cannot read.',
      },
      {
        section: 'Summary — three lines',
        note: 'What you are, how long, the domain you know and the one thing you are strongest at. If it would still be true on someone else’s CV, delete it.',
      },
      {
        section: 'Technical skills',
        note: 'Directly under the summary. This is the fastest read on the page and the section the recruiter is filtering on. Group by language, framework, infrastructure and data, and order the groups to match the advert.',
      },
      {
        section: 'Experience',
        note: 'Reverse chronological, four to six bullets on the current role, three on the previous one, one or two on anything older than eight years.',
      },
      {
        section: 'Projects or open source',
        note: 'Only if they add something your employment does not — a language you want to be hired in, a system type you have not been paid to build, or genuine adoption.',
      },
      {
        section: 'Education',
        note: 'Two lines once you have three years of experience. Degree, institution, year. A conversion course or bootcamp goes here too, stated plainly.',
      },
      {
        section: 'Certifications',
        note: 'Last, and only the current ones. Cloud certifications carry weight in infrastructure and consulting roles and almost none in product engineering.',
      },
    ],
    drop: [
      {
        section: 'Skill bars and percentage ratings',
        note: 'Nobody is 80% at Python, and the reviewer is an engineer who will notice. Bars also carry no text for a parser to read.',
      },
      {
        section: 'Interests and hobbies',
        note: 'Costs you three lines of page-one attention. Keep one short line only if it is genuinely relevant — mechanical keyboards and marathon running are not.',
      },
      {
        section: 'A photograph, date of birth and marital status',
        note: 'Standard on a CV in parts of Europe and North Africa, unusual in UK tech and actively unwelcome in the US. If you are applying across markets, leave them off.',
      },
      {
        section: 'Every tutorial project you have ever completed',
        note: 'A to-do app and a clone of an existing site read as filler and pull attention away from the work you were paid for.',
      },
    ],
  },
  rewrites: [
    {
      before: 'Worked on the backend team using Java and Spring Boot to build APIs.',
      after:
        'Owned the payments API (Java, Spring Boot) serving around 4M requests a day; cut p99 latency from 850 ms to 210 ms by replacing a per-request currency lookup with an in-process cache.',
      change:
        '“Worked on” covers everything from designing the service to attending the stand-up; the rewrite keeps the stack but attaches it to a named system, a scale, and one specific change with a before and an after.',
    },
    {
      before: 'Helped migrate our infrastructure to Kubernetes and improved deployments.',
      after:
        'Led the migration of 14 services from EC2 to EKS over five months, writing the Helm chart conventions the other three teams adopted; deploy frequency went from weekly releases to around 30 a week and rollback time from 40 minutes to under two.',
      change:
        '“Helped” has been replaced with the part that was actually yours, the migration now has a size and a duration, and the outcome is two operational numbers instead of the word “improved”.',
    },
    {
      before: 'Mentored junior developers and participated in code reviews.',
      after:
        'Ran onboarding for four new engineers and rewrote the review checklist after a post-incident review; median time-to-first-merged-PR for new starters dropped from nine days to three.',
      change:
        'Mentoring is unverifiable as a claim, so the rewrite converts it into an artefact you produced and a team metric it moved — and names the incident that prompted it, which is how engineers describe real work.',
    },
  ],
  ats: {
    intro: [
      'Most engineering applications pass through a parser before a human sees them, and for this job family the matching is unusually literal: the terms being searched are product names. A system looking for “Kubernetes” does not infer it from “container orchestration”, and one looking for “PostgreSQL” may not match “Postgres”.',
      'The practical response is not keyword stuffing, which reads badly to the engineer who eventually opens the file. It is to write the technology names out properly in the skills section and then use them naturally in the bullets where you actually used them, so the term appears in context rather than in a list at the bottom.',
    ],
    groups: [
      {
        group: 'Languages and runtimes',
        examples: ['Java', 'Python', 'TypeScript', 'JavaScript', 'Go', 'C#', '.NET', 'Node.js'],
      },
      {
        group: 'Frameworks and libraries',
        examples: ['Spring Boot', 'React', 'Django', 'Rails', 'Next.js', 'FastAPI'],
      },
      {
        group: 'Infrastructure and tooling',
        examples: ['AWS', 'Azure', 'GCP', 'Docker', 'Kubernetes', 'Terraform', 'CI/CD', 'GitHub Actions'],
      },
      {
        group: 'Data and messaging',
        examples: ['PostgreSQL', 'MySQL', 'Redis', 'Kafka', 'Elasticsearch', 'DynamoDB'],
      },
      {
        group: 'Practice terms',
        examples: ['REST', 'gRPC', 'microservices', 'event-driven', 'unit testing', 'code review', 'on-call'],
      },
    ],
    caveat:
      'No layout and no wording can guarantee a pass: systems differ, and many engineering teams sift manually anyway. What you can control is that the file is plain text under the surface, the terms are spelled the way the advert spells them, and nothing important is trapped in a graphic.',
  },
  mistakes: [
    {
      title: 'The stack soup',
      description:
        'Thirty technologies in one comma-separated block, some of which you touched once in 2019. It reads as either padding or an inability to prioritise, and it dilutes the four things you are genuinely strong in. Group them and be honest about depth.',
    },
    {
      title: 'Team achievements in the first person plural',
      description:
        'A CV written as “we” gives a reviewer nothing to hire. It is fine — expected, even — to say the team shipped something, as long as the next clause says which part was yours.',
    },
    {
      title: 'A GitHub link to a neglected profile',
      description:
        'An empty profile is not a negative; nobody assumes proprietary work can be published. A linked profile whose top repositories are an abandoned tutorial and a four-year-old fork is worse than no link at all.',
    },
    {
      title: 'A two-column layout that splits the stack',
      description:
        'Sidebar designs look tidy and can be reordered badly by a parser, which is how a skills column ends up interleaved with your job history. In a field where the skills list is the filter, that is an expensive risk for a small aesthetic gain.',
    },
    {
      title: 'Seniority claimed by adjective',
      description:
        '“Senior full-stack engineer with a proven track record of delivering high-quality solutions” is four seconds of nothing. Seniority shows through scope and consequence: what you owned, who depended on it, what happened when it broke.',
    },
  ],
  templates: [
    {
      id: 'tech-01',
      reason:
        'One column, ruled headings and the stack written as prose rather than as bars — the safest choice when you do not know whether the file is going into a parser, a PDF viewer or a print tray.',
    },
    {
      id: 'tech-03',
      reason:
        'Puts your stack across the top and splits employment from projects below it, which suits engineers whose open-source or side work is a real part of the case they are making.',
    },
    {
      id: 'tech-10',
      reason:
        'Type and space only, tightly set. Good for a long history that needs to stay on two pages, and impossible for a parser to misread.',
    },
  ],
  steps: [
    {
      name: 'Write the skills block first',
      text: 'Open the advert next to the page and list, in groups, the languages, frameworks, infrastructure and data technologies you would be productive in on day one. Order the groups so the ones the advert leads with come first.',
    },
    {
      name: 'Give every role a scale sentence',
      text: 'For each job, write one line describing the system you owned and how big it was — requests, users, data volume, services, team size. This is the description line, not a bullet.',
    },
    {
      name: 'Turn each responsibility into a change',
      text: 'For every bullet you were about to write as a duty, ask what measurably differed afterwards. Latency, deploy frequency, error rate, cost, onboarding time. Keep the ones where you can name a before and an after.',
    },
    {
      name: 'Cut the stack down to what you would defend',
      text: 'Remove anything you would not want to be interviewed on. A shorter, honest list is stronger than a long one you have to hedge in the phone screen.',
    },
    {
      name: 'Check it survives being turned into text',
      text: 'Export the PDF, select all, and paste it into a plain text editor. If the reading order scrambles or your skills section lands in the middle of a job, change the layout before you send it anywhere.',
    },
  ],
  us: {
    intro:
      'Applying to the US market changes the packaging rather than the substance. The document is called a resume, it is expected to be one page until roughly ten years in, and it is trimmed harder than a UK or EU CV.',
    points: [
      'Cut to one page by dropping older roles to a single line and removing the projects section unless it is doing real work.',
      'Never include a photo, date of birth, nationality or marital status — US employers routinely discard resumes carrying them for legal reasons.',
      'GPA is worth including for the first two or three years after graduating and is normally dropped after that; degree classification means nothing to a US reader, so translate or omit it.',
      'Use US spellings in the technology names where they differ, and quantify in the currency of the company you are applying to.',
    ],
  },
  faq: [
    {
      question: 'Where should the technical skills section go?',
      answer:
        'Directly under the summary, above your employment history. It is the section the first reader is filtering on, and burying it below two pages of jobs means a recruiter working through a stack of applications may never reach it. The exception is a very senior CV — staff, principal or engineering management — where scope and impact are the filter and the skills list can sit lower.',
    },
    {
      question: 'Should I list every language I have ever used?',
      answer:
        'No. List what you would happily be interviewed on, then use a second group for things you have working familiarity with and label it honestly. A reviewer who spots a language on your CV will sometimes ask about it, and “I used it once four years ago” is a bad answer to a question you invited. Depth in four technologies beats nominal coverage of twenty.',
    },
    {
      question: 'How do I write a CV when all my work is proprietary?',
      answer:
        'Describe the shape of the system rather than the product. “A multi-tenant scheduling service for around 300 enterprise customers, handling 2M jobs a day” names no client, breaches nothing and tells an engineer everything they need. Scale, architecture, constraints and your decisions are almost never the confidential part — customer names, revenue figures and unreleased features are.',
    },
    {
      question: 'How do I take credit fairly for work a team did together?',
      answer:
        'Name the team’s outcome and then your slice of it in the same sentence: “part of a four-person team that rebuilt the ingestion pipeline; I owned the deduplication stage and the backfill of 400M historical records.” This is more convincing than either extreme — it survives a reference check, and it shows you can describe a system you did not personally write all of, which is most systems.',
    },
  ],
  related: ['data-analyst', 'project-manager', 'student'],
  exampleSlug: 'software-engineer',
};

export default profession;
