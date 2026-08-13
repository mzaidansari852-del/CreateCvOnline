import type { Profession } from '@/types/profession';

const profession: Profession = {
  slug: 'project-manager',
  role: 'Project manager',
  rolePlural: 'project managers',
  field: 'Finance & operations',
  metaTitle: 'Project Manager CV: Budget, Headcount and Variance',
  metaDescription:
    'A project manager CV is judged on the size of what you have run and whether it landed. Budget, headcount, duration, variance against plan — and how to write them honestly.',
  keywords: [
    'project manager cv',
    'project management cv example',
    'prince2 cv',
    'pmp cv',
    'programme manager cv',
    'agile project manager cv',
  ],
  heading: 'How to write a project manager CV',
  intro:
    'Project management is the field where the job title tells a reader the least. The same two words cover a person coordinating a three-week internal change and a person running a €20m multi-site programme with four vendors. Your CV exists mainly to say which one you are.',
  overview: [
    'That means the numbers come first: budget, headcount, duration, and the number of moving parts. A sponsor reading your CV is estimating whether you have run something the size of the thing they need run, and no amount of methodology vocabulary substitutes for that estimate.',
    'The second thing they are estimating is whether you tell the truth about outcomes. A CV in which every project landed on time and on budget is not reassuring — anyone who has delivered anything knows that is not how delivery works. Reporting a variance, and the reason for it, is one of the few genuinely counter-intuitive moves available in this profession, and it is remarkably effective.',
  ],
  scanOrder: [
    {
      title: 'The size of what you have run',
      description:
        'Budget, team size, duration and number of workstreams, per project. This is the first filter and it is quantitative. A CV that describes five years of delivery without a single budget figure forces the reader to assume the smallest plausible version of your career.',
    },
    {
      title: 'Whether it landed, and how you know',
      description:
        'Delivered against what baseline, with what variance, and what benefit was realised afterwards. Sponsors are looking for evidence you track your own projects rather than narrate them.',
    },
    {
      title: 'Domain and complexity',
      description:
        'Sector, regulatory scope, number of vendors and sites, systems involved, whether the change was technical, organisational or both. A construction programme manager and an IT change manager both say “project manager”; the domain is what makes your experience transferable or not.',
    },
    {
      title: 'Methodology and certification — as a filter, not a differentiator',
      description:
        'PRINCE2, PMP, Agile, Scrum, MSP, SAFe. These are usually screening criteria rather than reasons to hire, so they should be visible and brief. Where a CV goes wrong is treating the certificate as the qualification and the delivery record as an afterthought.',
    },
  ],
  metrics: [
    {
      name: 'Budget and headcount per project',
      detail:
        'The core calibration figures. Give the budget you were accountable for rather than the total programme value if they differ, and give the team you directed including contractors and vendor staff.',
    },
    {
      name: 'Variance against the original plan',
      detail:
        'Schedule and cost variance against the approved baseline, with the reason. “Delivered five weeks behind the original plan and 3% under budget after absorbing two scope changes” is more credible than any version of “on time and on budget”.',
    },
    {
      name: 'Complexity count',
      detail:
        'Vendors, workstreams, sites, countries, integrated systems, regulatory approvals. Complexity is what makes a small budget hard, and it is the argument for a candidate whose numbers are modest but whose projects were genuinely difficult.',
    },
    {
      name: 'Benefits realised after go-live',
      detail:
        'Adoption rate, cost saved annually, cycle time reduced, headcount redeployed, decommissioned systems. Most project managers stop at delivery; the ones who report what the project actually produced afterwards stand out immediately.',
    },
  ],
  sectionPlan: {
    order: [
      {
        section: 'Contact and certifications line',
        note: 'Name, city, phone, email, and your certifications after your name if you hold the ones the sector screens on — “Marta Silva, PMP, PRINCE2 Practitioner”.',
      },
      {
        section: 'Summary — three or four lines',
        note: 'Domain, typical project size, delivery approach and the largest thing you have run. This is where a career-changer or a sector switch is explained.',
      },
      {
        section: 'Key projects',
        note: 'Distinctive to this profession and worth the space: three or four projects as their own entries with budget, team, duration, your role and the outcome. Especially valuable for contractors, whose employer list hides the work.',
      },
      {
        section: 'Experience',
        note: 'Reverse chronological, with the scope line under each employer. For permanent roles, keep the project detail here instead and skip the separate block.',
      },
      {
        section: 'Certifications and methods',
        note: 'One line each with the year. Include the tooling — Jira, MS Project, Smartsheet, Planview — because that is a genuine screening term.',
      },
      {
        section: 'Education',
        note: 'Two lines. Below the certifications, which matter more in this field once you have a delivery record.',
      },
    ],
    drop: [
      {
        section: 'Methodology soup',
        note: 'A paragraph naming Agile, Waterfall, Scrum, Kanban, Lean, Six Sigma, PRINCE2, SAFe and hybrid together says you have heard of all of them. Name what you actually ran, per project.',
      },
      {
        section: 'A list of responsibilities from the job description',
        note: '“Managed risks, issues and dependencies; produced status reports; chaired steering committees.” This is the definition of the role, and every applicant does it.',
      },
      {
        section: 'RAG-status graphics and progress bars',
        note: 'Decorative charts of your own competence carry no text, take a third of the page and are the first thing a parser loses.',
      },
      {
        section: 'Interests, unless they show delivery',
        note: 'Chairing a committee or organising an event with a budget is relevant evidence and belongs under volunteering. A hobbies line is not.',
      },
    ],
  },
  rewrites: [
    {
      before:
        'Managed multiple projects simultaneously and ensured they were delivered on time and within budget.',
      after:
        'Ran a €2.4m ERP migration across four European sites — 26 people, three vendors, 14 months — delivered five weeks behind the original plan and 3% under budget after absorbing two scope changes.',
      change:
        'Admitting the five weeks is what makes the rest believable; the rewrite also replaces “multiple projects” with one project the reader can actually size, and states the variance against a baseline rather than claiming perfection.',
    },
    {
      before: 'Responsible for stakeholder management and regular reporting to senior leadership.',
      after:
        'Chaired a fortnightly steering group of nine directors across finance, operations and IT; replaced a 20-page status pack with a one-page decision log, which cut average time-to-decision on escalated issues from three weeks to six days.',
      change:
        'Stakeholder management is the least differentiating phrase in the profession. The rewrite gives the forum a size and a seniority, names the artefact you changed, and measures the thing that actually matters — how fast decisions came back.',
    },
    {
      before: 'Identified and mitigated project risks throughout the delivery lifecycle.',
      after:
        'Flagged a single-supplier dependency on the payment gateway at initiation and ran a parallel integration with a second provider; when the primary vendor slipped its certification date by nine weeks, go-live moved by four days instead of a quarter.',
      change:
        'Risk management only means something as a story with an outcome: the rewrite names the specific risk, the mitigation you chose, the event that actually happened and the difference it made — which is the exact structure of a good interview answer.',
    },
  ],
  ats: {
    intro: [
      'Screening for delivery roles leans heavily on two things: certification acronyms and methodology names. These are short, unambiguous strings, which makes them easy to match — and easy to miss if you have written “certified practitioner in a structured project management method” instead of “PRINCE2 Practitioner”.',
      'Sector vocabulary is the second axis. Regulated environments — financial services, pharmaceutical, public sector, construction — screen for their own terms, and a CV that never says “stage gate”, “GxP”, “OJEU” or “RIBA stage” in a field where they are standard will look like an outsider even when it is not.',
    ],
    groups: [
      {
        group: 'Certifications',
        examples: ['PMP', 'PRINCE2 Practitioner', 'AgilePM', 'MSP', 'Scrum Master', 'SAFe', 'APM PMQ'],
      },
      {
        group: 'Methods',
        examples: ['Agile', 'Scrum', 'Kanban', 'Waterfall', 'hybrid delivery', 'stage gate', 'Lean'],
      },
      {
        group: 'Delivery artefacts',
        examples: ['RAID log', 'business case', 'benefits realisation', 'change control', 'PID', 'critical path'],
      },
      {
        group: 'Tooling',
        examples: ['Jira', 'Confluence', 'MS Project', 'Smartsheet', 'Asana', 'Planview', 'Power BI'],
      },
    ],
    caveat:
      'Treat this as a checklist for terms you have earned, not a list to paste in. Parsing behaviour differs between employers, and in this profession a significant share of shortlisting is done by an agency recruiter skim-reading for budget figures — which no keyword will substitute for.',
  },
  mistakes: [
    {
      title: 'No budget or headcount anywhere on the page',
      description:
        'The single most common failure in project management CVs. Without a size, the reader cannot place you, and the default assumption is the bottom of the range. If the figures are commercially sensitive, use bands.',
    },
    {
      title: 'Everything delivered perfectly',
      description:
        'A career with no variance, no cancelled project and no difficult vendor is not a career, it is a marketing document. Experienced sponsors read it as either inexperience or a lack of candour, and both are worse than a slipped date honestly explained.',
    },
    {
      title: 'Confusing project management with product management',
      description:
        'They are different jobs with different accountabilities — delivery of a defined scope versus ownership of an outcome and a roadmap. Applying to one with the vocabulary of the other is an immediate mismatch signal.',
    },
    {
      title: 'A project list with no outcomes',
      description:
        'Names of systems and initiatives with dates against them tells the reader what you were present for. Each project needs a size, your role in it and what it produced, or it is a timeline rather than evidence.',
    },
    {
      title: 'Certification as the headline',
      description:
        'Leading with PMP or PRINCE2 in the summary, before any delivery, inverts the priority. The certificate gets you through the filter; the delivery record gets you the job. Put the letters after your name and spend the summary on scope.',
    },
  ],
  templates: [
    {
      id: 'corporate-03',
      reason:
        'A tinted band holds your methods, tools and certifications while the wide column carries the project narrative — which is exactly the split a delivery CV needs when the reader wants both the credentials and the story.',
    },
    {
      id: 'corporate-10',
      reason:
        'Numbered accent markers turn the document into an ordered sequence, which suits a career made of discrete projects and keeps a long list of engagements readable.',
    },
    {
      id: 'tech-08',
      reason:
        'Puts three headline outcomes in a bordered row before the reader reaches your history — useful when your strongest argument is two or three named programmes rather than continuity at one employer.',
    },
  ],
  steps: [
    {
      name: 'Build a table of your projects before writing anything',
      text: 'For each one: budget, team size, duration, vendors, sites, your exact role, baseline dates, actual dates, and what it produced. Most of the CV falls out of this table.',
    },
    {
      name: 'Choose the four projects that make your case',
      text: 'Largest, most complex, most relevant to the target sector, and the one that went wrong and was recovered. Give those four real space and compress the rest.',
    },
    {
      name: 'State the variance for each one',
      text: 'Against the original baseline, with the reason in the same sentence. This is the credibility move that most competing CVs will not make.',
    },
    {
      name: 'Add the benefit, not just the delivery',
      text: 'Find out what happened after go-live — adoption, savings, cycle time, decommissioned systems — and add one clause per project. If you never followed up, ask a former colleague.',
    },
    {
      name: 'Put the certifications where they screen and no further',
      text: 'After your name and in a one-line certifications block. Then spend the summary on the size of what you have run.',
    },
  ],
  us: {
    intro:
      'The US delivery market recognises a different certification hierarchy and expects a shorter document, but the underlying content — scope, variance, benefits — travels unchanged.',
    points: [
      'PMP from PMI is the dominant credential; PRINCE2 and APM qualifications are recognised mainly in organisations with a UK or European parent, so spell them out rather than assuming familiarity.',
      'One page is the expectation until around ten to twelve years in, which usually means dropping the separate key-projects block and folding the detail into the two most recent roles.',
      'Convert budgets to USD or state the currency explicitly, and give scale in a form a US reader can parse quickly — headcount and annual run rate rather than day rates.',
      '“Programme manager” is spelled “program manager” and, in US technology companies, often describes a different job closer to cross-team coordination — read the job description carefully before adopting the title.',
    ],
  },
  faq: [
    {
      question: 'Is it worth applying without PMP or PRINCE2?',
      answer:
        'Yes, but you have to compensate on evidence. Certifications are frequently listed as essential and are frequently waived for a candidate with an obviously relevant delivery record — the risk is being filtered before a human sees the record at all. If you have neither, make the budget, headcount and outcome numbers unmissable in the top third of the page, apply directly rather than only through portals where you can, and consider booking the exam so the CV can say “PRINCE2 Practitioner — booked for March”.',
    },
    {
      question: 'How do I write about a project that was cancelled?',
      answer:
        'Straightforwardly, and with what you salvaged. Cancellations are normal and are often the right decision; what a sponsor wants to see is that you recognised it, escalated it and closed it down cleanly. “Recommended stopping the programme at the second stage gate after a supplier failure made the business case unviable; ran the close-down, redeployed six of eight staff and recovered £180k of committed spend” is a stronger entry than most successful projects.',
    },
    {
      question: 'How many projects should actually appear on the CV?',
      answer:
        'Four in detail, the rest as a list at most. A contractor with twenty engagements should group them: “eleven further delivery engagements across insurance and utilities, £200k–£1.5m, 2016–2021” takes two lines and preserves the pattern without spending a page on it. The detailed four should be chosen for relevance to the role you are applying for, not for recency alone.',
    },
    {
      question: 'What if I have run projects without ever having the job title?',
      answer:
        'Then you write the CV around the projects instead of the roles. Plenty of successful project managers came from operations, engineering, finance or clinical backgrounds and delivered substantial change before anyone called them a PM. Use a key-projects section immediately under the summary, describe each with the same budget-team-duration-outcome structure, and let the employment history sit underneath as context rather than as the main event.',
    },
  ],
  related: ['software-engineer', 'marketing-manager', 'accountant'],
  exampleSlug: 'project-manager',
};

export default profession;
