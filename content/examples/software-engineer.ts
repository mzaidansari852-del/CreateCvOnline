import { cvDataSchema } from '@/types/cv';
import type { CvExample } from '@/types/cv-example';

/**
 * A mid-level backend engineer's CV.
 *
 * Ids are hand-written rather than generated so the document is byte-identical on every
 * build, which is what lets this page be pre-rendered and cached.
 */
const cv = cvDataSchema.parse({
  personal: {
    firstName: 'Priya',
    lastName: 'Example',
    title: 'Senior Backend Engineer',
    email: 'priya@example.com',
    phone: '+44 20 7946 0102',
    location: 'Manchester, UK',
    website: 'priya.example.com',
    linkedin: 'linkedin.com/in/priya-example',
    github: 'github.com/priya-example',
    photoUrl: '',
    links: [],
  },
  summary:
    'Backend engineer with seven years building and running high-throughput services in Java and Go, most recently owning the shipment tracking platform at a logistics company handling around 4M API requests a day. Strongest on distributed systems that have to stay up: event-driven ingestion, idempotency, and the unglamorous work of making deployments boring. Comfortable being on call for what I build.',
  experience: [
    {
      id: 'se-exp-1',
      role: 'Senior Backend Engineer',
      company: 'Northwind Logistics',
      location: 'Manchester, UK',
      startDate: '2022-04',
      endDate: '',
      current: true,
      description:
        'Own the shipment tracking platform — 11 services, 70 carrier integrations, around 4M API requests and 30M tracking events a day. Team of six engineers; on call one week in four.',
      achievements: [
        'Cut p99 latency on the public tracking API from 850 ms to 210 ms by replacing a per-request currency and carrier lookup with an in-process cache and a nightly refresh job.',
        'Led the migration of 14 services from EC2 to EKS over five months and wrote the Helm conventions the other three teams adopted; deploy frequency went from weekly releases to around 30 a week, and rollback time from 40 minutes to under two.',
        'Rebuilt carrier webhook ingestion as an idempotent Kafka consumer with a replayable dead-letter topic, ending a class of duplicate-delivery incidents that had caused six customer-facing outages in the previous year.',
        'Ran onboarding for four new engineers and rewrote the code review checklist after a post-incident review; median time to first merged pull request for new starters dropped from nine days to three.',
      ],
      tags: ['Java', 'Go', 'Kafka', 'Kubernetes', 'AWS'],
    },
    {
      id: 'se-exp-2',
      role: 'Backend Engineer',
      company: 'Bramble Health',
      location: 'Leeds, UK',
      startDate: '2019-08',
      endDate: '2022-03',
      current: false,
      description:
        'Third engineer on a clinical scheduling product used by 40 GP practices; built the appointments and reminders services in Java and Spring Boot.',
      achievements: [
        'Designed the appointment booking service around optimistic locking after a double-booking defect reached production; the failure mode did not recur in the following two years.',
        'Built the SMS reminder pipeline (RabbitMQ, ~90k messages a week) and worked with two practices to tune send timing, which was associated with a fall in recorded missed appointments from 11% to 7%.',
        'Introduced contract tests between the booking service and the practice management integration, cutting integration defects found in staging by roughly half over three releases.',
      ],
      tags: ['Java', 'Spring Boot', 'RabbitMQ', 'PostgreSQL'],
    },
    {
      id: 'se-exp-3',
      role: 'Software Engineer',
      company: 'Cavendish Systems',
      location: 'Leeds, UK',
      startDate: '2017-09',
      endDate: '2019-07',
      current: false,
      description:
        'Graduate engineer on an internal insurance quoting platform, working across a Java monolith and a small React front end.',
      achievements: [
        'Automated the overnight rate-table import that three analysts had been running by hand, removing about six hours of manual work a week.',
        'Took the on-call rota from four engineers to five and wrote the first runbooks for the two services I owned.',
      ],
      tags: ['Java', 'React'],
    },
  ],
  education: [
    {
      id: 'se-edu-1',
      degree: 'BSc',
      field: 'Computer Science',
      institution: 'University of Sheffield',
      location: 'Sheffield, UK',
      startDate: '2014-09',
      endDate: '2017-06',
      current: false,
      grade: '2:1',
      description: '',
    },
  ],
  skills: [
    { id: 'se-sk-1', name: 'Java (17, 21)', level: 'expert', category: 'Languages' },
    { id: 'se-sk-2', name: 'Go', level: 'advanced', category: 'Languages' },
    { id: 'se-sk-3', name: 'TypeScript', level: 'intermediate', category: 'Languages' },
    { id: 'se-sk-4', name: 'SQL', level: 'advanced', category: 'Languages' },
    { id: 'se-sk-5', name: 'Spring Boot', level: 'expert', category: 'Frameworks' },
    { id: 'se-sk-6', name: 'gRPC & REST', level: 'advanced', category: 'Frameworks' },
    { id: 'se-sk-7', name: 'AWS (EKS, S3, SQS, RDS)', level: 'advanced', category: 'Infrastructure' },
    { id: 'se-sk-8', name: 'Kubernetes & Helm', level: 'advanced', category: 'Infrastructure' },
    { id: 'se-sk-9', name: 'Terraform', level: 'intermediate', category: 'Infrastructure' },
    { id: 'se-sk-10', name: 'GitHub Actions', level: 'advanced', category: 'Infrastructure' },
    { id: 'se-sk-11', name: 'PostgreSQL', level: 'advanced', category: 'Data' },
    { id: 'se-sk-12', name: 'Kafka', level: 'advanced', category: 'Data' },
    { id: 'se-sk-13', name: 'Redis', level: 'intermediate', category: 'Data' },
    { id: 'se-sk-14', name: 'OpenTelemetry & Grafana', level: 'advanced', category: 'Observability' },
  ],
  languages: [],
  projects: [
    {
      id: 'se-proj-1',
      name: 'kafka-replay',
      role: 'Author',
      startDate: '2023-02',
      endDate: '',
      url: 'github.com/priya-example/kafka-replay',
      description:
        'A small CLI for replaying messages from a dead-letter topic with filtering and rate limiting. Written after doing the same thing by hand once too often.',
      highlights: [
        'Used in production at two companies; 340 stars and 9 outside contributors.',
        'Documented failure modes and a test harness that runs against a real broker in CI.',
      ],
      tags: ['Go', 'Kafka', 'Open source'],
    },
  ],
  certifications: [
    {
      id: 'se-cert-1',
      name: 'AWS Certified Solutions Architect – Associate',
      issuer: 'Amazon Web Services',
      date: '2023-06',
      expiryDate: '2026-06',
      credentialId: '',
      url: '',
    },
  ],
  awards: [],
  volunteer: [],
  publications: [],
  interests: [],
  references: [],
  customSections: [],
  sections: [
    { id: 'summary', label: 'Profile', enabled: true },
    { id: 'skills', label: 'Technical Skills', enabled: true },
    { id: 'experience', label: 'Experience', enabled: true },
    { id: 'projects', label: 'Open Source', enabled: true },
    { id: 'education', label: 'Education', enabled: true },
    { id: 'certifications', label: 'Certifications', enabled: true },
    { id: 'languages', label: 'Languages', enabled: false },
    { id: 'awards', label: 'Awards', enabled: false },
    { id: 'volunteer', label: 'Volunteering', enabled: false },
    { id: 'publications', label: 'Publications', enabled: false },
    { id: 'interests', label: 'Interests', enabled: false },
    { id: 'references', label: 'References', enabled: false },
  ],
});

