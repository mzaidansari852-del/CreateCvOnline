import type { Profession } from '@/types/profession';

const profession: Profession = {
  slug: 'accountant',
  role: 'Accountant',
  rolePlural: 'accountants',
  field: 'Finance & operations',
  metaTitle: 'Accountant CV: Qualification and Ledger Scope',
  metaDescription:
    'An accountant CV is filtered on three things before anyone reads a sentence: qualification stage, the size of the ledger you handle, and the systems you work in.',
  keywords: [
    'accountant cv',
    'accounting cv example',
    'acca cv',
    'finance cv',
    'management accountant cv',
    'part qualified accountant cv',
  ],
  heading: 'How to write an accountant CV',
  intro:
    'Finance recruitment filters harder and earlier than most fields. Before a single bullet point is read, three facts decide whether your CV stays in the pile: where you are with your qualification, how big and how complex the ledger you handle is, and which system you handle it in.',
  overview: [
    'That filtering is not laziness. A practice hiring a newly qualified auditor and an owner-managed business hiring its first management accountant are looking for genuinely different people, and both can tell within seconds whether you are one of them. Making the reader hunt for your exam status or your ERP is the most common self-inflicted wound on an accounting CV.',
    'The second problem is that almost every accountant does the same set of things. Everybody runs a close. Everybody reconciles. What differentiates one candidate from another is scope, speed and control quality — and those are the three dimensions most CVs in this field leave completely unquantified.',
  ],
  scanOrder: [
    {
      title: 'Qualification and where you are in it',
      description:
        'ACA, ACCA, CIMA, CPA or AAT, and whether you are qualified, finalist or part-qualified with a stated number of papers remaining. This is a hard filter for most finance vacancies, so it belongs in the header area or the first two lines of the summary — never buried in a certifications block on page two.',
    },
    {
      title: 'The size and shape of what you account for',
      description:
        'Turnover, number of entities, currencies, whether the group consolidates, transaction volume, headcount you support. A reviewer is working out whether your ledger looks like their ledger, because that is what determines how long you take to be useful.',
    },
    {
      title: 'The systems you work in',
      description:
        'SAP, Oracle, NetSuite, Sage, Xero, QuickBooks, Workday, plus the reporting layer and how far into Excel or Power Query you go. Finance teams filter hard on system experience, more than almost any comparable field, because the migration cost of a bad match falls on them.',
    },
    {
      title: 'Close discipline and control evidence',
      description:
        'Only then does anyone read your bullets, and what they are looking for is whether the numbers arrive on time and whether they hold up: working days to close, audit adjustments, control findings, restatements. This is where a good accounting CV separates itself.',
    },
  ],
  metrics: [
    {
      name: 'Working days to close, and the trend',
      detail:
        'The most useful single figure in a management accounting CV. “Reduced the timetable from nine working days to five” shows scope, control and initiative in one clause. Report the direction of travel, not just the current state.',
    },
    {
      name: 'Entity and ledger scope',
      detail:
        'Combined turnover, number of legal entities, reporting currencies, intercompany relationships, transaction volume per month. These numbers are how a reader calibrates every other claim on the page.',
    },
    {
      name: 'Audit and control outcomes',
      detail:
        'Number of audit adjustments, management letter points closed, first clean audit, control weaknesses remediated, SOX or equivalent testing passed. Say what improved rather than that you “liaised with auditors”.',
    },
    {
      name: 'Cash and working capital',
      detail:
        'Debtor days, aged debt cleared, DSO movement, forecast accuracy against actuals. Where the role touches cash at all, this is the number a finance director cares about most.',
    },
  ],
  sectionPlan: {
    order: [
      {
        section: 'Contact and qualification line',
        note: 'Name, designatory letters if you hold them, city, phone, email. “Priya Shah ACCA” in the header answers the first filter before the reader has finished the first line.',
      },
      {
        section: 'Summary — three or four lines',
        note: 'Qualification stage, sector, the scale you are used to, and the part of the cycle you own. This is the only place a career-changer or a practice-to-industry move gets explained.',
      },
      {
        section: 'Professional qualification',
        note: 'High on the page for anyone part-qualified or recently qualified: body, status, papers passed and remaining, expected completion. Vagueness here is read as bad news.',
      },
      {
        section: 'Experience',
        note: 'Reverse chronological, with a scope line under each employer — turnover, entities, team size — before the bullets. The scope line does more work than any single bullet.',
      },
      {
        section: 'Systems and technical skills',
        note: 'ERP, consolidation and reporting tools, Excel depth stated concretely (Power Query, Power Pivot, VBA if genuinely used), and the reporting standards you work under.',
      },
      {
        section: 'Education',
        note: 'Two lines. Degree, institution, year. Relevant only as a hygiene check once you are qualified.',
      },
    ],
    drop: [
      {
        section: 'A skills list of adjectives',
        note: '“Attention to detail”, “analytical” and “team player” appear on essentially every accounting CV submitted anywhere and therefore distinguish nothing.',
      },
      {
        section: 'Interests',
        note: 'Rarely earns its space in finance. The exception is a genuine, verifiable treasurer or trustee role, which belongs under volunteering as evidence of responsibility rather than under hobbies.',
      },
      {
        section: 'A photograph',
        note: 'Conventional in some European and North African markets and unusual in UK and US finance recruitment. Where you are unsure, leaving it off never costs you anything.',
      },
      {
        section: 'Full referee details',
        note: 'Nobody contacts referees at CV stage, and printing a former financial controller’s mobile number is a small data-protection problem you do not need.',
      },
    ],
  },
  rewrites: [
    {
      before: 'Responsible for month-end close and preparation of management accounts.',
      after:
        'Ran month-end close for three entities (£46m combined turnover, GBP and EUR), cutting the timetable from nine working days to five by automating intercompany reconciliations in NetSuite.',
      change:
        'Every accountant runs the close, so the rewrite replaces the duty with the three things that differ between candidates: how much ledger, in what systems, and how quickly — with a before and after on the timetable.',
    },
    {
      before: 'Performed balance sheet reconciliations and resolved discrepancies.',
      after:
        'Took over a balance sheet with 40 unreconciled control accounts and cleared it to zero over two quarters, writing the monthly reconciliation pack the team still uses; the following audit raised no adjustments on those accounts.',
      change:
        'The original describes a routine task; the rewrite gives the task a starting condition, a size, a finish line and an independent verdict — the audit outcome — which is the closest thing to third-party proof an accountant can put on a page.',
    },
    {
      before: 'Assisted with the annual audit and liaised with external auditors.',
      after:
        'Owned the audit deliverables pack for a £120m group audit under IFRS, delivering all 31 requested schedules by day three of fieldwork and closing the two prior-year management letter points on revenue cut-off.',
      change:
        '“Assisted” and “liaised” describe presence rather than responsibility; the rewrite names the standard, the size of the audit, the volume of work delivered, the speed and the specific findings that were closed.',
    },
  ],
  ats: {
    intro: [
      'Finance vacancies attract high application volumes, and the screening tends to be built around three literal things: the qualification acronym, the ERP name and the reporting standard. Those are the terms most likely to be matched exactly, and the ones most likely to be missing from a CV that describes the work perfectly well in other words.',
      'So write the qualification in both forms the first time it appears — “ACCA (Association of Chartered Certified Accountants)” — name the system rather than saying “group ERP”, and let the standard appear in the sentence where you applied it rather than in a list.',
    ],
    groups: [
      {
        group: 'Qualifications',
        examples: ['ACCA', 'ACA', 'ICAEW', 'CIMA', 'CPA', 'AAT', 'part-qualified', 'finalist'],
      },
      {
        group: 'Systems',
        examples: ['SAP', 'Oracle', 'NetSuite', 'Sage', 'Xero', 'QuickBooks', 'Workday', 'Power BI'],
      },
      {
        group: 'Standards and compliance',
        examples: ['IFRS', 'UK GAAP', 'US GAAP', 'SOX', 'VAT', 'corporation tax', 'statutory accounts'],
      },
      {
        group: 'Process terms',
        examples: [
          'month-end close',
          'accounts payable',
          'accounts receivable',
          'reconciliation',
          'consolidation',
          'variance analysis',
          'budgeting and forecasting',
        ],
      },
    ],
    caveat:
      'This is about not being filtered out for a term you actually have, not about gaming anything. Screening set-ups vary between employers and agencies, and a large share of finance roles are still shortlisted by a recruiter reading the file — so the wording has to work for a human first.',
  },
  mistakes: [
    {
      title: 'Leaving the qualification stage ambiguous',
      description:
        '“Studying towards ACCA” could mean two papers or twelve. State the body, the number of papers passed and remaining, and the expected completion date. Recruiters read vagueness here as a bad answer being hidden.',
    },
    {
      title: 'Not naming the ERP',
      description:
        '“Group finance system” is invisible to both a keyword filter and a hiring manager trying to work out your ramp-up time. Name it, and name the version or module where that is what distinguishes the experience.',
    },
    {
      title: 'Describing the cycle instead of your part in it',
      description:
        'A list that reads accruals, prepayments, journals, reconciliations, reporting is the syllabus, not a career. Anyone reading it already knows what a close involves; what they do not know is how much of it you ran.',
    },
    {
      title: 'Omitting the statutory and compliance work',
      description:
        'VAT returns, statutory accounts, corporation tax packs and payroll journals are unglamorous and frequently left off — and they are exactly what a smaller employer is hiring for. Leaving them out narrows the roles you match.',
    },
    {
      title: 'Practice experience described in practice language',
      description:
        'Moving from audit into industry, “managed a portfolio of clients” means less than the scale and sector of those clients. Translate: turnover ranges, industries, the systems you saw, whether you led fieldwork and how large the teams were.',
    },
  ],
  templates: [
    {
      id: 'ats-05',
      reason:
        'Built for this profession: every date sits flush right in its own column, figures are set in tabular numerals so they line up down the page, and certifications get real weight — which matters when qualification status is the first filter.',
    },
    {
      id: 'corporate-05',
      reason:
        'Ledger-straight alignment with a fixed date column and tinted heading bands, no graphics. Reads as a finance document, which is exactly the register a controller or FD is expecting.',
    },
    {
      id: 'classic-09',
      reason:
        'Bold headings, plain text and nothing else. The safe answer for public sector, practice and any employer whose application portal will strip your formatting anyway.',
    },
  ],
  steps: [
    {
      name: 'Put the qualification where it cannot be missed',
      text: 'Add the designatory letters after your name if you hold them, and open the summary with your exact status: qualified, finalist, or part-qualified with papers passed and remaining.',
    },
    {
      name: 'Write a scope line for every employer',
      text: 'Under each job title, add one line giving turnover, entity count, currencies, team size and sector before any bullets. This is the context that makes the bullets mean something.',
    },
    {
      name: 'Attach a number to the close',
      text: 'State your working days to close and, if you improved it, the previous figure. If you have never measured it, count it next month — it is the most useful number you can add to this CV.',
    },
    {
      name: 'Name every system explicitly',
      text: 'Replace “group ERP”, “reporting tool” and “the system” with product names, and add your genuine Excel depth rather than the word “advanced”.',
    },
    {
      name: 'Add the control evidence',
      text: 'Find the audit outcomes, reconciliations cleared, management letter points closed and process changes you have made. These are the bullets a finance director remembers.',
    },
  ],
  us: {
    intro:
      'The US market changes the credential, the standard and the length. A UK accountant applying to a US employer is being read against CPA-qualified candidates working in US GAAP, and the document should be a one-page resume, not a two-page CV.',
    points: [
      'CPA is the reference credential; ACCA and CIMA are recognised but not assumed, so state the body in full once and note any reciprocity or exam progress towards a US licence.',
      'US GAAP, not IFRS, is the default assumption — say explicitly which you have reported under, and mention SOX experience if you have it, because it is a common requirement in listed-company roles.',
      'Cut to one page, drop the photo and any personal details, and give figures in USD or state the reporting currency alongside the number.',
      'Job titles differ: “management accountant” has no clean US equivalent, so “Senior Financial Analyst” or “Cost Accountant” may describe the same work more legibly.',
    ],
  },
  faq: [
    {
      question: 'I am part-qualified. Does that go at the top or the bottom?',
      answer:
        'The top, stated precisely. Part-qualified candidates are actively recruited — many employers prefer to hire mid-study and fund the rest — but only when the reader can see exactly what remains. “ACCA part-qualified, 11 of 13 papers passed, finalist expected September 2026” is a strong line. “Studying towards ACCA” makes the same person look like they might be at paper two.',
    },
    {
      question: 'How do I move from practice into industry on paper?',
      answer:
        'Translate the portfolio into the language of the ledger you want to run. Instead of client counts, give turnover ranges, sectors and systems: “audited 14 owner-managed businesses, £2m–£40m turnover, mostly Sage 200 and Xero, leading fieldwork on six”. Then use the summary to state the move directly, because a reader who cannot see why you are applying will assume you are applying everywhere.',
    },
    {
      question: 'Should I list every accounting system I have touched?',
      answer:
        'List the ones you could work in unsupervised, then a shorter “exposure to” line for the rest. System match matters enough in finance recruitment that a genuine familiarity is worth stating — but overclaiming is easily exposed, because the first technical question in the interview is very often about the ERP you named.',
    },
    {
      question: 'How should I handle a study break or a career gap?',
      answer:
        'State it in one clause and move on. Full-time exam study, caring responsibilities, redundancy and a period of contracting are all ordinary and none of them need apology. What creates suspicion is an unexplained hole between two dates — in a field built on documentation, an unreconciled gap is the wrong first impression.',
    },
  ],
  related: ['data-analyst', 'project-manager', 'student'],
  exampleSlug: 'accountant',
};

export default profession;
