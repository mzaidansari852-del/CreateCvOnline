import { cvDataSchema } from '@/types/cv';
import type { CvExample } from '@/types/cv-example';

const cv = cvDataSchema.parse({
  personal: {
    firstName: 'Jamie',
    lastName: 'Example',
    title: 'BSc Economics student — graduating July 2027',
    email: 'jamie@example.com',
    phone: '+44 20 7946 0745',
    location: 'Leeds, UK',
    website: '',
    linkedin: 'linkedin.com/in/jamie-example',
    github: '',
    photoUrl: '',
    links: [],
  },
  summary:
    'Second-year economics student at the University of Leeds, graduating July 2027 and looking for a summer 2026 internship in data or commercial analysis. Working 20 hours a week alongside a full-time degree, currently training new staff and planning the rota for a nine-person team. Comfortable in Excel and learning SQL; most of my coursework this year has involved real datasets rather than textbook ones.',
  experience: [
    {
      id: 'st-exp-1',
      role: 'Team Member → Shift Supervisor',
      company: 'The Rowan Coffee House',
      location: 'Leeds, UK',
      startDate: '2024-10',
      endDate: '',
      current: true,
      description:
        'Independent café, around 400 covers a day at weekends. 20 hours a week alongside a full-time degree.',
      achievements: [
        'Promoted to shift supervisor after eight months; now run the rota for a nine-person team and open or close the site three shifts a week.',
        'Trained four new starters using an induction checklist I wrote, which the owner has since adopted for all new staff.',
        'Responsible for the till float and the end-of-day cash reconciliation, with no unexplained variance in fourteen months.',
        'Suggested and set up a pre-order system for the Saturday morning peak, which cut the average queue at 9am from around 12 people to 5.',
      ],
      tags: ['Responsibility', 'Team leadership'],
    },
    {
      id: 'st-exp-2',
      role: 'Summer Intern (Operations)',
      company: 'Wold Valley Farm Shop',
      location: 'York, UK',
      startDate: '2025-06',
      endDate: '2025-08',
      current: false,
      description: 'Eight-week paid summer placement in a 30-person retail and wholesale business.',
      achievements: [
        'Rebuilt the weekly stock report in Excel using Power Query, replacing a manual copy-and-paste process that took about three hours each Monday.',
        'Analysed twelve months of till data to identify the six lines with the highest waste; four were reordered on a smaller cycle and recorded waste on those lines fell over the following two months.',
      ],
      tags: ['Excel', 'Retail'],
    },
  ],
  education: [
    {
      id: 'st-edu-1',
      degree: 'BSc (Hons)',
      field: 'Economics',
      institution: 'University of Leeds',
      location: 'Leeds, UK',
      startDate: '2024-09',
      endDate: '2027-07',
      current: true,
      grade: 'On track for a 2:1 (first-year average 68%)',
      description:
        'Relevant modules: Econometrics (74%), Statistical Methods (71%), Microeconomic Analysis, Data Handling in R. Second-year project: analysis of 210 survey responses on local transport use, mark 74%.',
    },
    {
      id: 'st-edu-2',
      degree: 'A-levels',
      field: 'Mathematics (A), Economics (A), Geography (B)',
      institution: 'Harrogate Sixth Form College',
      location: 'Harrogate, UK',
      startDate: '2022-09',
      endDate: '2024-06',
      current: false,
      grade: '',
      description: '9 GCSEs grades 9–5, including Mathematics (8) and English (7).',
    },
  ],
  skills: [
    { id: 'st-sk-1', name: 'Excel — Power Query, pivot tables, lookups', level: 'advanced', category: 'Data' },
    { id: 'st-sk-2', name: 'R (regression, data cleaning)', level: 'intermediate', category: 'Data' },
    { id: 'st-sk-3', name: 'SQL (SELECT, joins, aggregation)', level: 'beginner', category: 'Data' },
    { id: 'st-sk-4', name: 'Survey design and analysis', level: 'intermediate', category: 'Research' },
    { id: 'st-sk-5', name: 'Rota planning and cash handling', level: 'advanced', category: 'Workplace' },
    { id: 'st-sk-6', name: 'Full UK driving licence', level: 'advanced', category: 'Workplace' },
  ],
  languages: [
    { id: 'st-lang-1', name: 'English', level: 'native' },
    { id: 'st-lang-2', name: 'Spanish', level: 'limited-working' },
  ],
  projects: [],
  certifications: [],
  awards: [],
  volunteer: [
    {
      id: 'st-vol-1',
      role: 'Treasurer, Economics Society',
      organization: 'University of Leeds',
      location: 'Leeds, UK',
      startDate: '2025-09',
      endDate: '',
      current: true,
      description:
        'Manage a £2,400 annual budget for a society of about 180 members: track spending, reconcile the account each term and present the figures at the AGM. Organised a careers evening with four visiting speakers and 90 attendees.',
    },
  ],
  publications: [],
  interests: [],
  references: [],
  customSections: [],
  sections: [
    { id: 'summary', label: 'Profile', enabled: true },
    { id: 'education', label: 'Education', enabled: true },
    { id: 'experience', label: 'Work Experience', enabled: true },
    { id: 'volunteer', label: 'Positions of Responsibility', enabled: true },
    { id: 'skills', label: 'Skills', enabled: true },
    { id: 'languages', label: 'Languages', enabled: true },
    { id: 'projects', label: 'Projects', enabled: false },
    { id: 'certifications', label: 'Certifications', enabled: false },
    { id: 'awards', label: 'Awards', enabled: false },
    { id: 'publications', label: 'Publications', enabled: false },
    { id: 'interests', label: 'Interests', enabled: false },
    { id: 'references', label: 'References', enabled: false },
  ],
});

