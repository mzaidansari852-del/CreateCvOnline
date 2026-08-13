import { cvDataSchema } from '@/types/cv';
import type { CvExample } from '@/types/cv-example';

const cv = cvDataSchema.parse({
  personal: {
    firstName: 'Daniel',
    lastName: 'Example',
    title: 'Management Accountant, ACCA',
    email: 'daniel@example.com',
    phone: '+44 20 7946 0311',
    location: 'Birmingham, UK',
    website: '',
    linkedin: 'linkedin.com/in/daniel-example',
    github: '',
    photoUrl: '',
    links: [],
  },
  summary:
    'ACCA-qualified management accountant with six years in industry, currently running the month-end close for three trading entities with £46m combined turnover in GBP and EUR. Took the close from nine working days to five and rebuilt the balance sheet reconciliation pack that the finance team still runs on. NetSuite and Excel to model-building depth; comfortable owning the audit relationship.',
  experience: [
    {
      id: 'ac-exp-1',
      role: 'Management Accountant',
      company: 'Harlow Foods Group',
      location: 'Birmingham, UK',
      startDate: '2022-01',
      endDate: '',
      current: true,
      description:
        'Three trading entities, £46m combined turnover, GBP and EUR reporting under FRS 102. Reporting to the Financial Controller in a finance team of nine; responsible for close, management accounts and the audit pack.',
      achievements: [
        'Cut the month-end timetable from nine working days to five by automating intercompany reconciliations and the accruals journal in NetSuite, with no increase in post-close adjustments.',
        'Inherited a balance sheet with 40 unreconciled control accounts and cleared it to nil over two quarters; wrote the monthly reconciliation pack now used across all three entities, and the following audit raised no adjustments on those accounts.',
        'Owned the audit deliverables for a £46m group audit, delivering all 31 requested schedules by day three of fieldwork and closing both prior-year management letter points on revenue cut-off.',
        'Rebuilt the rolling 13-week cash forecast in Power Query against live bank feeds; forecast variance at week four fell from an average of 14% to under 5% across two quarters.',
      ],
      tags: ['NetSuite', 'FRS 102', 'Month-end close'],
    },
    {
      id: 'ac-exp-2',
      role: 'Assistant Management Accountant',
      company: 'Redbourne Retail',
      location: 'Coventry, UK',
      startDate: '2019-09',
      endDate: '2021-12',
      current: false,
      description:
        'Single entity, £18m turnover, 22 stores. Part-qualified through this role, funded and supported by the employer.',
      achievements: [
        'Produced the monthly management accounts pack for 22 store P&Ls, including variance commentary presented to the regional managers each period.',
        'Took over the quarterly VAT return and the partial exemption calculation, resolving a recurring input tax error that had generated three prior HMRC queries.',
        'Moved stock reporting out of a shared spreadsheet into Sage 200, removing a manual month-end step that had taken about a day and a half.',
      ],
      tags: ['Sage 200', 'VAT', 'Management accounts'],
    },
    {
      id: 'ac-exp-3',
      role: 'Audit Associate',
      company: 'Whitlock & Payne',
      location: 'Coventry, UK',
      startDate: '2018-01',
      endDate: '2019-08',
      current: false,
      description:
        'Mid-tier practice. Statutory audit and accounts preparation for owner-managed businesses, £1m–£30m turnover, mainly manufacturing and wholesale.',
      achievements: [
        'Worked on 14 statutory audits across the year, leading fieldwork on four with turnover up to £8m.',
        'Prepared statutory accounts and corporation tax computations under FRS 105 and FRS 102 for 20+ clients.',
      ],
      tags: ['Statutory audit', 'FRS 102'],
    },
  ],
  education: [
    {
      id: 'ac-edu-1',
      degree: 'BA (Hons)',
      field: 'Accounting and Finance',
      institution: 'University of Birmingham',
      location: 'Birmingham, UK',
      startDate: '2014-09',
      endDate: '2017-06',
      current: false,
      grade: '2:1',
      description: '',
    },
  ],
  skills: [
    { id: 'ac-sk-1', name: 'NetSuite (GL, AP, AR, multi-currency)', level: 'advanced', category: 'ERP' },
    { id: 'ac-sk-2', name: 'Sage 200', level: 'advanced', category: 'ERP' },
    { id: 'ac-sk-3', name: 'Xero', level: 'intermediate', category: 'ERP' },
    { id: 'ac-sk-4', name: 'Excel — Power Query, Power Pivot, model auditing', level: 'expert', category: 'Reporting' },
    { id: 'ac-sk-5', name: 'Power BI', level: 'intermediate', category: 'Reporting' },
    { id: 'ac-sk-6', name: 'FRS 102 and FRS 105', level: 'advanced', category: 'Standards' },
    { id: 'ac-sk-7', name: 'VAT returns and partial exemption', level: 'advanced', category: 'Standards' },
    { id: 'ac-sk-8', name: 'Corporation tax computations', level: 'intermediate', category: 'Standards' },
  ],
  languages: [],
  projects: [],
  certifications: [
    {
      id: 'ac-cert-1',
      name: 'ACCA — Association of Chartered Certified Accountants, full member',
      issuer: 'ACCA',
      date: '2021-11',
      expiryDate: '',
      credentialId: '',
      url: '',
    },
    {
      id: 'ac-cert-2',
      name: 'AAT Level 4 Diploma in Professional Accounting',
      issuer: 'AAT',
      date: '2018-06',
      expiryDate: '',
      credentialId: '',
      url: '',
    },
  ],
  awards: [],
  volunteer: [
    {
      id: 'ac-vol-1',
      role: 'Honorary Treasurer',
      organization: 'Moseley Community Sports Trust',
      location: 'Birmingham, UK',
      startDate: '2021-04',
      endDate: '',
      current: true,
      description:
        'Prepare annual accounts and quarterly management figures for a registered charity with income of about £120k, and present them to a board of seven trustees.',
    },
  ],
  publications: [],
  interests: [],
  references: [],
  customSections: [],
  sections: [
    { id: 'summary', label: 'Profile', enabled: true },
    { id: 'certifications', label: 'Professional Qualification', enabled: true },
    { id: 'experience', label: 'Experience', enabled: true },
    { id: 'skills', label: 'Systems & Technical', enabled: true },
    { id: 'education', label: 'Education', enabled: true },
    { id: 'volunteer', label: 'Voluntary Roles', enabled: true },
    { id: 'languages', label: 'Languages', enabled: false },
    { id: 'projects', label: 'Projects', enabled: false },
    { id: 'awards', label: 'Awards', enabled: false },
    { id: 'publications', label: 'Publications', enabled: false },
    { id: 'interests', label: 'Interests', enabled: false },
    { id: 'references', label: 'References', enabled: false },
  ],
});

