import type { Profession } from '@/types/profession';

const profession: Profession = {
  slug: 'human-resources',
  role: 'HR manager',
  rolePlural: 'HR managers',
  field: 'Finance & operations',
  metaTitle: 'HR CV: What a Hiring Panel Reads When the Candidate Is One of Them',
  metaDescription:
    'An HR CV is read by people who screen CVs for a living. Which numbers carry weight, how to show generalist breadth without vagueness, and three weak bullets rewritten.',
  keywords: [
    'hr cv',
    'human resources cv',
    'hr manager cv',
    'hr curriculum vitae',
    'cv for hr',
    'hr business partner cv',
    'recruitment cv',
  ],
  heading: 'How to write an HR CV',
  intro:
    'This is the only profession where the reader screens CVs professionally. Every shortcut you might take — a rounded headcount figure, a job title that flatters the scope, a two-line gap left unexplained — is one they have caught somebody else using this month. It is a demanding audience, and it is also a predictable one, which makes the page easier to write than it looks.',
  overview: [
    'HR covers work that has almost nothing in common from one role to the next. A recruiter fills roles, an HR business partner advises leaders through restructures and performance cases, a reward specialist runs benchmarking and pay reviews, and an HR generalist in a 60-person company does all three before lunch. "HR manager" tells the reader none of this, so the CV has to.',
    'The second thing to settle early is scale, because it changes what every other line means. Supporting 40 people in one office and supporting 900 across four countries are different jobs with the same title, and the second involves works councils, local employment law and a payroll you do not personally run. Headcount, sites and countries belong near the top of every role.',
    'The third is confidentiality, and it is where most HR CVs go wrong. Your best work is often a case you cannot describe: a settlement, a dismissal that held, a grievance handled so quietly that nobody outside three people knew. The answer is not to omit it — it is to write the shape and the outcome without the identifying detail, which is a skill the reader will recognise immediately because it is one they use themselves.',
  ],
  scanOrder: [
    {
      title: 'Which HR you actually are',
      description:
        'Generalist, business partner, recruitment, reward, ER specialist, HR operations, or the person who is all of them in a small company. This is the first thing looked for and the most frequently left implicit. State it in the profile and let each role make it concrete.',
    },
    {
      title: 'Headcount, sites and countries supported',
      description:
        'The number that scales everything else. "HR business partner, 320 employees across two UK sites and one in Ireland" tells a reader more in one line than three bullets about partnering with stakeholders. Give it for every role, not just the current one.',
    },
    {
      title: 'Employee relations exposure',
      description:
        'How many cases, of what type, and what happened. Disciplinaries, grievances, performance management, redundancy consultation, TUPE, tribunal claims. This is the area employers most fear hiring wrongly for, because the cost of getting it wrong is legal rather than merely operational.',
    },
    {
      title: 'Whether you have run a process end to end',
      description:
        'Advising on a restructure and running one are different jobs. So are supporting a pay review and owning it. The reader is looking for the point at which you stopped assisting and started being accountable — and most CVs blur it, which is why stating it plainly stands out.',
    },
    {
      title: 'Systems, and how deeply',
      description:
        'Workday, SAP SuccessFactors, BambooHR, Personio, Sage, an ATS. Naming the system is table stakes; saying whether you administered it, implemented it or merely used it is the part that distinguishes candidates, because implementation is a project and use is a Tuesday.',
    },
  ],
  metrics: [
    {
      name: 'Headcount supported, with sites and countries',
      detail:
        'The single most useful number on an HR CV. Include it per role so a reader can see the trajectory — 60, then 200, then 900 — which tells a career story that no summary sentence can.',
    },
    {
      name: 'Time to hire and offer acceptance rate',
      detail:
        'For anything recruitment-shaped. Give both, and the volume behind them: "reduced average time to hire from 54 to 38 days across 120 hires a year" is checkable and specific in a way that "improved recruitment efficiency" never is.',
    },
    {
      name: 'Turnover, and voluntary versus total',
      detail:
        'Always split the two. Total turnover after a restructure you ran is not a failure; voluntary turnover in your best team is. HR readers know the difference and will assume the less favourable reading if you do not specify.',
    },
    {
      name: 'ER case volume and outcomes',
      detail:
        'How many cases a year, the mix, and how they concluded — settled, upheld, dismissed, withdrawn, or reached tribunal. Volume alone reads as busy; outcomes read as competent.',
    },
    {
      name: 'Absence, engagement and completion rates',
      detail:
        'Absence percentage before and after an initiative, engagement or eNPS movement with the participation rate beside it, and mandatory training completion. Engagement figures without a response rate are the most common unfalsifiable claim in HR CVs.',
    },
    {
      name: 'Payroll or budget scale',
      detail:
        'The annual payroll you administer or the reward budget you influence, if either is genuinely yours. It is one of the few ways to convey seniority in a function without a P&L.',
    },
  ],
  sectionPlan: {
    order: [
      {
        section: 'Profile',
        note: 'Three lines that name your HR specialism, the size of organisation you operate at, and your strongest area — ER, talent, reward, operations. This is the sentence that stops the reader guessing which of six different jobs you do.',
      },
      {
        section: 'Experience',
        note: 'Straight after the profile, with headcount and scope on the first line of every role. HR is judged on situations handled rather than on qualifications held, so this section carries the page.',
      },
      {
        section: 'Employee relations and casework',
        note: 'Worth pulling out as its own short section if ER is a real part of your work. It is the area with the highest risk attached, and burying it inside role bullets makes a reader hunt for the thing they are most anxious about.',
      },
      {
        section: 'Systems',
        note: 'A compact list, each with the depth attached — implemented, administered, used. Short, factual, and one of the few places a keyword match genuinely helps you.',
      },
      {
        section: 'Qualifications',
        note: 'CIPD level and any employment-law certification, near the top for junior roles and lower once experience speaks for itself. In the UK, CIPD Level 5 or 7 is worth stating explicitly rather than leaving as "CIPD qualified".',
      },
      {
        section: 'Education',
        note: 'Compact unless you are early in your career. Degree, institution, year — the qualification section above matters more to this reader.',
      },
    ],
    drop: [
      {
        section: 'A list of HR competencies',
        note: '"Stakeholder management, communication, confidentiality, attention to detail" describes everyone who has ever worked in HR. It occupies the space where headcount and case volume should be.',
      },
      {
        section: 'Named employees or identifiable cases',
        note: 'Never. An HR reader will notice immediately, and the conclusion they draw is about your judgement rather than about the case. Write the shape and the outcome, not the people.',
      },
      {
        section: 'A personal statement about people',
        note: '"I am passionate about people" is written on a large share of HR CVs and read as noise. The section it displaces is the one where you could have said what you have handled.',
      },
      {
        section: 'Full addresses and personal details',
        note: 'Ironic on an HR CV, and still common. City and country are enough; date of birth, marital status and photograph invite the exact bias your own function exists to prevent.',
      },
    ],
  },
  rewrites: [
    {
      before: 'Responsible for employee relations across the business.',
      after:
        'Handled 40–50 ER cases a year across 320 employees — disciplinaries, grievances and long-term absence — with two proceeding to tribunal and both withdrawn before hearing.',
      change:
        'Replaces a scope statement with volume, population, case mix and outcome. The tribunal detail is the part an HR reader will look for hardest, and volunteering it is more convincing than waiting to be asked at interview.',
    },
    {
      before: 'Improved recruitment processes, reducing time to hire.',
      after:
        'Rebuilt the hiring process for a 120-hire-a-year function: structured scorecards, a two-stage interview replacing four, and agency spend cut by a third. Time to hire fell from 54 to 38 days with offer acceptance steady at 89%.',
      change:
        'Names what was actually changed, gives the volume the change operated on, and pairs the improvement with a metric that could have got worse — acceptance rate — which is what makes the first number believable.',
    },
    {
      before: 'Supported a large restructure and managed stakeholder communications.',
      after:
        'Ran collective consultation for a restructure affecting 60 roles across two sites: consultation timetable, employee representative elections, redeployment into 18 alternative roles, and settlement agreements for the remainder. No claims arising.',
      change:
        'Moves from "supported" to a named accountability, then evidences it with the mechanics only somebody who ran it would list. "No claims arising" is the outcome an employer is actually buying.',
    },
  ],
  ats: {
    intro: [
      'HR is a field where applicant tracking systems are used heavily, by people who understand exactly what they are doing — which cuts both ways. The system still matches on wording, so the target job title needs to appear on your page; but the human reading afterwards is unusually alert to keyword padding, because spotting it is part of their job.',
      'The practical rule is to use the language of the advert where it genuinely describes your work, and to name systems and legislation specifically rather than generically. "TUPE", "collective consultation" and "Workday" are matched; "employment legislation" and "HR systems" are not.',
    ],
    groups: [
      {
        group: 'Specialism',
        examples: [
          'HR business partner',
          'HR generalist',
          'employee relations',
          'talent acquisition',
          'reward and benefits',
          'HR operations',
          'people partner',
        ],
      },
      {
        group: 'Casework and process',
        examples: [
          'disciplinary',
          'grievance',
          'performance management',
          'collective consultation',
          'redundancy',
          'TUPE',
          'settlement agreement',
          'tribunal',
        ],
      },
      {
        group: 'Systems',
        examples: [
          'Workday',
          'SAP SuccessFactors',
          'BambooHR',
          'Personio',
          'Sage People',
          'Greenhouse',
          'HRIS implementation',
        ],
      },
      {
        group: 'Qualifications',
        examples: [
          'CIPD Level 5',
          'CIPD Level 7',
          'Associate CIPD',
          'Chartered MCIPD',
          'employment law certificate',
        ],
      },
    ],
    caveat:
      'No two employers configure their system the same way, and nobody outside a given company knows how its filters are set. Write for the person reading afterwards and the parser follows; write for the parser and the person notices.',
  },
  mistakes: [
    {
      title: 'Describing the function instead of your work',
      description:
        '"The HR team supported the business through a period of change" tells a reader what the department did. They are hiring one person out of it and need to know which part was yours — which is why every bullet should have a subject that is you.',
    },
    {
      title: 'Confidentiality used as a reason to say nothing',
      description:
        'A CV of vague responsibilities with "due to confidentiality" implied throughout reads as a candidate with nothing to point at. The shape of a case and its outcome are not confidential; the names, the department and the dates are. Write the first and omit the second.',
    },
    {
      title: 'Engagement scores without a response rate',
      description:
        '"Raised engagement to 82%" means nothing without knowing whether 19% or 91% of employees responded. An HR reader will ask, so putting the participation rate in the bullet saves the question and signals that you knew it mattered.',
    },
    {
      title: 'Titles that overstate the scope',
      description:
        '"Head of People" in a company of twelve is fine — provided the headcount is on the same line. Left bare beside roles at larger organisations, it invites a comparison you will lose at interview, when the real scale becomes clear in the first five minutes.',
    },
    {
      title: 'A CV that would fail your own screen',
      description:
        'Three pages, a decorative two-column layout, no dates on the early roles. You would reject it. The reader knows you would, and reads the inconsistency as a judgement problem rather than a formatting one.',
    },
  ],
  templates: [
    {
      id: 'corporate-03',
      reason:
        'A conventional single-column layout with clear section rules — right for a function whose readers screen documents professionally and notice anything that looks like it is compensating for thin content.',
    },
    {
      id: 'ats-03',
      reason:
        'Built for parser safety, which matters here because HR functions run applicant tracking systems more consistently than any other department and often apply through their own.',
    },
    {
      id: 'modern-01',
      reason:
        'A restrained modern layout with room for a separate casework or systems block, useful once experience runs past two pages and the page needs structure rather than decoration.',
    },
  ],
  steps: [
    {
      name: 'Name your specialism in the first three lines',
      text: 'Generalist, business partner, recruitment, reward or operations — and the size of organisation you work at. Everything below is read through that sentence.',
    },
    {
      name: 'Put headcount and scope on every role',
      text: 'Employees supported, sites, countries. It is the number that gives every other bullet its meaning, and the one most often missing.',
    },
    {
      name: 'Write casework by volume, mix and outcome',
      text: 'How many cases a year, what kinds, and how they ended. Keep the shape and drop the identifying detail — that omission is itself evidence of judgement.',
    },
    {
      name: 'Pair every improvement with the metric that could have worsened',
      text: 'Time to hire with acceptance rate; absence with headcount; turnover split into voluntary and total. A single flattering number invites the question of what it cost.',
    },
    {
      name: 'Screen it as you would screen a candidate',
      text: 'Two pages, dates on everything, no gaps left unexplained, no decoration doing the work of content. If it would not survive your own sift, it will not survive theirs.',
    },
  ],
  us: {
    intro:
      'US HR résumés differ less than in most fields, because the function is similarly professionalised — but the vocabulary and the compliance context are not the same.',
    points: [
      'Say "resume", keep it to one page below roughly ten years, and expect two pages only for genuinely senior roles.',
      'CIPD means little in the US. SHRM-CP, SHRM-SCP, PHR and SPHR are the recognised credentials, and stating an equivalent is better than assuming one is understood.',
      'The legal furniture is different: FMLA, ADA, FLSA, EEOC and at-will employment replace TUPE, statutory consultation and unfair dismissal. Naming the wrong framework signals that you have not worked in the market.',
      'Never include a photograph, date of birth or marital status — US employers routinely discard CVs carrying them, precisely because possessing that information creates discrimination exposure.',
    ],
  },
  faq: [
    {
      question: 'How do I write about employee relations cases without breaching confidentiality?',
      answer:
        'Write the shape, the volume and the outcome; drop the identity. "Handled 40–50 ER cases a year across a 320-person population, with two reaching tribunal and both withdrawn" contains nothing confidential and tells a reader everything they need. Naming a department, a date and a case type together is enough to identify someone in a small company — which is the line to stay behind.',
    },
    {
      question: 'Should I put my CIPD level on my CV?',
      answer:
        'Yes, and specifically. "CIPD qualified" covers Level 3 through Level 7, which span an administrator and a director. Write "CIPD Level 7 (Chartered MCIPD)" or "CIPD Level 5 (Associate)" — a reader in this field knows exactly what each one means and will assume the lower one if you leave it open.',
    },
    {
      question: 'I do a bit of everything in a small company. How do I present that?',
      answer:
        'Claim it deliberately rather than apologising for it. "Sole HR lead for a 90-person business: recruitment, ER, payroll input, policy and an HRIS implementation" is a strong position — it says you have owned things end to end, which a specialist at a larger organisation often has not. Then give one concrete outcome from each area rather than listing all five as responsibilities.',
    },
    {
      question: 'Does an HR CV need a cover letter?',
      answer:
        'More than most, because your reader is the person who decides how much cover letters count. Use it for the thing the CV cannot carry: why this organisation, and the judgement behind one decision you made. It is also the clearest sample of your written communication a hiring panel will see before interview.',
    },
  ],
  related: ['project-manager', 'accountant', 'marketing-manager'],
};

export default profession;