const example: CvExample = {
  slug: 'student',
  role: 'Student',
  stage: 'Second-year undergraduate, no professional history',
  metaTitle: 'Student CV Example With No Work History',
  metaDescription:
    'A complete student CV example with no professional history, rendered in full — and the reasoning behind every section, including why the café job earns the most space.',
  keywords: [
    'student cv example',
    'cv with no experience example',
    'university cv example',
    'internship cv example',
    'first cv example',
  ],
  heading: 'Student CV example',
  intro:
    'A second-year undergraduate CV with no professional history, written properly. The most instructive thing on the page is that the café job gets four bullets and the degree gets four lines — because at this stage the part-time work is the only evidence that anyone outside a university has ever relied on you.',
  fictionNote:
    'Jamie Example is a fictional person. The employers, grades and figures shown are illustrative and exist only to demonstrate how a CV of this kind is put together.',
  templateId: 'ats-04',
  cv,
  summaryNote:
    'Three sentences that answer the practical questions first: what is being studied, when it finishes, and what is being asked for. The second sentence is the whole argument of the CV compressed into one line — twenty hours a week alongside a full-time degree, with responsibility that grew. The third is honest about the skill levels, including one that is still being learned, which is far more credible at this stage than a list of claimed proficiencies.',
  bulletNotes: [
    'The promotion is the point, and it leads. Being made supervisor after eight months is somebody else’s judgement about your reliability, which is worth more than any adjective you could write about yourself. Note the specifics: nine people, three shifts, opening and closing.',
    'Training people is the most under-used student CV bullet. The detail that lifts it is the induction checklist — an artefact you produced that outlived your involvement, which is a small but real piece of evidence that you improve things rather than just doing them.',
    'Cash handling with a stated period and a clean record. This is a trust bullet, and "no unexplained variance in fourteen months" is exactly the kind of unglamorous, checkable claim that reassures a graduate recruiter.',
    'Initiative with a measurable result, from a job nobody would expect one from. A queue falling from twelve people to five is a genuine operational improvement, and the fact that it happened in a café rather than an office does not make it less real.',
  ],
  commentary: [
    {
      section: 'The title line carries the graduation date',
      text: '"BSc Economics student — graduating July 2027" sits under the name. Internships and graduate schemes recruit against fixed start dates, so this is a practical fact, not a decorative one. A CV that makes a recruiter hunt for the finishing date gets set aside for administrative reasons rather than because of anything you did.',
    },
    {
      section: 'Education above experience — the one time this is right',
      text: 'This is the inverse of a professional CV and it is correct here. The course is the main thing the reader is screening on, and the module marks and project result are genuine evidence. Once you have two or three years of full-time work, education drops to two lines at the bottom and never comes back up.',
    },
    {
      section: 'Modules chosen for relevance, with marks',
      text: 'Four modules, not twelve, and each one connects to the internships being applied for. The marks are included because they are good; if they were not, the module names alone would still be worth listing. The second-year project appears with its sample size and mark, which turns a course requirement into a piece of work.',
    },
    {
      section: 'One experience section, not "relevant" and "other"',
      text: 'Splitting work into relevant and irrelevant quietly labels the café job as filler, and it is the strongest evidence on the page. Both jobs sit in one section in date order and the writing does the work of showing which parts matter.',
    },
    {
      section: 'The society role written as a job',
      text: 'Treasurer of the economics society has a budget, a membership number, a recurring responsibility and an event with an attendance figure. Written like that it is a position of responsibility; written as "member of the economics society" it is attendance. The section is labelled accordingly.',
    },
    {
      section: 'Honest skill levels, including a beginner',
      text: 'SQL is marked as beginner and scoped to what is genuinely known. Overclaiming a technical skill on a student CV is caught in the first ten minutes of an interview, and an honest low rating next to two genuine strengths makes the whole block trustworthy.',
    },
    {
      section: 'A-levels and GCSEs compressed to two lines',
      text: 'A-levels with grades on one line because many graduate schemes still screen on them; GCSEs summarised rather than listed individually. This is the right level of detail for a university student, and both drop off entirely a year or two into a career.',
    },
    {
      section: 'What is deliberately absent',
      text: 'No objective statement about seeking a challenging opportunity in a dynamic organisation. No "hard-working team player with excellent communication skills". No hobbies list. No photo. Every one of those would displace something that is actually evidence, and the page is only one side.',
    },
  ],
  lessExperience: [
    'First year, no job yet: keep education at the top, expand the modules and any project work, and give real space to anything you have organised — a team, a society, a fundraiser, a school leadership role.',
    'Unpaid and caring responsibilities count and should be written with the same specifics: hours, duration, who depended on you, what you were trusted with.',
    'School leaver rather than undergraduate: list GCSEs in full, include work experience placements and part-time hours, and lead with the A-levels or vocational qualification you are taking.',
    'If you have genuinely never worked, build one piece of evidence rather than padding — a small project with a real dataset, a volunteering commitment with a start date, a course with an assessed output.',
    'Keep it to one page whatever stage you are at. A sparse two-page student CV makes the thinness more obvious, not less.',
  ],
  usResume: [
    'One page without exception, and call it a resume — this convention is stricter in the US than anywhere else.',
    'GPA replaces the classification: include it if it is 3.0 or above, and convert or explain the UK marks rather than leaving "68%" for a reader who cannot interpret it.',
    '"Relevant coursework" is a conventional and expected section in US student resumes, so the module list here is already in the right shape.',
    'A-levels and GCSEs mean little; compress them to one line naming the qualification type, or drop the GCSE line entirely.',
    'State your work authorisation plainly, and remove anything approaching a personal detail — no photo, no date of birth, no nationality.',
  ],
  faq: [
    {
      question: 'Is a café job really worth four bullet points?',
      answer:
        'On a student CV, yes. A graduate recruiter is trying to establish whether you turn up on time, cope when things go wrong and get given more responsibility over time. A busy weekend shift is better evidence of all three than most internships, and it is the only part of the page where somebody outside a university made a judgement about you. What is not worth four bullets is the version that says "served customers and handled cash" — the specifics are what make it count.',
    },
    {
      question: 'What if my grades are not strong?',
      answer:
        'Leave them off and let the rest of the page carry the application. There is no obligation to publish a first-year average or a module mark, and a CV without grades draws far less attention than most students fear. What you should not do is leave the course and graduation date off — those are practical facts the recruiter needs. If a scheme screens on a 2:1 and you are below it, the honest answer is to target employers who assess differently rather than to obscure the figure.',
    },
    {
      question: 'Should I write a different CV for every application?',
      answer:
        'Not a different CV, but a reordered one. Keep the same document and change three things per application: the last clause of the profile, which modules are listed, and which bullets appear first in each job. Applying for a data internship, the Excel and R work leads; applying for a client-facing role, the supervisor and training bullets lead. That takes ten minutes and is the highest-return editing you can do at this stage.',
    },
    {
      question: 'Do I need a LinkedIn profile?',
      answer:
        'Only if it is filled in. A link to an empty profile with no photo, no education and no headline is worse than no link at all — it is the first thing a recruiter clicks and it currently says nothing. Twenty minutes fixing the headline, the education entries and the same job descriptions you have written here makes it a genuine asset, and then the link is worth including.',
    },
  ],
  relatedExamples: ['software-engineer', 'marketing-manager'],
  relatedProfessions: ['student', 'data-analyst', 'teacher'],
};

export default example;
