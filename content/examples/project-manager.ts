import { cvDataSchema } from '@/types/cv';
import type { CvExample } from '@/types/cv-example';

const cv = cvDataSchema.parse({
  personal: {
    firstName: 'Marta',
    lastName: 'Example',
    title: 'Senior Project Manager — Business Change',
    email: 'marta@example.com',
    phone: '+44 20 7946 0688',
    location: 'Bristol, UK',
    website: '',
    linkedin: 'linkedin.com/in/marta-example',
    github: '',
    photoUrl: '',
    links: [],
  },
  summary:
    'Senior project manager, eleven years delivering systems and business change in manufacturing and utilities. Largest programme to date: a €2.4m ERP migration across four European sites, 26 people and three vendors over 14 months. I report variance against the original baseline rather than the reforecast, which is usually the more useful number and occasionally the less flattering one.',
  experience: [
    {
      id: 'pm-exp-1',
      role: 'Senior Project Manager',
      company: 'Calder Industrial Group',
      location: 'Bristol, UK',
      startDate: '2021-03',
      endDate: '',
      current: true,
      description:
        'Manufacturing group, 1,400 staff across six sites. Run business-change and systems projects between £400k and £2.5m, reporting to the Transformation Director.',
      achievements: [
        'Delivered a €2.4m ERP migration across four European sites — 26 people, three vendors, 14 months — five weeks behind the original baseline and 3% under budget after absorbing two approved scope changes.',
        'Flagged a single-supplier dependency on the warehouse integration at initiation and ran a parallel proof of concept with a second vendor; when the primary supplier slipped its certification by nine weeks, go-live moved by four days rather than a quarter.',
        'Chaired a fortnightly steering group of nine directors and replaced a 20-page status pack with a one-page decision log, cutting average time-to-decision on escalated issues from three weeks to six days.',
        'Recommended stopping a £600k warehouse automation project at the second stage gate after a supplier failure made the business case unviable; ran the close-down, redeployed six of eight staff and recovered £180k of committed spend.',
      ],
      tags: ['ERP', 'Business change', 'Vendor management'],
    },
    {
      id: 'pm-exp-2',
      role: 'Project Manager',
      company: 'Severnside Water Services',
      location: 'Gloucester, UK',
      startDate: '2016-09',
      endDate: '2021-02',
      current: false,
      description:
        'Regulated utility. Delivered capital and IT projects between £150k and £900k under a stage-gate governance framework, with regulatory reporting obligations at each gate.',
      achievements: [
        'Ran the field-workforce mobile rollout to 240 engineers across three depots — £820k, 11 months — delivered on the baseline date with 94% of engineers active in the first fortnight.',
        'Rebuilt the RAID process across a portfolio of nine projects, introducing a single register and a weekly triage that reduced issues escalated to the programme board by roughly a third.',
        'Managed the transition of a 15-year incumbent supplier contract to a new provider with no service interruption, including a six-week parallel-run period.',
      ],
      tags: ['Stage gate', 'Utilities', 'Rollout'],
    },
    {
      id: 'pm-exp-3',
      role: 'Project Coordinator → Junior Project Manager',
      company: 'Meridian Consulting',
      location: 'Cardiff, UK',
      startDate: '2014-01',
      endDate: '2016-08',
      current: false,
      description:
        'Client-side delivery support on public sector and housing association projects, £80k–£400k.',
      achievements: [
        'Coordinated planning, RAID logs and reporting across four concurrent client projects; promoted to run two of them in year two.',
      ],
      tags: ['Public sector'],
    },
  ],
  education: [
    {
      id: 'pm-edu-1',
      degree: 'BEng (Hons)',
      field: 'Mechanical Engineering',
      institution: 'Cardiff University',
      location: 'Cardiff, UK',
      startDate: '2010-09',
      endDate: '2013-06',
      current: false,
      grade: '2:1',
      description: '',
    },
  ],
  skills: [
    { id: 'pm-sk-1', name: 'Business case & benefits realisation', level: 'expert', category: 'Delivery' },
    { id: 'pm-sk-2', name: 'Stage-gate governance', level: 'expert', category: 'Delivery' },
    { id: 'pm-sk-3', name: 'Vendor & contract management', level: 'advanced', category: 'Delivery' },
    { id: 'pm-sk-4', name: 'RAID and change control', level: 'expert', category: 'Delivery' },
    { id: 'pm-sk-5', name: 'Hybrid Agile/waterfall delivery', level: 'advanced', category: 'Delivery' },
    { id: 'pm-sk-6', name: 'MS Project & Smartsheet', level: 'advanced', category: 'Tools' },
    { id: 'pm-sk-7', name: 'Jira & Confluence', level: 'advanced', category: 'Tools' },
    { id: 'pm-sk-8', name: 'Power BI reporting', level: 'intermediate', category: 'Tools' },
  ],
  languages: [
    { id: 'pm-lang-1', name: 'English', level: 'native' },
    { id: 'pm-lang-2', name: 'Spanish', level: 'professional-working' },
  ],
  projects: [],
  certifications: [
    {
      id: 'pm-cert-1',
      name: 'PRINCE2 Practitioner',
      issuer: 'PeopleCert',
      date: '2017-04',
      expiryDate: '',
      credentialId: '',
      url: '',
    },
    {
      id: 'pm-cert-2',
      name: 'PMP — Project Management Professional',
      issuer: 'PMI',
      date: '2020-09',
      expiryDate: '',
      credentialId: '',
      url: '',
    },
    {
      id: 'pm-cert-3',
      name: 'AgilePM Practitioner',
      issuer: 'APMG International',
      date: '2022-01',
      expiryDate: '',
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
    { id: 'experience', label: 'Delivery Experience', enabled: true },
    { id: 'skills', label: 'Delivery Skills', enabled: true },
    { id: 'certifications', label: 'Certifications', enabled: true },
    { id: 'languages', label: 'Languages', enabled: true },
    { id: 'education', label: 'Education', enabled: true },
    { id: 'projects', label: 'Projects', enabled: false },
    { id: 'awards', label: 'Awards', enabled: false },
    { id: 'volunteer', label: 'Volunteering', enabled: false },
    { id: 'publications', label: 'Publications', enabled: false },
    { id: 'interests', label: 'Interests', enabled: false },
    { id: 'references', label: 'References', enabled: false },
  ],
});

const example: CvExample = {
  slug: 'project-manager',
  role: 'Project manager',
  stage: 'Eleven years, business change and systems',
  metaTitle: 'Project Manager CV Example, With Commentary',
  metaDescription:
    'A senior project manager CV example rendered in full, with the summary and four experience bullets reproduced and explained — including why the slipped date stays in.',
  keywords: [
    'project manager cv example',
    'project management cv sample',
    'prince2 cv example',
    'pmp cv example',
    'delivery manager cv',
  ],
  heading: 'Project manager CV example',
  intro:
    'The job title tells a reader almost nothing in this profession, so this CV is built to answer one question fast: how big are the things this person has run, and did they land? Every project on the page carries a budget, a headcount, a duration and a variance — including the one that slipped and the one that was cancelled.',
  fictionNote:
    'Marta Example is a fictional person. The employers, budgets and project outcomes shown are illustrative and exist only to demonstrate how a CV of this kind is constructed.',
  templateId: 'corporate-03',
  cv,
  summaryNote:
    'The largest programme appears in the second sentence with all four sizing facts attached — value, sites, headcount, duration — because that single line does more than a paragraph of methodology vocabulary. The third sentence is unusual and deliberate: stating that variance is reported against the original baseline rather than the reforecast tells an experienced sponsor exactly what kind of project manager they are dealing with.',
  bulletNotes: [
    'The flagship project, sized four ways and then reported honestly. Admitting the five weeks is what makes the rest of the page believable — a sponsor knows a whole career of on-time delivery does not happen, and the phrase "after absorbing two approved scope changes" is the professional way to explain a slip without excusing it.',
    'A risk bullet written as a story with an outcome. Generic risk-management claims are worthless; this one names the specific dependency, the mitigation chosen at initiation, the event that actually occurred and the difference the mitigation made. It is also, structurally, a ready-made interview answer.',
    'Governance reframed as something that changed. "Chaired a steering group" is attendance; replacing a 20-page pack with a one-page decision log and measuring the effect on decision speed is a demonstrable improvement to how the organisation ran.',
    'The cancelled project, included on purpose. Stopping something at a stage gate for the right reason, then closing it down cleanly and recovering committed spend, demonstrates judgement that no successful delivery can show. Most candidates leave these off; it is usually a mistake.',
  ],
  commentary: [
    {
      section: 'Certifications visible but not leading',
      text: 'PRINCE2, PMP and AgilePM sit in the sidebar where a screener can find them in a second. They are not in the summary, because certifications are a filter rather than a reason to hire — the letters get the CV past the sift, and the budget figures get the interview. Inverting that order is the most common structural error in project management CVs.',
    },
    {
      section: 'The context line under each employer',
      text: 'Sector, company size, the value band of the projects run and the reporting line. This lets a reader place the whole role before reading a bullet, and it explains why the same job title covers a £150k rollout in one entry and a €2.4m programme in another.',
    },
    {
      section: 'Every project sized the same way',
      text: 'Value, headcount, duration, vendors, sites. Once the reader learns the pattern in the first bullet, they can size each subsequent project at a glance. Consistency is itself a signal in this profession — the CV reads like something produced by a person who keeps a register.',
    },
    {
      section: 'Variance reported against the baseline',
      text: 'Five weeks late, 3% under budget, on the baseline date, no service interruption. Each project carries an outcome measured against something. This is the section of the document that separates a delivery record from a work history, and the honesty in it is the reason the good numbers are credible.',
    },
    {
      section: 'A two-column layout, chosen deliberately',
      text: 'The sidebar holds skills, certifications and languages — short, self-contained blocks — while the wide column runs the narrative. Two columns are riskier in a parser than one, which is an acceptable trade here because delivery roles are often filled through agencies and direct approaches. For a large corporate portal, the same content in a single-column template is the safer send.',
    },
    {
      section: 'Methodology named per project, not listed as a set',
      text: 'There is no paragraph claiming Agile, Waterfall, Scrum, Kanban, Lean, SAFe and hybrid all at once. Stage-gate governance appears where it was used, hybrid delivery appears as a skill, and the certifications carry the rest. Naming the method where it was applied is a claim; listing nine of them together is not.',
    },
    {
      section: 'A promotion kept as one entry',
      text: 'The early role reads "Project Coordinator → Junior Project Manager" with a single date range. Splitting it would fragment a short period into two thin entries and make the tenure look unstable; the arrow shows the progression in four characters.',
    },
  ],
  lessExperience: [
    'Four or five years in: keep the sizing discipline exactly as it is, but expect smaller numbers. A £120k project run properly, reported with its variance, is more convincing than a vague association with a large programme.',
    'If you have run projects without the job title — in operations, engineering, clinical or finance roles — put a "Key projects" section directly under the summary and let the employment history sit beneath it as context.',
    'Without a certification, make the budget and outcome figures unmissable in the top third of the page, and consider adding "PRINCE2 Practitioner — exam booked for March" if that is true.',
    'One page until roughly six or seven years. Compress the coordinator roles to a line each and give the space to the two largest deliveries.',
    'Include a project that went badly and was recovered. Early-career CVs are the ones most likely to read as uniformly successful, and that is exactly when a sponsor becomes sceptical.',
  ],
  usResume: [
    'PMP is the dominant credential in the US: keep it, spell out PRINCE2 and AgilePM in full, and do not assume either is recognised.',
    'One page until around ten to twelve years, which here means folding the third role into a single line and trimming the sidebar.',
    'Convert budgets to USD or state the currency next to each figure, and give team size as headcount rather than day rates.',
    '"Programme" becomes "program", and be careful with the title: in US technology companies a "program manager" often does cross-team coordination rather than capital delivery.',
    'Keep the variance reporting. It is unusual in every market and it works in all of them.',
  ],
  faq: [
    {
      question: 'Should I really put a late project on my CV?',
      answer:
        'Yes, if you can explain it in a clause. Experienced sponsors read a perfect record as either a junior career or a lack of candour, and both are worse than a slip with a reason. The framing that works is variance against the original baseline plus what caused it — "five weeks behind after absorbing two approved scope changes" is an entirely respectable outcome, and it makes every other number on your page more believable.',
    },
    {
      question: 'Do I need a separate "key projects" section?',
      answer:
        'It depends on how your career is shaped. Contractors and consultants should almost always have one, because the employer list hides the work and a reader cannot see what was actually delivered. Permanent staff with two or three long tenures usually do better keeping the project detail inside each role, as this example does — a separate section would repeat the same information twice and cost half a page.',
    },
    {
      question: 'How do I handle budgets that are commercially confidential?',
      answer:
        'Use bands and say that is what you are doing. "Projects between £400k and £2.5m" communicates almost everything a reader needs and discloses nothing specific. The same applies to client names: "a FTSE 250 manufacturer" or "a regulated water utility" places the work without breaching an agreement. What does not work is omitting scale entirely, because the reader will assume the bottom of the range.',
    },
    {
      question: 'How many projects should be on the page?',
      answer:
        'Four in detail, and the rest grouped. This example describes four properly and lets the earlier roles carry one line each. If you have twenty engagements, a single summarising line — "eleven further delivery engagements across insurance and utilities, £200k–£1.5m, 2016–2021" — preserves the pattern without spending a page on it. Choose the detailed four for relevance to the role you are applying for, not for recency.',
    },
  ],
  relatedExamples: ['software-engineer', 'accountant'],
  relatedProfessions: ['project-manager', 'accountant', 'software-engineer'],
};

export default example;