const example: CvExample = {
  slug: 'software-engineer',
  role: 'Software engineer',
  stage: 'Seven years, mid-to-senior',
  metaTitle: 'Software Engineer CV Example, With Commentary',
  metaDescription:
    'A full software engineer CV example you can read section by section, with the summary and four experience bullets reproduced and explained line by line.',
  keywords: [
    'software engineer cv example',
    'developer cv example',
    'backend engineer cv',
    'engineering cv sample',
    'software engineer cv template',
  ],
  heading: 'Software engineer CV example',
  intro:
    'A complete backend engineer CV at around seven years of experience, rendered exactly as it would download. Underneath it, every significant choice is explained — where the skills block sits, why each role opens with a scope line, and how four ordinary responsibilities were turned into bullets a hiring manager can act on.',
  fictionNote:
    'Priya Example is a fictional person. The employers, figures and links are illustrative and exist only to show how a real CV of this kind is put together.',
  templateId: 'tech-01',
  cv,
  summaryNote:
    'Three sentences and no adjectives about being passionate or results-driven. The first gives years, languages and — crucially — a scale figure, so everything below is read against 4M requests a day rather than against nothing. The second names a specialism narrow enough to be a real claim. The third is one line about being on call, which quietly answers a question engineering managers care about and rarely see addressed.',
  bulletNotes: [
    'Opens with the metric that moved and closes with the mechanism, so the reader gets the result in four words and the credibility in the rest. Naming the actual cause — a per-request lookup — is what makes it sound like something that happened rather than something that was written.',
    'Establishes ownership ("led"), scope (14 services), duration (five months) and influence beyond the team (three other teams adopted the conventions). The two operational figures at the end are the payoff, and they are the kind that get asked about in interviews, which is a good sign.',
    'A reliability bullet with a before state. Six customer-facing outages is an uncomfortable number to write down, and including it is precisely why the fix reads as significant. Idempotency and a replayable dead-letter topic are specific enough to prove the work was understood, not just completed.',
    'The people bullet, written as engineering rather than as sentiment. Mentoring is unverifiable; an onboarding process, a rewritten checklist and a team metric that moved from nine days to three are not.',
  ],
  commentary: [
    {
      section: 'The header',
      text: 'Name, title, city, email, phone and three links, all as plain text. No photo, no date of birth, no full postal address — none of them help, and the first two actively hurt in UK and US applications. The GitHub link is here because the profile behind it is maintained; an unlinked profile is better than a neglected one.',
    },
    {
      section: 'Technical skills, placed second',
      text: 'This is the deliberate structural choice on the page. Skills sit directly under the profile, above the job history, because the first read is a matching exercise and the recruiter is checking a list. The block is grouped — languages, frameworks, infrastructure, data, observability — so it can be scanned in a couple of seconds, and the levels are uneven on purpose. A list where everything is "expert" is read as a list where nothing is.',
    },
    {
      section: 'The scope line under each job',
      text: 'Every role opens with one unbulleted line establishing what was owned and how big it was: services, integrations, requests, events, team size, on-call rotation. Without it, a bullet about cutting latency has no context; with it, the reader can size the job in one sentence and every achievement lands harder.',
    },
    {
      section: 'Bullet distribution across the roles',
      text: 'Four bullets on the current role, three on the previous one, two on the first. Attention drops sharply down the page, so the strongest and most recent material gets the space. The 2017 graduate job earns two lines because it shows the starting point of the trajectory, not because anyone will read it closely.',
    },
    {
      section: 'Honest numbers, including the hedged ones',
      text: 'Some figures are exact because they came from a dashboard, and some are softened — "around 4M requests", "roughly half", "was associated with a fall". That mix is deliberate. A CV where every number is suspiciously precise invites the interview question you do not want, and hedging the ones you cannot fully attribute costs nothing while making the rest more believable.',
    },
    {
      section: 'One project, not six',
      text: 'The open-source section holds a single tool with a real reason for existing and evidence that other people use it. Six tutorial repositories would push the employment history down the page and prove nothing. If the project section cannot beat the space it takes from your jobs, cut it.',
    },
    {
      section: 'Education compressed to two lines',
      text: 'Degree, institution, year, classification, and nothing else. Seven years in, the degree is a hygiene check. Modules, societies and the dissertation title all left the CV around year three and the space went to work that pays.',
    },
    {
      section: 'What is deliberately absent',
      text: 'No skill bars, no percentage ratings, no interests, no "references available on request", no two-column sidebar. Each of those would cost space or parsing safety in exchange for decoration, and in a field where the skills list is the filter, that is a bad trade.',
    },
  ],
  lessExperience: [
    'Two or three years in: keep the same structure but drop to one page. Two roles, three bullets each, and skills still directly under the profile.',
    'Replace the scope line with whatever scale you do have — users, records, tickets, services — even if the numbers are small. A precise small number reads better than no number.',
    'With one or two jobs, the projects section moves above education and earns more space: one substantial project with a README, tests and a reason for existing does real work at this stage.',
    'Do not pad with technologies you have touched once. Four things you can be interviewed on is a stronger page than fourteen you have to hedge.',
    'If you came through a bootcamp or a conversion course, state it plainly in the education block. Trying to disguise it reads worse than the route ever does.',
  ],
  usResume: [
    'Cut to one page: drop the 2017 role to a single line, remove the open-source section unless it is directly relevant, and tighten each bullet by a clause.',
    'Rename the file and the document "resume", and drop the "Profile" heading in favour of "Summary".',
    'Remove the classification — "2:1" means nothing to a US reader. Give a GPA only if you graduated recently and it was strong.',
    'Quantify in dollars where money appears, and keep the scale figures (requests, events, users) exactly as they are; those travel unchanged.',
    'Keep the same structural order. US engineering resumes also lead with a skills block, so the one genuinely portable thing here is the shape.',
  ],
  faq: [
    {
      question: 'Should the skills section really go above my experience?',
      answer:
        'For most engineering roles, yes. The first pass is a matching exercise against a requirements list, and putting the answer at the top saves the reader work. The exception is staff, principal or engineering-management applications, where scope and influence are the filter — there, lead with the roles and let the skills block sit after the first two jobs.',
    },
    {
      question: 'Is two pages acceptable for an engineering CV?',
      answer:
        'Outside the US, two pages is normal from around four or five years in and nobody in engineering hiring penalises a well-organised second page. What matters is that the first half of page one carries your current stack, your most recent scope and one result. If the second page is only older roles compressed to a line or two each, it is doing its job.',
    },
    {
      question: 'How do I write bullets like these if my work is under NDA?',
      answer:
        'Describe the shape of the system rather than the product. "A multi-tenant scheduling service for around 300 enterprise customers handling 2M jobs a day" names nobody and tells an engineer everything. Scale, architecture, constraints and your decisions are almost never the confidential part — customer names, revenue figures and unreleased features are.',
    },
    {
      question: 'Can I copy this example and change the details?',
      answer:
        'Use the structure, not the sentences. The scope line, the four-three-two bullet distribution and the before-and-after construction are all worth copying directly. The wording is not: engineering managers read a lot of CVs and recognisable phrasing is noticeable. What persuades anyone is the specifics, and the specifics have to be yours.',
    },
  ],
  relatedExamples: ['project-manager', 'accountant'],
  relatedProfessions: ['software-engineer', 'data-analyst', 'project-manager'],
};

export default example;
