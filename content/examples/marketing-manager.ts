import { cvDataSchema } from '@/types/cv';
import type { CvExample } from '@/types/cv-example';

const cv = cvDataSchema.parse({
  personal: {
    firstName: 'Nadia',
    lastName: 'Example',
    title: 'Marketing Manager — Demand Generation',
    email: 'nadia@example.com',
    phone: '+44 20 7946 0524',
    location: 'London, UK',
    website: 'nadia.example.com',
    linkedin: 'linkedin.com/in/nadia-example',
    github: '',
    photoUrl: '',
    links: [],
  },
  summary:
    'B2B demand generation manager, eight years in SaaS, currently running a £340k paid and lifecycle budget at a 120-person company selling into mid-market operations teams. Took marketing-sourced pipeline from £1.1m to £2.7m in a year while bringing cost per opportunity down 22%. Strongest where paid acquisition meets lifecycle: the handover between the two is where most of the money leaks.',
  experience: [
    {
      id: 'mm-exp-1',
      role: 'Marketing Manager, Demand Generation',
      company: 'Fieldwire Systems',
      location: 'London, UK',
      startDate: '2022-06',
      endDate: '',
      current: true,
      description:
        'B2B SaaS, 120 staff, mid-market operations software, average contract value around £28k. Own a £340k annual budget across paid, lifecycle and events; manage one marketing executive and two agencies.',
      achievements: [
        'Grew marketing-sourced pipeline from £1.1m to £2.7m in twelve months at a 22% lower cost per opportunity, measured on last-touch attribution in HubSpot with a self-reported source field as a cross-check.',
        'Rebuilt the nurture programme from four generic sequences into eleven triggered by product usage and job function; MQL-to-opportunity conversion moved from 9% to 17% over two quarters.',
        'Ran a joint account-based programme with four enterprise reps across 60 named accounts, agreeing a shared qualification definition with sales that ended a long-running argument about lead quality.',
        'Cut paid social spend by 30% after a four-week incrementality test showed most attributed conversions were already in-pipeline, and moved the budget into partner content and events.',
      ],
      tags: ['Demand generation', 'HubSpot', 'ABM', 'Paid media'],
    },
    {
      id: 'mm-exp-2',
      role: 'Digital Marketing Executive → Senior Executive',
      company: 'Brightpath Learning',
      location: 'London, UK',
      startDate: '2019-02',
      endDate: '2022-05',
      current: false,
      description:
        'EdTech, 45 staff, self-serve and small-business plans. Owned paid search and the email programme, reporting to the Head of Growth.',
      achievements: [
        'Took paid search from a £6k to a £22k monthly budget while holding cost per trial flat, largely by restructuring campaigns around intent rather than product name.',
        'Launched the onboarding email sequence that lifted trial-to-paid conversion from 24% to 31%, tested against a holdout group over six weeks.',
        'Wrote and shipped 40 comparison and how-to pages; organic sign-ups grew from roughly 90 to 340 a month over eighteen months.',
      ],
      tags: ['Google Ads', 'SEO', 'Lifecycle'],
    },
    {
      id: 'mm-exp-3',
      role: 'Marketing Assistant',
      company: 'Corven Agency',
      location: 'Reading, UK',
      startDate: '2017-09',
      endDate: '2019-01',
      current: false,
      description:
        'B2B agency work across six retained clients in manufacturing and professional services.',
      achievements: [
        'Ran reporting and campaign execution for six accounts with combined media spend of about £45k a month.',
      ],
      tags: ['Agency', 'B2B'],
    },
  ],
  education: [
    {
      id: 'mm-edu-1',
      degree: 'BA (Hons)',
      field: 'English Literature',
      institution: 'University of Leeds',
      location: 'Leeds, UK',
      startDate: '2014-09',
      endDate: '2017-06',
      current: false,
      grade: '2:1',
      description: '',
    },
  ],
  skills: [
    { id: 'mm-sk-1', name: 'Demand generation strategy', level: 'expert', category: 'Disciplines' },
    { id: 'mm-sk-2', name: 'Lifecycle & nurture', level: 'expert', category: 'Disciplines' },
    { id: 'mm-sk-3', name: 'Paid search & paid social', level: 'advanced', category: 'Disciplines' },
    { id: 'mm-sk-4', name: 'Account-based marketing', level: 'advanced', category: 'Disciplines' },
    { id: 'mm-sk-5', name: 'SEO & content', level: 'intermediate', category: 'Disciplines' },
    { id: 'mm-sk-6', name: 'HubSpot (Marketing Hub, workflows, reporting)', level: 'expert', category: 'Platforms' },
    { id: 'mm-sk-7', name: 'Salesforce', level: 'intermediate', category: 'Platforms' },
    { id: 'mm-sk-8', name: 'Google Ads & LinkedIn Campaign Manager', level: 'advanced', category: 'Platforms' },
    { id: 'mm-sk-9', name: 'GA4 & Google Tag Manager', level: 'advanced', category: 'Analytics' },
    { id: 'mm-sk-10', name: 'Attribution modelling & incrementality testing', level: 'advanced', category: 'Analytics' },
    { id: 'mm-sk-11', name: 'Budget planning & agency management', level: 'advanced', category: 'Commercial' },
  ],
  languages: [
    { id: 'mm-lang-1', name: 'English', level: 'native' },
    { id: 'mm-lang-2', name: 'French', level: 'professional-working' },
  ],
  projects: [],
  certifications: [
    {
      id: 'mm-cert-1',
      name: 'HubSpot Marketing Software Certification',
      issuer: 'HubSpot Academy',
      date: '2023-03',
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
    { id: 'experience', label: 'Experience', enabled: true },
    { id: 'skills', label: 'Channels & Tools', enabled: true },
    { id: 'education', label: 'Education', enabled: true },
    { id: 'certifications', label: 'Certifications', enabled: true },
    { id: 'languages', label: 'Languages', enabled: true },
    { id: 'projects', label: 'Projects', enabled: false },
    { id: 'awards', label: 'Awards', enabled: false },
    { id: 'volunteer', label: 'Volunteering', enabled: false },
    { id: 'publications', label: 'Publications', enabled: false },
    { id: 'interests', label: 'Interests', enabled: false },
    { id: 'references', label: 'References', enabled: false },
  ],
});

const example: CvExample = {
  slug: 'marketing-manager',
  role: 'Marketing manager',
  stage: 'Eight years, B2B SaaS',
  metaTitle: 'Marketing Manager CV Example, With Commentary',
  metaDescription:
    'A full B2B marketing manager CV example, rendered as it would download, with the summary and four experience bullets reproduced and explained line by line.',
  keywords: [
    'marketing manager cv example',
    'marketing cv sample',
    'digital marketing cv example',
    'demand generation cv',
    'b2b marketing cv',
  ],
  heading: 'Marketing manager CV example',
  intro:
    'Marketing CVs are usually the best-written documents in the pile and say the least. This one is deliberately plainer than most and much more specific: a budget figure in the first two lines, an attribution model named next to every pipeline claim, and one bullet about cutting spend rather than growing it.',
  fictionNote:
    'Nadia Example is a fictional person. The employers, budgets and results shown are illustrative and exist only to demonstrate how a CV of this kind is put together.',
  templateId: 'corporate-08',
  cv,
  summaryNote:
    'The budget figure lands in the first sentence, because it is the fastest seniority signal in marketing and the one most often left off. The second sentence pairs a growth number with a cost number, which stops the result reading as something that was simply bought. The third makes a narrow claim about where the candidate is strongest — narrow enough to be false, which is what makes it worth reading.',
  bulletNotes: [
    'The headline result, with the attribution method attached. Naming last-touch in HubSpot and admitting the cross-check is a self-reported field is more persuasive than a clean unexplained number, because every marketing leader knows attribution is messy and is watching to see whether you do.',
    'A funnel-step improvement rather than a volume claim. The mechanism is specific — eleven triggered sequences replacing four generic ones — and the metric that moved is a conversion rate, which cannot be inflated by simply spending more at the top.',
    'The sales-alignment bullet, written as a concrete artefact rather than as "worked closely with sales". A shared qualification definition is a real thing that exists, can be described in an interview, and signals the seniority that adjectives cannot.',
    'A bullet about spending less. Almost nobody includes one, and it is the most senior-sounding line on the page: it shows a test was run, the result was inconvenient, and the budget moved anyway.',
  ],
  commentary: [
    {
      section: 'The title line names the specialism',
      text: '"Marketing Manager — Demand Generation" rather than "Marketing Manager". Marketing is several professions sharing a job title, and a reader hiring for lifecycle, brand or product marketing needs to know within a second whether to keep reading. Specifying costs you the roles you were never going to get.',
    },
    {
      section: 'The context line under each employer',
      text: 'Business model, headcount, what the company sells, average contract value, budget and team. In marketing these five facts change the meaning of everything below them — a 22% CPO improvement at a 120-person B2B SaaS company is a different achievement from the same number at a consumer brand, and the reader cannot calibrate without them.',
    },
    {
      section: 'Attribution stated, not assumed',
      text: 'Every pipeline and revenue claim on this page carries its method: last-touch in HubSpot, a self-reported cross-check, a holdout group, an incrementality test. This is the single most credibility-raising habit available to a marketer writing a CV, and it is rare enough to be distinctive.',
    },
    {
      section: 'A promotion shown as one entry',
      text: 'The Brightpath role is written as "Digital Marketing Executive → Senior Executive" with one set of dates. Splitting a promotion into two entries fragments the achievements and makes the tenure look shorter; showing the progression in the title line keeps the trajectory visible without spending the space twice.',
    },
    {
      section: 'Channels and tools grouped, and placed after the experience',
      text: 'Grouped into disciplines, platforms, analytics and commercial rather than dumped alphabetically, and positioned below the roles because in marketing the numbers do the persuading and the tools are only a filter. Note that "budget planning and agency management" sits in the skills block — it is a genuine capability, not a piece of software.',
    },
    {
      section: 'One certification, no logo wall',
      text: 'Platform certifications age quickly and are widely held. One line is proportionate. What is not on the page: a badge grid, a skills wheel, a colour-coded proficiency chart, or a list of every tool the candidate has ever logged into.',
    },
    {
      section: 'Restraint in the design itself',
      text: 'The template has a two-tone header and then gets out of the way, with the body in a single column. Marketing CVs are the most over-designed documents in professional hiring, and in-house applications at larger companies go through the same parsers as every other function — a decorative sidebar is a poor trade for a scattered set of channel keywords.',
    },
  ],
  lessExperience: [
    'Three or four years in: one page, two roles, and lead with the channel you actually own rather than claiming full-funnel responsibility.',
    'If you have no budget figure of your own, state the budget you executed against and say whose it was — "executed a £180k paid budget owned by the Head of Growth" is honest and still establishes scale.',
    'Replace pipeline claims with the metrics genuinely inside your control: cost per lead, conversion rate on a landing page, open-to-click on a sequence you wrote, organic sessions on pages you shipped.',
    'One test with a proper method beats five campaigns described qualitatively. Even a small holdout group is worth writing up.',
    'Keep the tools list short and honest. At this stage a reader is checking whether you can be useful in their stack next week, not whether you have seen everything.',
  ],
  usResume: [
    'One page. American readers treat a two-page marketing resume as a failure to prioritise, so the agency role compresses to a single line and the certifications go.',
    'Convert budgets and pipeline to USD, or state the currency next to each figure.',
    'Titles inflate faster in the US: a UK marketing manager frequently maps to "Senior Marketing Manager" or "Demand Generation Lead", so describe the scope rather than relying on the title.',
    'Drop the languages section unless the role is genuinely bilingual, and drop the degree classification.',
    'Keep the attribution notes exactly as they are — that habit reads as senior in every market.',
  ],
  faq: [
    {
      question: 'Should I include a marketing portfolio?',
      answer:
        'One link, if there is something worth opening: a campaign write-up, published content, a landing page you wrote and tested. It is expected in content and product marketing, optional in demand generation and rarely asked for in operations roles. What matters is a line of context on each piece — the objective, your role and the result — because a screenshot of an attractive email tells a hiring manager nothing.',
    },
    {
      question: 'What if my company’s attribution was genuinely unreliable?',
      answer:
        'Say so briefly and use what you do trust. "Last-touch in HubSpot, which over-credits paid" is a sentence that makes the rest of your page more believable, not less. Marketing leaders have all had the same arguments internally, and a candidate who can describe the limits of their own data reads as experienced rather than evasive.',
    },
    {
      question: 'How do I show results if I only executed someone else’s strategy?',
      answer:
        'Claim the execution precisely and let the scale speak. "Shipped 40 comparison pages" and "ran the reporting for six accounts at £45k monthly spend" are both true, verifiable and useful. Overclaiming strategy you did not own is easy to catch in an interview — the follow-up question is always about why the strategy was chosen, and there is no good answer if it was not yours.',
    },
    {
      question: 'Is it a problem that the degree is not in marketing?',
      answer:
        'No, and it is extremely common in this field. An English, history or psychology degree is unremarkable on a marketing CV and nobody screens on it once you have a few years of results. Keep it to two lines at the bottom and let the pipeline figures do the work — the only time the degree matters is in your first application or two, and even then the evidence of shipping something matters more.',
    },
  ],
  relatedExamples: ['project-manager', 'software-engineer'],
  relatedProfessions: ['marketing-manager', 'sales-manager', 'graphic-designer'],
};

export default example;
