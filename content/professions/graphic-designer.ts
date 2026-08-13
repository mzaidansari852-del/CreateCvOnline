import type { Profession } from '@/types/profession';

const profession: Profession = {
  slug: 'graphic-designer',
  role: 'Graphic designer',
  rolePlural: 'graphic designers',
  field: 'Commercial & creative',
  metaTitle: 'Graphic Designer CV: Getting the Portfolio Opened',
  metaDescription:
    'A graphic designer CV has one job: get the portfolio link clicked and supply the context the work sat in — client, scope, distribution and constraints.',
  keywords: [
    'graphic designer cv',
    'designer cv example',
    'creative cv',
    'design cv template',
    'portfolio cv',
    'junior designer cv',
  ],
  heading: 'How to write a graphic designer CV',
  intro:
    'For a designer, the CV is not the work sample — the portfolio is. What the CV has to do is get the link clicked and then supply everything the portfolio cannot show: who the client was, how big the job was, what constraints you worked inside, and whether you can run a project rather than only make an artefact.',
  overview: [
    'This is why the most common failure mode — turning the CV itself into a design experiment — is worse than it looks. A studio lead who cannot find your portfolio URL, or who receives a 30MB PDF that will not open on their phone between meetings, has already learned something about how you handle a brief. Legibility under constraint is the job.',
    'The second failure is quieter and more expensive. Design CVs collapse into tool lists — Illustrator, Photoshop, InDesign, After Effects, Figma — as though the software were the skill. Everyone applying has the software. What differs is the scope of work you have delivered end to end, where it went, and how you behaved when the print deadline moved.',
  ],
  scanOrder: [
    {
      title: 'The portfolio link, before anything else',
      description:
        'A design hire is decided on the work, so the first thing anyone does is look for the URL. It should be in the header, written in plain text, live, and password-free — or with the password on the same line. Every extra step between the reader and the work costs you candidates’ worth of attention.',
    },
    {
      title: 'The context the work sat in',
      description:
        'The portfolio shows what it looked like; the CV says who it was for, how far it shipped and what you were solving. A packaging range in 600 retail doors and a concept piece for a university brief can look equally good on a screen and are not the same credential.',
    },
    {
      title: 'Craft signals in the document itself',
      description:
        'Typographic hierarchy, spacing discipline, restraint. A designer’s CV is read as a small piece of work whether or not you intend it to be — and a reader will notice inconsistent leading long before they notice which typefaces you chose.',
    },
    {
      title: 'Production reality',
      description:
        'Prepress and artwork experience, working to brand guidelines, handover to developers, turnaround times, working with printers and suppliers. Studio leads worry about whether a strong portfolio comes with someone who can deliver on Friday.',
    },
  ],
  metrics: [
    {
      name: 'Scope delivered end to end',
      detail:
        'Brand systems, product ranges, campaign suites, publications. “Identity, packaging for 40 SKUs and point of sale, delivered end to end” tells a reader far more about your level than a job title does.',
    },
    {
      name: 'Where the work actually shipped',
      detail:
        'Retail doors, print run, territories, channels, impressions, shelf presence, event footprint. Distribution is the difference between a concept and a piece of commercial work, and designers under-report it constantly.',
    },
    {
      name: 'Throughput and turnaround',
      detail:
        'Artwork jobs per week, average turnaround, campaign volume in a peak period, number of concurrent brands. This is what an in-house or studio manager needs to know and it is almost never on the page.',
    },
    {
      name: 'Systems you built',
      detail:
        'Template kits, component libraries, brand guidelines, asset systems and the effect they had on the team — turnaround cut, requests handled without a designer, consistency problems removed.',
    },
  ],
  sectionPlan: {
    order: [
      {
        section: 'Contact and portfolio URL',
        note: 'Name, discipline, city, email, portfolio link in plain text. Put the URL on its own line and make it big enough to read on a phone.',
      },
      {
        section: 'Profile — two or three lines',
        note: 'Discipline and specialism (brand, packaging, editorial, digital product, motion), the sectors you have worked in, and the size of studio or team you are used to.',
      },
      {
        section: 'Selected work',
        note: 'Distinctive to design CVs and worth the space: three or four projects with client, your role, scope and where it shipped. Two lines each. This is the section that gets the portfolio opened.',
      },
      {
        section: 'Experience',
        note: 'Reverse chronological, with the studio type and client sectors named. Freelance goes here as a single continuous entry with representative clients underneath, not as one entry per job.',
      },
      {
        section: 'Tools and production',
        note: 'One tight line, grouped. Include the production skills — prepress, artwork, retouching, print specification — because those are the ones that actually differentiate.',
      },
      {
        section: 'Education and recognition',
        note: 'Degree in two lines. Awards with the year and the category; unnamed “award-winning” claims are worth nothing.',
      },
    ],
    drop: [
      {
        section: 'Software skill bars',
        note: 'A five-dot rating for Photoshop tells a design lead nothing they will not learn from the portfolio in ten seconds, and it carries no readable text.',
      },
      {
        section: 'Thumbnails of your work',
        note: 'Small, low-resolution and unflattering. They inflate the file, they do not survive being printed, and they compete with the portfolio you want opened.',
      },
      {
        section: 'A layout that hides the information',
        note: 'Rotated type, three columns, a dark-background PDF that eats a printer cartridge, or a colour-blocked grid where the dates are the smallest thing on the page. Confidence in a CV comes from restraint.',
      },
      {
        section: 'Generic creative adjectives',
        note: '“Passionate, creative, detail-oriented visual thinker.” Every designer writes this and no design lead has ever hired because of it.',
      },
    ],
  },
  rewrites: [
    {
      before: 'Created marketing materials and social graphics for various clients.',
      after:
        'Designed and rolled out the visual identity for a 40-product skincare range — packaging, point of sale and social — live in 600 retail doors; cut studio artwork turnaround from five days to two with a component-based template kit.',
      change:
        'The rewrite mentions no software at all: it describes scope, where the work shipped and a process improvement, which is what a design lead is actually hiring for. The portfolio proves the craft; the CV proves you can run a job.',
    },
    {
      before: 'Designed logos and brand assets according to client briefs.',
      after:
        'Ran six brand identities from discovery to guidelines for independent food and drink clients (£4k–£18k projects), including two rebrands with existing packaging estates that had to transition without a print reprint cycle.',
      change:
        '“According to client briefs” describes compliance rather than capability; the rewrite states volume, project value, sector and — crucially — the constraint that made two of the jobs difficult, which is what separates a designer from someone who makes logos.',
    },
    {
      before: 'Worked with printers and suppliers to produce final artwork.',
      after:
        'Owned artwork and prepress for a quarterly 96-page catalogue: specified stock and finishes with two printers, ran the colour proofing cycle, and delivered eleven consecutive issues with no reprints and no missed on-sale dates.',
      change:
        'Production work is the least glamorous and most reassuring thing on a design CV, so the rewrite gives it real weight — the page count, the frequency, the specification decisions and the record of eleven issues without an error.',
    },
  ],
  ats: {
    intro: [
      'How much this matters depends entirely on where you are applying. Independent studios and agencies mostly review portfolios by hand, and a parser may never touch your file. Large in-house teams — retailers, banks, universities, public sector, big consumer brands — run design applications through the same systems as everything else, and creative CVs are the ones most likely to fail there because of how they are built.',
      'The practical compromise is to keep one plain single-column version for portal applications and a more considered one for direct approaches. In the plain version, make sure the discipline words appear in text rather than only in a graphic, because a heavily designed header often contributes nothing a parser can read.',
    ],
    groups: [
      {
        group: 'Disciplines',
        examples: ['brand identity', 'packaging design', 'editorial design', 'art direction', 'motion graphics', 'UI design'],
      },
      {
        group: 'Software',
        examples: ['Adobe InDesign', 'Illustrator', 'Photoshop', 'After Effects', 'Figma', 'Adobe Creative Cloud'],
      },
      {
        group: 'Production',
        examples: ['prepress', 'artwork', 'colour management', 'CMYK', 'print specification', 'retouching', 'typesetting'],
      },
      {
        group: 'Ways of working',
        examples: ['brand guidelines', 'design system', 'client presentation', 'studio management', 'concept development'],
      },
    ],
    caveat:
      'Nothing here guarantees a shortlisting, and in this field the portfolio outweighs the file format by a wide margin. The point is simply that a portal application should not fail for a mechanical reason before anyone has seen your work.',
  },
  mistakes: [
    {
      title: 'A portfolio link that costs the reader effort',
      description:
        'A dead URL, a password not included, a site that needs a desktop, or a link buried in a footer. This single problem loses more design applications than any weakness in the work.',
    },
    {
      title: 'A CV that is a design experiment',
      description:
        'The instinct to demonstrate range in the CV itself is understandable and usually counterproductive. The document is judged on hierarchy and restraint, and the reader wants to find the dates in under a second.',
    },
    {
      title: 'Work described without context',
      description:
        'Project names with no client, no scope and no distribution. A reader cannot tell a student brief from a national campaign, so they assume the smaller one.',
    },
    {
      title: 'Freelance experience written as a scatter of jobs',
      description:
        'Eleven separate entries of one or two months each looks like instability. Present freelancing as one continuous role with representative clients and project types beneath it.',
    },
    {
      title: 'An enormous PDF',
      description:
        'A CV that is 30MB because of embedded imagery will bounce off some mail servers and irritate everyone else. Keep the CV light and let the portfolio carry the pixels.',
    },
  ],
  templates: [
    {
      id: 'creative-02',
      reason:
        'A poster masthead over a two-column grid of section blocks — a CV that signals design capability while keeping the content in a readable, conventional order.',
    },
    {
      id: 'creative-07',
      reason:
        'Portrait, name and contact share one header line above a plain, parser-safe column. The version to send to a large in-house team, and free to use.',
    },
    {
      id: 'creative-08',
      reason:
        'Gives your projects the big type and a tinted card grid while everything else stays compact — good when selected work is doing most of the persuading.',
    },
  ],
  steps: [
    {
      name: 'Fix the portfolio before the CV',
      text: 'Check the link on a phone, confirm any password is on the CV itself, and make sure the first three projects are the ones you want to be hired for. The CV is pointing at this; make sure it is worth arriving at.',
    },
    {
      name: 'Write the context for four projects',
      text: 'Client, your role, scope, constraints, where it shipped. Two lines each. This is the section that turns a portfolio visit into a conversation.',
    },
    {
      name: 'Recover the distribution numbers',
      text: 'Print runs, retail doors, territories, channels, page counts, campaign duration. These are the figures designers habitually omit and clients always have.',
    },
    {
      name: 'Move production work up the page',
      text: 'Prepress, artwork, guidelines, template systems, supplier management. It is the part of your experience that reassures a studio lead about deadlines.',
    },
    {
      name: 'Make a plain version for portals',
      text: 'One column, real text, no thumbnails, small file size. Keep the considered version for direct applications and speculative approaches.',
    },
  ],
  us: {
    intro:
      'US design hiring runs on the same portfolio-first logic, with a shorter document and firmer conventions about what belongs on it.',
    points: [
      'One page, always, and the portfolio URL in the top block — American creative resumes are read as a cover for the portfolio rather than as a record.',
      'No photo: this is a legal-risk convention in US hiring, and a headshot on a creative resume is not treated as a stylistic choice.',
      'Job titles differ: “graphic designer” covers a narrower band in the US, with “visual designer”, “brand designer” and “production artist” as distinct roles — match the advert’s language.',
      'Freelance rates and project values are usually given in USD, and it is normal to state whether you are open to contract, contract-to-hire or permanent work.',
    ],
  },
  faq: [
    {
      question: 'How creative should my CV itself be?',
      answer:
        'Considered rather than experimental. Show typographic judgement, a clear hierarchy and disciplined spacing — that is a genuine demonstration of craft and design leads do notice it. What works against you is anything that makes the information harder to extract: rotated type, dark backgrounds that waste ink, three columns, or dates set in six-point grey. If a reader has to work to find your last employer, the design has failed at the only brief it was given.',
    },
    {
      question: 'Do I need a separate portfolio PDF as well as a website?',
      answer:
        'It is worth having one. Studios and in-house teams often circulate applications internally, and a ten-to-fifteen page PDF under about 10MB travels where a link sometimes does not. Keep it to your six strongest projects, each with a line of context and your specific role, and make sure the first spread is the strongest thing you have made. The website can hold the full archive.',
    },
    {
      question: 'How do I show work I cannot publish because of an NDA?',
      answer:
        'Describe the shape of it without the identifying detail. “Packaging system for a national supermarket own-brand range, 60 SKUs across three tiers, unreleased” tells a reader the scale and the type of problem without breaching anything. Some clients will allow a private walkthrough in an interview, which is worth asking about. What you should not do is publish work you were asked not to publish — creative industries are small, and it becomes known.',
    },
    {
      question: 'How should I present freelance work on a designer CV?',
      answer:
        'As one continuous role with a start date, a discipline and a client list beneath it. “Freelance graphic designer, 2021 – present — brand and packaging for independent food and drink clients” followed by four representative projects reads as a deliberate practice. Listing every engagement separately creates the impression of a fragmented career, and a hiring manager scanning dates will see gaps that are really just the spaces between projects.',
    },
  ],
  related: ['marketing-manager', 'software-engineer', 'student'],
};

export default profession;
