import type { Profession } from '@/types/profession';

const profession: Profession = {
  slug: 'marketing-manager',
  role: 'Marketing manager',
  rolePlural: 'marketing managers',
  field: 'Commercial & creative',
  metaTitle: 'Marketing Manager CV: Channels, Budget and Pipeline',
  metaDescription:
    'A marketing manager CV is read for three things: the channels you own, the budget you control, and whether you can connect activity to pipeline rather than impressions.',
  keywords: [
    'marketing manager cv',
    'marketing cv example',
    'digital marketing cv',
    'marketing cv template',
    'cv for marketing jobs',
    'demand generation cv',
  ],
  heading: 'How to write a marketing manager CV',
  intro:
    'Marketing CVs fail in a distinctive way: they are the best-written documents in the pile and say the least. Fluency is the job, so the copy is usually good — but a page of well-turned sentences about brand awareness and cross-functional collaboration gives a hiring director nothing to decide on.',
  overview: [
    'The person reading is trying to establish three things quickly. Which channels have you genuinely owned rather than coordinated? How much money has passed through your hands? And can you draw a line from something you did to something the business sold? Everything else — tools, campaigns, awards — is supporting evidence.',
    'The third question is where most candidates lose. Marketing attribution is genuinely messy, and the honest answer is often partial. That is fine: naming the model you used and the number it produced is far more credible than a round percentage with no method behind it, and it signals that you have argued about attribution in a room with a finance team, which is itself a senior signal.',
  ],
  scanOrder: [
    {
      title: 'Which channels are actually yours',
      description:
        'Paid search, paid social, SEO, lifecycle and email, content, events, PR, product marketing, partnerships. A reader is checking overlap with the gap they are hiring for. Be precise about ownership: running the paid account is not the same as briefing an agency that runs it, and both are worth saying plainly.',
    },
    {
      title: 'Budget under management',
      description:
        'The fastest seniority signal in the field, and the one most often left off. A number here establishes in four words what three paragraphs of adjectives cannot, and it is the figure a hiring director will use to place you in their band before reading anything else.',
    },
    {
      title: 'The line from activity to revenue',
      description:
        'Pipeline sourced or influenced, marketing-qualified leads and what happened to them, revenue attributed, cost per acquisition, return on ad spend. Naming the attribution model alongside the figure is what separates a marketer who reports numbers from one who understands them.',
    },
    {
      title: 'What you run beyond the campaigns',
      description:
        'Team size, agency and freelancer management, budget planning cycles, and the systems you own. Manager-level hiring is partly about whether you can be handed a function, and that shows in who and what you have been responsible for, not in the campaigns themselves.',
    },
  ],
  metrics: [
    {
      name: 'Budget under management',
      detail:
        'Annual spend you controlled, split between media and everything else if the split flatters you. Where the number is small, say what it was spent on — a tightly run £40k budget with a stated return reads better than a vague reference to “significant spend”.',
    },
    {
      name: 'Efficiency: CPA, CPL or ROAS',
      detail:
        'Cost per acquisition, cost per lead or return on ad spend, always with the direction of travel and the period. A growth figure without a cost figure invites the assumption that you simply spent more, which is the most common unspoken objection to a marketing CV.',
    },
    {
      name: 'Pipeline or revenue contribution',
      detail:
        'Marketing-sourced or influenced pipeline in currency, with the attribution model named — first touch, last touch, multi-touch, self-reported. The named model is the credibility, not the number.',
    },
    {
      name: 'Funnel conversion, stage to stage',
      detail:
        'Visitor to lead, lead to qualified, qualified to opportunity. Improving one conversion step is often the most defensible thing a marketing manager has done all year, and it is far more specific than a traffic figure.',
    },
  ],
  sectionPlan: {
    order: [
      {
        section: 'Contact and one portfolio or LinkedIn link',
        note: 'Plain text. If you have a portfolio of campaigns or writing, one link, and make sure it opens without a password.',
      },
      {
        section: 'Summary — three or four lines',
        note: 'Discipline, sector, business model (B2B SaaS, DTC e-commerce, retail), the channels you own and your largest budget. Sector and model matter enormously in marketing and are usually missing.',
      },
      {
        section: 'Experience',
        note: 'Straight after the summary. Under each employer, one scope line — company size, business model, team, budget — then bullets that each end in a number where you have one.',
      },
      {
        section: 'Selected campaigns or results',
        note: 'Optional, and only for senior CVs: three or four career-defining results with the employer and year attached, above the full history.',
      },
      {
        section: 'Channels and tools',
        note: 'Grouped by channel rather than as one alphabetical soup: paid, lifecycle, analytics, CMS, CRM. Tools are a filter, not an achievement.',
      },
      {
        section: 'Education and certifications',
        note: 'Two lines for the degree. Platform certifications are worth one line each at most and lose value quickly with age.',
      },
    ],
    drop: [
      {
        section: 'Vanity metrics',
        note: 'Follower counts, impressions, reach and email open rates on their own. Include them only where they were the actual objective, and even then attach what they produced.',
      },
      {
        section: 'A tool wall',
        note: 'Twenty-five logos or a list of every platform you have logged into. Nobody hires on Canva proficiency, and it pushes the numbers further down the page.',
      },
      {
        section: 'A heavily designed layout, unless you are a designer',
        note: 'Marketing CVs are the most over-designed documents in professional hiring. Two-column layouts with tinted sidebars parse unpredictably, and marketing roles in larger companies almost always route through an applicant tracking system.',
      },
      {
        section: 'Generic strategy language',
        note: '“Developed and executed integrated marketing strategies to drive brand awareness” is the single most common sentence in the field. It could be written by anyone about any job.',
      },
    ],
  },
  rewrites: [
    {
      before: 'Managed social media and email campaigns to increase brand awareness.',
      after:
        'Owned a £340k paid and lifecycle budget across LinkedIn, Google and email; rebuilt the nurture sequence and grew marketing-sourced pipeline from £1.1m to £2.7m in a year at a 22% lower cost per opportunity.',
      change:
        'Brand awareness is the least falsifiable claim in marketing. The rewrite names the budget, which establishes seniority immediately, and pairs a growth figure with a cost figure so the result cannot be read as something that was simply bought.',
    },
    {
      before: 'Worked with the sales team to generate more leads for the business.',
      after:
        'Ran a joint account-based programme with four enterprise reps across 60 target accounts; agreed a shared qualification definition with sales that lifted MQL-to-opportunity conversion from 9% to 17% over two quarters.',
      change:
        '“Worked with sales” is the phrase every marketer uses and describes nothing; the rewrite specifies the programme, the account count, the artefact you actually produced — a shared definition — and the funnel step it moved.',
    },
    {
      before: 'Launched a new product campaign that was very successful.',
      after:
        'Led the go-to-market for a new self-serve tier: positioning, pricing page, launch content and a two-week paid test. 1,900 sign-ups in the first month against a 1,200 target, with a 31% trial-to-paid rate that has held for three quarters.',
      change:
        '“Very successful” is the reader’s judgement to make, not yours. The rewrite lists what you personally produced, states the target the result is measured against, and adds the durability figure — which is what turns a launch spike into evidence.',
    },
  ],
  ats: {
    intro: [
      'Marketing job descriptions are written in channel names and platform names, and that is largely what the screening is built on. The terms most likely to be matched are specific: “HubSpot”, “Google Ads”, “demand generation”, “B2B SaaS” — not the abstractions marketers naturally reach for, like “omnichannel” or “full-funnel”.',
      'There is a second-order problem specific to this field. Marketing CVs are more likely than most to use a designed, multi-column layout, and a layout that reorders under a parser can scatter those exact terms. If you are applying to larger organisations, the safest thing you can do for your keywords is a single-column file.',
    ],
    groups: [
      {
        group: 'Channels and disciplines',
        examples: [
          'demand generation',
          'lifecycle marketing',
          'paid social',
          'paid search',
          'SEO',
          'content marketing',
          'product marketing',
          'ABM',
        ],
      },
      {
        group: 'Platforms',
        examples: ['HubSpot', 'Marketo', 'Salesforce', 'Google Ads', 'Meta Ads', 'LinkedIn Campaign Manager', 'Klaviyo'],
      },
      {
        group: 'Analytics and data',
        examples: ['GA4', 'Google Tag Manager', 'Looker Studio', 'attribution', 'A/B testing', 'CRO'],
      },
      {
        group: 'Commercial vocabulary',
        examples: ['pipeline', 'CAC', 'ROAS', 'MQL', 'SQL', 'LTV', 'budget management', 'go-to-market'],
      },
    ],
    caveat:
      'Screening behaviour varies by employer and by agency, and plenty of marketing roles are shortlisted by a human reading quickly. The point is to make sure a term you genuinely own appears in your own words somewhere on the page — not to write for a machine.',
  },
  mistakes: [
    {
      title: 'Claiming the company’s growth as your own',
      description:
        '“Grew revenue by 300%” on a CV from a company that raised a funding round and tripled its sales team is an obvious overreach, and any experienced reader will spot it. Claim the part you can defend, and name the channel it came through.',
    },
    {
      title: 'Percentages with no base',
      description:
        '“Increased conversion by 45%” could be four extra sign-ups. Give the starting point, the end point and the volume, or the number reads as a smaller result being dressed up.',
    },
    {
      title: 'Leaving out the business model',
      description:
        'B2B enterprise, B2B SMB, DTC e-commerce, marketplace, retail and agency marketing are close to different professions. A CV that never says which one you have done makes the reader guess, and they will usually guess wrong.',
    },
    {
      title: 'A CV that is itself a portfolio piece',
      description:
        'Colour blocks, a headshot, four fonts and a skills wheel. In-house marketing hiring at scale runs through the same parsers as every other function, and the design rarely gets you a call that the numbers would not have.',
    },
    {
      title: 'Listing campaigns without outcomes',
      description:
        'A list of launches, events and rebrands you were involved in is a work log. For each one, the reader wants the objective, your specific contribution and what actually happened — including the ones that underperformed and what you changed as a result.',
    },
  ],
  templates: [
    {
      id: 'corporate-08',
      reason:
        'A two-tone split header gives a marketing CV a bit of visual confidence without turning it into a design exercise, and the body stays single-column so the numbers and channel names survive a parser.',
    },
    {
      id: 'modern-01',
      reason:
        'A tinted header band over a clean single column: the safest option when you are applying into a large in-house team whose portal will strip everything decorative anyway.',
    },
    {
      id: 'corporate-03',
      reason:
        'A tinted band carries your channels and tools while the wide column tells the commercial story — useful at head-of level, where the toolkit needs to be visible but must not lead.',
    },
  ],
  steps: [
    {
      name: 'Write the scope line for each employer',
      text: 'Company size, business model, sector, your team, your budget. Four facts, one line, before any bullets. Most marketing CVs never establish any of them.',
    },
    {
      name: 'Find your budget figures',
      text: 'Go back through each role and recover the annual spend you controlled. If it varied, use the largest full year and say so.',
    },
    {
      name: 'Pick the funnel step you moved',
      text: 'For each role, identify one conversion step that improved on your watch and write the before, the after and the mechanism. This is the bullet that gets you interviewed.',
    },
    {
      name: 'Name the attribution you used',
      text: 'Where you quote pipeline or revenue, add the model in three words. It converts a claim into a considered statement and pre-empts the obvious challenge.',
    },
    {
      name: 'Strip the layout back',
      text: 'Move to one column, remove the tool wall and the skills wheel, and check that the channel names and platform names appear in the sentences where you used them.',
    },
  ],
  us: {
    intro:
      'US marketing hiring uses much of the same vocabulary, so the differences are structural rather than conceptual: shorter, harder on numbers, and stricter about what does not belong on the page.',
    points: [
      'One page up to roughly ten years of experience. American readers treat a two-page marketing resume as a signal that the candidate cannot prioritise.',
      'No photo, no age, no marital status, no nationality — this is a legal-risk convention in the US and its absence is expected, not neutral.',
      'Quantify in dollars and use US-standard terms: “demand generation” rather than “demand gen” in the skills line, “SDR” rather than “BDR” depending on the target company’s own language.',
      'Titles inflate faster in the US market: a UK marketing manager frequently maps to a US “Senior Marketing Manager” or “Marketing Lead”, so describe the scope rather than relying on the title to carry it.',
    ],
  },
  faq: [
    {
      question: 'What do I do when attribution in my company was genuinely unreliable?',
      answer:
        'Say so, briefly, and use what you do trust. “Self-reported attribution on 60% of closed-won deals” or “last-touch in HubSpot, which over-credits paid” is a sentence that makes a hiring director trust the rest of your page more, not less. Marketing leaders have all lived through the same arguments, and a candidate who acknowledges the limits of their data reads as senior rather than evasive.',
    },
    {
      question: 'Is agency experience a disadvantage when applying in-house?',
      answer:
        'Not if you translate it. Agency CVs are usually organised by client, which hides scale — regroup around the disciplines you ran and the combined budget you were responsible for, and name the client sectors rather than every logo. The genuine gap an in-house hiring manager worries about is ownership of a number over time rather than of a project, so highlight any retained account where you carried a target across quarters.',
    },
    {
      question: 'Should a marketing manager include a portfolio?',
      answer:
        'One link, if you have something worth opening — a campaign write-up, published content, a landing page you wrote and tested. It is expected for content and product marketing, optional for demand generation and rarely asked for in lifecycle or operations roles. What matters more than the artefacts is a short note on each explaining the objective and the result, because a screenshot of a nice-looking email tells the reader nothing.',
    },
    {
      question: 'How do I position myself when I have been a generalist?',
      answer:
        'Pick the shape of role you want and lead with the evidence for it, rather than presenting an even spread. Generalist experience is a real advantage in smaller companies and a liability in specialist teams, so the summary has to make a choice: “full-funnel B2B marketer, strongest in paid acquisition and lifecycle” is a position. A list of nine disciplines in equal weight is not, and it usually loses to a specialist on every one of them.',
    },
  ],
  related: ['sales-manager', 'graphic-designer', 'project-manager'],
  exampleSlug: 'marketing-manager',
};

export default profession;