const example: CvExample = {
  slug: 'accountant',
  role: 'Accountant',
  stage: 'ACCA-qualified, six years in industry',
  metaTitle: 'Accountant CV Example, With Commentary',
  metaDescription:
    'A complete ACCA-qualified accountant CV example, rendered in full, with the summary and four experience bullets reproduced and explained line by line.',
  keywords: [
    'accountant cv example',
    'acca cv example',
    'management accountant cv',
    'finance cv sample',
    'accounting cv template',
  ],
  heading: 'Accountant CV example',
  intro:
    'A qualified management accountant’s CV as it would actually download, with the reasoning underneath. Finance recruitment filters on three facts before anyone reads a sentence — qualification, ledger scope and systems — and the whole layout of this document is arranged around putting all three in front of the reader within about ten seconds.',
  fictionNote:
    'Daniel Example is a fictional person. The employers, figures and qualifications shown are illustrative and exist only to demonstrate how a CV of this kind is constructed.',
  templateId: 'ats-05',
  cv,
  summaryNote:
    'Four facts in four sentences, in the order a finance reader wants them: qualification and years, the ledger scope with turnover and currencies, one measurable improvement, and the systems. Nothing here is an adjective. The last clause — "comfortable owning the audit relationship" — is doing a specific job, because it answers the question a controller has about whether they will have to supervise the audit themselves.',
  bulletNotes: [
    'Every management accountant runs a close, so the differentiator is speed and scope. This states both, names the mechanism, and adds the clause that pre-empts the obvious objection: the timetable did not get shorter by pushing errors into the next period.',
    'A recovery story with a starting condition, a size, a finish line and — crucially — an independent verdict. The audit outcome is as close to third-party verification as anything on an accounting CV gets, which is why it belongs in the same sentence.',
    'Audit work is usually written as "liaised with auditors", which describes presence rather than responsibility. This names the standard of the engagement, the volume delivered, the speed, and the two specific findings that were closed.',
    'A cash bullet, because finance directors care about cash more than almost anything else on this page. The tool is named, the horizon is stated, and the improvement is expressed as forecast variance rather than as "improved accuracy".',
  ],
  commentary: [
    {
      section: 'Designatory letters in the job title',
      text: '"Management Accountant, ACCA" appears in the header before anything else. Qualification stage is the first hard filter in finance recruitment, and a reader who has to reach a certifications block on page two to find it has already been made to work. This is why the document uses the title line rather than saving it for later.',
    },
    {
      section: 'The qualification section, second on the page',
      text: 'Directly under the profile, where most professions would put nothing. Both the acronym and the full name appear once — "ACCA — Association of Chartered Certified Accountants" — because screening systems in this field match on the string, and the two forms are not interchangeable. The AAT route is included because it explains the path into the profession.',
    },
    {
      section: 'The scope line under each employer',
      text: 'Entities, turnover, currencies, reporting standard, team size and who the role reports to. These six facts are what let a reader decide whether this candidate has run something like their ledger, and they do more work than any single bullet. Note that the scope line names FRS 102 — the standard, like the ERP, is a genuine screening term.',
    },
    {
      section: 'Systems given their own section',
      text: 'Grouped into ERP, reporting and standards rather than listed alphabetically, and specific about depth: "Excel — Power Query, Power Pivot, model auditing" rather than "Excel (advanced)", which every accountant writes and nobody can distinguish. Finance teams filter hard on system match, so vagueness here costs applications.',
    },
    {
      section: 'Practice experience translated for industry',
      text: 'The audit role at the bottom is described in the language of the ledger rather than the language of the practice: turnover ranges, sectors, standards, number of audits and how many were led. A reader in industry cannot interpret "managed a portfolio of clients", but they can interpret "£1m–£30m turnover, mainly manufacturing and wholesale".',
    },
    {
      section: 'A voluntary role that is evidence, not a hobby',
      text: 'The treasurer position is on the page because it is unpaid financial responsibility with a board and a set of accounts attached — it evidences exactly what the CV is claiming. A hobbies line would not have earned the space, which is why there is not one.',
    },
    {
      section: 'What is deliberately absent',
      text: 'No photograph, no "attention to detail" in a skills list, no referee contact details, and no interests. In finance those four are the standard filler, and every one of them displaces something a hiring manager would actually use.',
    },
  ],
  lessExperience: [
    'Part-qualified: put the exam status directly under the profile and be precise — "ACCA, 11 of 13 papers passed, finalist expected September 2026". Vagueness here is read as bad news being hidden.',
    'One page, two roles, three bullets each. Keep the scope line under each employer even if the numbers are small; a £4m single-entity ledger is still a ledger a reader can size.',
    'If you have not measured your close timetable, count it next month and quote it. It is the single most useful number you can add to an early-career accounting CV.',
    'Keep the practice roles described in industry language from the start, even while you are still in practice — it costs nothing and makes the eventual move easier.',
    'Where you have taken over a process rather than improved one, say what state it was in when you inherited it. Inheriting a mess and stabilising it is a real achievement at any level.',
  ],
  usResume: [
    'CPA is the reference credential. State ACCA in full once and add any progress towards a US licence or reciprocity, because the acronym alone will not be assumed.',
    'Say explicitly which framework you have reported under. This example says FRS 102; a US reader needs "US GAAP" or "IFRS" spelled out, and SOX experience named if you have it.',
    'Cut to one page: the practice role compresses to two lines and the voluntary role usually goes.',
    'Translate the job title — "management accountant" has no clean US equivalent, and "Senior Financial Analyst" or "Cost Accountant" often describes the same work more legibly.',
    'Give figures in USD or state the reporting currency next to the number, and drop the degree classification.',
  ],
  faq: [
    {
      question: 'Should the qualification really come before my experience?',
      answer:
        'In finance, yes — it is a screening criterion rather than a nice-to-have, and a large share of vacancies specify it as essential. Putting it second on the page costs four lines and removes any risk of a recruiter setting the CV aside because they could not find it quickly. Once you have been qualified for a decade or more it can drop below the experience, since by then the record speaks louder than the letters.',
    },
    {
      question: 'How do I quantify my work if I only handle part of the ledger?',
      answer:
        'Quantify the part you handle. Transaction volume, number of accounts reconciled, value of the payment runs you process, entities you support, the size of the P&Ls you report on. "Processed a weekly payment run of around £1.8m across 300 suppliers" is a scope statement and it is entirely within your own remit. The mistake is assuming that only whole-company figures count.',
    },
    {
      question: 'Is it worth naming every system I have used?',
      answer:
        'Name the ones you could work in unsupervised, then add a short "exposure to" line for the rest. System match matters enough in finance hiring to be worth the space, but overclaiming is caught immediately — the first technical question in the interview is very often about the ERP you listed, and a shaky answer damages the whole page.',
    },
    {
      question: 'How much detail should the practice experience have?',
      answer:
        'Enough for an industry reader to size it, and no more. Sectors, turnover ranges, standards, how many audits you worked on and how many you led. What does not travel is practice-internal vocabulary — grade names, portfolio counts, chargeable hours — which means something specific inside a firm and almost nothing to a financial controller in a food manufacturer.',
    },
  ],
  relatedExamples: ['project-manager', 'software-engineer'],
  relatedProfessions: ['accountant', 'data-analyst', 'project-manager'],
};

export default example;
