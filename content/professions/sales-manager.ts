import type { Profession } from '@/types/profession';

const profession: Profession = {
  slug: 'sales-manager',
  role: 'Sales manager',
  rolePlural: 'sales managers',
  field: 'Commercial & creative',
  metaTitle: 'Sales Manager CV: Quota and Attainment',
  metaDescription:
    'A sales manager CV without numbers is read as a bad year. Quota and attainment by year, team performance, deal profile — and three weak bullets rewritten properly.',
  keywords: [
    'sales manager cv',
    'sales cv example',
    'account manager cv',
    'business development cv',
    'sales cv template',
    'b2b sales cv',
  ],
  heading: 'How to write a sales manager CV',
  intro:
    'Sales is the one profession where the absence of numbers is itself a data point. Every sales leader reading your CV knows the figures exist, that you know them, and that you chose what to include — so a page of relationship-building language and no attainment reads as a candidate hiding a bad year.',
  overview: [
    'The reader is running a short, specific assessment. Did you carry a number, and did you hit it? What did the deals look like, and do they look like ours? If you managed a team, did the team hit its number, and did the people stay? Everything else on the page is context for those three answers.',
    'This is also the profession where inflated claims are caught fastest. Sales leaders interview for the details behind the figures as a matter of routine — territory, quota, ramp, split between new and existing business, what the comp plan actually paid. A CV that survives that conversation is one where the numbers were written honestly and with their context attached in the first place.',
  ],
  scanOrder: [
    {
      title: 'Quota and attainment, year by year',
      description:
        'The first thing looked for and the most frequently missing. Give the quota, the attainment percentage and the year, for at least the last two or three years. A single career-best figure with no others beside it invites the assumption that the rest were poor.',
    },
    {
      title: 'Whether the deals look like their deals',
      description:
        'Average deal size, sales cycle length, segment, and whether it is new business, expansion or renewal. Someone selling £15k SaaS subscriptions on a six-week cycle and someone selling £2m infrastructure contracts over eighteen months are not interchangeable, however good both are.',
    },
    {
      title: 'Team results, if you manage',
      description:
        'Headcount, percentage of the team at quota, team attainment against target, ramp time for new hires and retention. A manager is judged on the team’s number, not on their own historical selling — this is the transition most sales CVs fail to make.',
    },
    {
      title: 'Pipeline discipline',
      description:
        'Forecast accuracy, pipeline coverage, self-sourced percentage, CRM hygiene and the methodology you actually run. Sales leaders care about this because it predicts whether your numbers will be believable once you work for them.',
    },
  ],
  metrics: [
    {
      name: 'Quota and percentage attainment, per year',
      detail:
        'Always both, and always with the year. “$1.2m new-business quota, 118% in FY24, 104% in FY23” is the shape. Where a year was missed, say so with the reason — a territory change or a product withdrawal is a normal explanation.',
    },
    {
      name: 'Deal profile',
      detail:
        'Average contract value, sales cycle length, win rate and the new-versus-existing split. This is how a sales director works out whether your experience transfers to their motion.',
    },
    {
      name: 'Team performance and retention',
      detail:
        'Reps managed, percentage at or above quota, team attainment, average ramp to first closed deal, and voluntary attrition. Retention is the number good sales leaders quietly weight most heavily.',
    },
    {
      name: 'Pipeline and forecast quality',
      detail:
        'Self-sourced pipeline as a percentage, coverage ratio, forecast accuracy against actuals by quarter. These are the numbers that distinguish a disciplined operator from a lucky one.',
    },
  ],
  sectionPlan: {
    order: [
      {
        section: 'Contact details',
        note: 'Name, city, phone, email, LinkedIn. Keep it to one line — this is a document that should get to the numbers fast.',
      },
      {
        section: 'Summary — three lines',
        note: 'What you sell, to whom, at what deal size and cycle, and your attainment record in one clause. This is the highest-value real estate on a sales CV and most candidates waste it on adjectives.',
      },
      {
        section: 'Performance snapshot',
        note: 'Distinctive to this profession and worth the space: three or four lines of quota and attainment by year, plus President’s Club or equivalent recognition with the year. A reader should find the whole record without scrolling.',
      },
      {
        section: 'Experience',
        note: 'Under each employer, a context line — what the company sold, to which segment, at what price point — then quota, attainment, and what you actually did to hit it.',
      },
      {
        section: 'Methodology and systems',
        note: 'MEDDIC, Challenger, SPIN, Sandler and the CRM and prospecting stack. One short block; these are screening terms rather than achievements.',
      },
      {
        section: 'Education',
        note: 'Two lines at the bottom. In sales, the record is the qualification.',
      },
    ],
    drop: [
      {
        section: 'Relationship-building language',
        note: '“Built strong relationships with key stakeholders” appears on essentially every sales CV. It is the job, and it distinguishes nobody.',
      },
      {
        section: 'A logo wall of clients',
        note: 'Impressive-looking, frequently meaningless, and occasionally a confidentiality problem. Name the sectors and the deal sizes instead.',
      },
      {
        section: 'Percentages with no quota behind them',
        note: '“Increased sales by 40%” without the base could be two extra deals. Either give the number underneath or leave the claim out.',
      },
      {
        section: 'A photograph and personal details',
        note: 'Common in some markets, unusual in UK and US sales hiring, and never the reason anyone gets an interview.',
      },
    ],
  },
  rewrites: [
    {
      before: 'Consistently exceeded sales targets and built strong client relationships.',
      after:
        'Carried a $1.2m new-business quota in mid-market logistics software; finished FY24 at 118% and FY23 at 104%, average deal $46k on a 71-day cycle, self-sourcing 40% of pipeline.',
      change:
        'The original is the most common sentence in sales CVs and carries no information; the rewrite gives two years of attainment against a stated quota, plus the deal profile a sales director needs to judge whether you fit the patch.',
    },
    {
      before: 'Managed a team of sales representatives and motivated them to achieve their goals.',
      after:
        'Managed seven mid-market AEs against a $9.4m team quota, finishing FY24 at 103% with five of seven reps at or above target; cut average ramp to first closed deal from five months to three by rebuilding the onboarding curriculum, with one voluntary leaver in two years.',
      change:
        'Managers are judged on the team’s number, so the rewrite replaces “motivated” with the team quota, the attainment, the proportion of reps who actually hit it, a ramp improvement you caused and the retention figure that proves it was not achieved by churning people.',
    },
    {
      before: 'Responsible for the full sales cycle from prospecting through to closing.',
      after:
        'Ran full-cycle enterprise deals from cold outbound to signature: booked 22 first meetings a quarter from a named 80-account list, ran MEDDIC qualification with an average of five stakeholders per deal, and closed nine contracts above $150k in two years.',
      change:
        'Describing the sales cycle describes the job description; the rewrite quantifies the top of the funnel, names the qualification method and the buying-committee complexity, and finishes with the deals that actually closed.',
    },
  ],
  ats: {
    intro: [
      'Sales screening tends to look for three families of term: the motion (new business, account management, channel, inside, field), the methodology, and the CRM. These are short and specific, and a CV that describes the work only in narrative form can miss all three while describing exactly the right experience.',
      'Segment vocabulary matters as much as the tools. “Mid-market”, “enterprise”, “SMB”, “public sector” and the product category are the words a filter and a recruiter both use to decide whether you have sold into the right rooms, so make sure they appear where you actually did it.',
    ],
    groups: [
      {
        group: 'Motion and segment',
        examples: ['new business', 'account management', 'enterprise', 'mid-market', 'SMB', 'channel sales', 'inside sales'],
      },
      {
        group: 'Methodology',
        examples: ['MEDDIC', 'MEDDPICC', 'Challenger', 'SPIN', 'Sandler', 'Miller Heiman', 'value selling'],
      },
      {
        group: 'Systems',
        examples: ['Salesforce', 'HubSpot', 'Outreach', 'Salesloft', 'Gong', 'ZoomInfo', 'LinkedIn Sales Navigator'],
      },
      {
        group: 'Commercial vocabulary',
        examples: ['quota', 'ACV', 'ARR', 'pipeline coverage', 'forecast accuracy', 'win rate', 'churn', 'upsell'],
      },
    ],
    caveat:
      'Filters vary by employer and plenty of sales roles are shortlisted by a hiring manager scanning for attainment figures in the first ten lines. Keywords stop you being screened out; the numbers are what get you called.',
  },
  mistakes: [
    {
      title: 'No quota anywhere on the page',
      description:
        'The defining failure of sales CVs. Without a quota, an attainment percentage is meaningless and a revenue figure is unanchored. If the exact number is confidential, use a band and say so.',
    },
    {
      title: 'Only the good year',
      description:
        'One 140% year listed alone, with the surrounding years described qualitatively, is a pattern every sales leader recognises. Give the run of years; a 92% in a year the product was withdrawn is far less damaging than an obvious gap.',
    },
    {
      title: 'Claiming team results as personal ones',
      description:
        'Writing “grew regional revenue from $4m to $11m” when you were one of six reps is the fastest way to lose credibility in an interview, because the first question will be about your individual number.',
    },
    {
      title: 'Missing the segment and price point',
      description:
        'Transactional SMB selling and complex enterprise selling are different skills that share a job title. A CV that never states deal size, cycle length or buying-committee complexity makes the reader guess which one you can do.',
    },
    {
      title: 'President’s Club with no context',
      description:
        'A recognition line is worth including, but on its own it says little — the criteria differ enormously between companies. Add the year and the qualifying threshold, or the ranking, such as “top 3 of 44 reps”.',
    },
  ],
  templates: [
    {
      id: 'corporate-09',
      reason:
        'Built for this: three headline wins sit in a strip directly under your name, before the job history starts, which is exactly where a sales CV needs its attainment figures.',
    },
    {
      id: 'corporate-03',
      reason:
        'A tinted band carries methodology, systems and recognition while the wide column runs the quota-and-team narrative — a good fit once you manage rather than carry a bag.',
    },
    {
      id: 'corporate-02',
      reason:
        'A split header over a solid accent rule, then plain single-column text. The safe option for large corporate portals, and free to use and download.',
    },
  ],
  steps: [
    {
      name: 'Reconstruct your numbers first',
      text: 'For every year of the last three to five: quota, closed, attainment percentage, average deal size, cycle length, and the new-versus-existing split. Pull them from your comp statements rather than memory.',
    },
    {
      name: 'Build the performance snapshot',
      text: 'Put the attainment record in a short block near the top, one line per year, with recognition and rankings attached. This is the block a sales director reads first.',
    },
    {
      name: 'Add the context line to every employer',
      text: 'What the company sold, to which segment, at what price point and on what cycle. Without it, your attainment percentage cannot be interpreted.',
    },
    {
      name: 'Switch to team metrics if you manage',
      text: 'Replace your own historical attainment with team quota, percentage of reps at target, ramp time and retention. Keep one line of individual record as evidence you can sell.',
    },
    {
      name: 'Explain any weak year in one clause',
      text: 'Territory change, product withdrawal, a nine-month maternity cover, a merger freeze. A short explanation is always better than an unexplained absence.',
    },
  ],
  us: {
    intro:
      'US sales hiring is the most numbers-forward version of this profession anywhere, and the conventions around what you publish about your own performance are more explicit.',
    points: [
      'One page until roughly ten years in, with the attainment record in the top third — American sales resumes routinely put a quota table above the employment history.',
      'Quota, attainment and ranking are expected in dollars, and President’s Club is a recognised currency: name the years and the qualifying rank rather than just the award.',
      'Segment language differs: “mid-market” typically means a larger band than in the UK, and “enterprise” often implies a named-account list, so describe the account profile rather than relying on the label.',
      'No photo, no age and no personal details; state relocation willingness and territory experience instead, because those are the practical questions.',
    ],
  },
  faq: [
    {
      question: 'What do I do about a year where I badly missed quota?',
      answer:
        'Include it with the reason in the same line. Sales leaders have all had that year and are far more suspicious of a record with a hole in it than of a genuine miss. “FY23: 74% of a $1.4m quota following a territory split in Q2 and the withdrawal of the mid-market product line” is a sentence that survives an interview. What does not survive is describing that year in adjectives and hoping nobody asks — because they always ask.',
    },
    {
      question: 'My employer treats quota figures as confidential. What can I publish?',
      answer:
        'Percentages and bands, which are what a reader mainly wants anyway. “Attainment of 118%, 104% and 96% over three years against a quota in the $1m–$1.5m range” communicates almost everything without disclosing a specific target. Avoid naming client contract values that are commercially sensitive, and use “a FTSE 100 retailer” or “a top-five European logistics provider” rather than the client name where your agreement requires it.',
    },
    {
      question: 'How do I move from individual contributor to sales management on paper?',
      answer:
        'Lead with the management-adjacent work you have already done rather than your own attainment. Mentoring new reps, running the onboarding, covering for the manager, building the territory plan, running forecast calls, interviewing candidates. Then keep one compact line of your own quota record as proof you can sell, because no sales director will promote someone whose own number was weak. The CV needs to argue that you have already been doing the job informally.',
    },
    {
      question: 'How many years of quota history should I show?',
      answer:
        'Three to five, in detail, and then stop. Anything older than about six years tells a reader very little about how you sell now, and long attainment tables push the rest of the page down. Roles beyond that window compress to a line each with the company, the segment and one figure. The exception is a single genuinely outstanding early result — a first year at 160% or a market opened from nothing — which can stay as one line because it says something about trajectory.',
    },
  ],
  related: ['marketing-manager', 'project-manager', 'accountant'],
};

export default profession;
