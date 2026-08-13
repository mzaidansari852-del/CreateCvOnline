import type { Profession } from '@/types/profession';

const profession: Profession = {
  slug: 'data-analyst',
  role: 'Data analyst',
  rolePlural: 'data analysts',
  field: 'Technology & data',
  metaTitle: 'Data Analyst CV: SQL and Decisions Changed',
  metaDescription:
    'A data analyst CV is read for the stack, then for evidence that your analysis changed a decision. How to write both, with three bullets rewritten and templates that parse.',
  keywords: [
    'data analyst cv',
    'data analyst cv example',
    'analytics cv',
    'sql cv',
    'business analyst cv',
    'bi analyst cv',
  ],
  heading: 'How to write a data analyst CV',
  intro:
    'The defining weakness of data analyst CVs is that they describe outputs. Dashboards built, reports automated, queries written. None of it answers the question the hiring manager actually has, which is whether anything different happened in the business because you were there.',
  overview: [
    'The role sits between two disciplines and gets filtered by both. A technical screen checks the stack — SQL first, then the warehouse, the BI tool and whatever you use for modelling. A business screen checks whether you can turn a question into an analysis and an analysis into a decision somebody acted on. A CV that satisfies only the first reads as a report writer; one that satisfies only the second reads as someone who will need help writing a join.',
    'The good news is that analysts usually have the material and simply have not written it down. Every analyst has at some point told a stakeholder something they did not want to hear, killed a bad idea with a cohort chart, or found the reason a number was wrong. Those are the bullets. The dashboards are the context around them.',
  ],
  scanOrder: [
    {
      title: 'SQL, then everything else',
      description:
        'SQL is the non-negotiable and the first thing checked. After that: the warehouse (Snowflake, BigQuery, Redshift, Databricks), the BI layer (Power BI, Tableau, Looker), transformation (dbt, Airflow), and Python or R if the role has any modelling in it. Excel still counts, but only stated with depth.',
    },
    {
      title: 'A decision that changed',
      description:
        'The strongest thing on an analyst CV is a sentence in the form: I looked at X, found Y, and the business did Z. Hiring managers read for this specifically, because it is the difference between an analyst who answers tickets and one who is trusted with a question.',
    },
    {
      title: 'The shape of the data you have handled',
      description:
        'Row counts, number of sources, refresh cadence, whether it was clean or a mess, how many systems you had to reconcile. This is the analyst equivalent of scale, and it tells the reader whether your experience transfers to their environment.',
    },
    {
      title: 'Domain fluency',
      description:
        'Retail, healthcare, finance, marketplace, SaaS, public sector. Analysis is only useful when the analyst understands what the numbers describe, so the sector you know is a real credential — and the vocabulary of that sector should show up in your bullets.',
    },
  ],
  metrics: [
    {
      name: 'The decision or the money',
      detail:
        'What changed as a result of the analysis: a price adjusted, a campaign stopped, a route reallocated, a supplier renegotiated, a churn intervention launched. Where a value can be attached — cost avoided, revenue protected — attach it and say how it was estimated.',
    },
    {
      name: 'Data scale and complexity',
      detail:
        'Rows, tables, source systems, update frequency and the number of teams consuming the output. “A 400M-row events table joined to three finance systems” tells a reader more about your capability than any tool list.',
    },
    {
      name: 'Time recovered',
      detail:
        'Hours of manual reporting removed per week or per month, query runtime reduced, close reporting cycle shortened. Automation savings are easy to state precisely and are almost always understated on analyst CVs.',
    },
    {
      name: 'Adoption of what you built',
      detail:
        'Weekly active users of a dashboard, teams that replaced a spreadsheet with your model, self-serve queries run against the layer you designed. An unused dashboard is not an achievement, and stating usage is what proves yours was not one.',
    },
  ],
  sectionPlan: {
    order: [
      {
        section: 'Contact and links',
        note: 'Name, city, email, phone, and a portfolio or GitHub link only if the work behind it is genuinely presentable.',
      },
      {
        section: 'Summary — three lines',
        note: 'Analyst type (product, commercial, financial, operational), sector, stack in one clause, and the kind of question you are used to being handed.',
      },
      {
        section: 'Technical skills',
        note: 'Directly under the summary, grouped: query languages, warehouse, BI, transformation, statistics. Order the groups to match the advert and state depth honestly rather than uniformly.',
      },
      {
        section: 'Experience',
        note: 'Each role gets a context line — data estate, team, who the stakeholders were — then bullets that end in a decision, a saving or an adoption figure.',
      },
      {
        section: 'Projects',
        note: 'Worth including early in your career or when changing sector. Two projects with a stated question, a method and a conclusion beat six notebooks on a public dataset.',
      },
      {
        section: 'Education and certifications',
        note: 'Degree in two lines. Certifications only where the platform is the one the employer runs; a generic online analytics certificate adds very little after your first role.',
      },
    ],
    drop: [
      {
        section: 'The dashboard inventory',
        note: 'A list of every report you have produced is a work log. Pick the two that changed something and describe those.',
      },
      {
        section: 'Skill percentage bars',
        note: '“SQL 90%” means nothing to a reviewer who is going to test you, and the bar itself carries no text for a parser.',
      },
      {
        section: 'Excel listed as a headline skill',
        note: 'Only worth space with specifics — Power Query, Power Pivot, DAX, model auditing. On its own it signals the opposite of what you intend.',
      },
      {
        section: 'Tutorial projects on famous public datasets',
        note: 'The reviewer has seen the Titanic dataset a great many times. A small, messy, real dataset with a genuine question is worth far more than a polished exercise everyone has done.',
      },
    ],
  },
  rewrites: [
    {
      before: 'Created dashboards in Power BI for the sales and operations teams.',
      after:
        'Built the weekly commercial dashboard in Power BI on a dbt model over Snowflake, replacing four manually maintained spreadsheets; used by 60 people across sales and operations and it removed roughly six hours of analyst time a week.',
      change:
        'The original names a tool and an audience; the rewrite names the pipeline underneath, states what it replaced, and adds the two figures that prove it mattered — how many people use it and how much manual work it removed.',
    },
    {
      before: 'Analysed customer data to identify trends and support business decisions.',
      after:
        'Ran a cohort analysis of 180k subscriptions that showed churn concentrated in accounts onboarded without a setup call; the resulting change to onboarding cut 90-day churn in that cohort from 19% to 12% over the following two quarters.',
      change:
        'The original describes the activity; the rewrite states the question, the method, the finding, the action the business took and the measured result — which is the full arc a hiring manager is reading for.',
    },
    {
      before: 'Automated reporting processes to improve efficiency.',
      after:
        'Rewrote the month-end reporting pack as a scheduled dbt job with tests on the six source tables; the pack now lands at 07:00 on working day two instead of day five, and three recurring reconciliation errors have not recurred since the tests were added.',
      change:
        '“Efficiency” is replaced by two concrete outcomes — a timetable that moved by three days and a class of error that stopped happening — and the mention of tests signals engineering discipline rather than a scheduled query.',
    },
  ],
  ats: {
    intro: [
      'Analyst screening is unusually literal because the required skills have exact product names. A filter looking for “Power BI” will not credit “BI dashboards”, and one looking for “dbt” will not infer it from “data transformation”. Spell out the tools, and spell out SQL even though it feels too obvious to state.',
      'There is a second, quieter filter in this field: job families. “Data analyst”, “business analyst”, “BI analyst”, “analytics engineer” and “data scientist” are different roles with overlapping skills, and a CV that never uses the target title anywhere will look like a near-miss. Where your experience genuinely fits, mirror the wording of the advert in your summary.',
    ],
    groups: [
      {
        group: 'Query and programming',
        examples: ['SQL', 'Python', 'R', 'pandas', 'DAX', 'VBA'],
      },
      {
        group: 'Warehouse and pipeline',
        examples: ['Snowflake', 'BigQuery', 'Redshift', 'Databricks', 'dbt', 'Airflow', 'ETL', 'ELT'],
      },
      {
        group: 'Visualisation',
        examples: ['Power BI', 'Tableau', 'Looker', 'Looker Studio', 'Qlik', 'Excel'],
      },
      {
        group: 'Method vocabulary',
        examples: [
          'cohort analysis',
          'A/B testing',
          'regression',
          'forecasting',
          'segmentation',
          'data modelling',
          'statistical significance',
        ],
      },
    ],
    caveat:
      'None of this guarantees a shortlisting — parsers differ, and many analytics teams screen with a SQL test rather than a keyword filter. The aim is only that a term you genuinely know is present in your own sentences, so nothing you can actually do is invisible.',
  },
  mistakes: [
    {
      title: 'Stopping at the output',
      description:
        'The most common failure in the field: the bullet ends with the dashboard, the model or the report rather than with what somebody did about it. If the analysis changed nothing, the reader has no reason to prefer you to any other analyst.',
    },
    {
      title: 'No domain context',
      description:
        'Numbers without a business behind them are unreadable. Say what the data described — subscriptions, deliveries, patients, claims, stores — because domain fluency is a substantial part of what makes an analyst quickly useful.',
    },
    {
      title: 'Overclaiming data science',
      description:
        'Describing a linear regression in Excel as machine learning, or a one-week course as modelling experience, is exposed in the first technical conversation. Analysts who are honest about the boundary are trusted more inside it.',
    },
    {
      title: 'Claiming statistical significance loosely',
      description:
        'If you quote an experiment result, be ready to say what the sample was and how it was tested. Analysts get asked this, and a shaky answer damages the rest of the page in a way it would not in another profession.',
    },
    {
      title: 'A two-column layout that splits the stack',
      description:
        'A sidebar full of tool names is the section most likely to be scrambled or dropped by a parser — and in this field the tool names are the filter. One column is a cheap insurance policy.',
    },
  ],
  templates: [
    {
      id: 'tech-04',
      reason:
        'Bracketed headings, a dated gutter and room for a real technical section — a layout that looks like the working documents analysts produce, without turning skills into decorative bars.',
    },
    {
      id: 'modern-07',
      reason:
        'The parser-proof choice: one column, one rule, no graphics. When you are applying through a large employer’s portal, this is the version of your CV least likely to lose the stack.',
    },
    {
      id: 'modern-09',
      reason:
        'A hairline spine threads the sections into one continuous read, which suits a CV with a long skills block followed by three or four dense roles.',
    },
  ],
  steps: [
    {
      name: 'List the questions you were asked, not the reports you built',
      text: 'Go back through the last two years and write down the actual business questions you were handed. These become the spine of your bullets.',
    },
    {
      name: 'Find the decision at the end of each one',
      text: 'For each question, what did the business do afterwards? If the honest answer is nothing, pick a different question — you will have several where something did change.',
    },
    {
      name: 'Write the stack as it really is',
      text: 'Group query, warehouse, transformation, BI and statistics, and mark depth honestly. Put SQL first even though it feels obvious.',
    },
    {
      name: 'Add scale to one bullet per role',
      text: 'Rows, sources, refresh frequency, consumers. One scale figure per role is enough to calibrate the whole entry.',
    },
    {
      name: 'Quantify the time you gave back',
      text: 'Work out the manual hours removed by anything you automated, per week or per month. It is the easiest credible number on an analyst CV and it is almost always missing.',
    },
  ],
  us: {
    intro:
      'US analytics hiring uses the same tools and much of the same vocabulary, so the adjustments are about length, framing and the way seniority is signalled.',
    points: [
      'One page, and expect the technical skills block to be scanned before anything else — keep it near the top and keep it tight.',
      'No photo or personal details, and no degree classification: state a GPA only if it is recent and strong, otherwise just the degree, institution and year.',
      'US titles skew towards “Analytics Engineer”, “Business Intelligence Analyst” and “Insights Analyst”; mirror the advert’s title in your summary rather than assuming your current one translates.',
      'Quantify impact in dollars where you can, and note the scale of the business as well as the data — American readers calibrate on company size more than European ones do.',
    ],
  },
  faq: [
    {
      question: 'What is the difference between a data analyst and a data scientist CV?',
      answer:
        'The analyst CV is organised around decisions and the scientist CV around methods. An analyst leads with the business question, the data they reconciled and what changed; a scientist leads with modelling approach, evaluation and deployment. Applying for analyst roles with a methods-first CV makes you look overqualified and impractical, and applying for science roles with a decisions-first CV makes you look like you have not built a model. Write for the one you want and be honest about the boundary.',
    },
    {
      question: 'Do I need a portfolio, and what should be in it?',
      answer:
        'It helps most in your first two roles and matters much less afterwards. If you build one, two projects are enough: a real question, a messy dataset you had to clean, the analysis, and a written conclusion a non-technical reader could act on. The writing is the part that gets noticed — plenty of candidates can produce a notebook, far fewer can produce a page that explains what the business should do and why.',
    },
    {
      question: 'Are analytics certificates worth putting on the CV?',
      answer:
        'They are worth a line, not a section. A vendor certificate for the platform an employer actually runs — Microsoft for Power BI, Snowflake, Tableau — is a mild positive and occasionally a screening term. A general online analytics certificate carries real weight only when you have no professional experience yet, and after your first analyst role it is usually the least interesting thing on the page.',
    },
    {
      question: 'How do I show impact when I only supplied the numbers and someone else decided?',
      answer:
        'That is the normal case, and you write it as influence rather than authorship. “Analysis of return rates by supplier led the buying team to renegotiate two contracts” is accurate, verifiable and does not claim the decision was yours. Analysts who write as though they personally ran the business are easy to catch; analysts who can describe their exact contribution to a decision demonstrate the thing that actually gets them trusted with bigger questions.',
    },
  ],
  related: ['software-engineer', 'accountant', 'marketing-manager'],
};

export default profession;
