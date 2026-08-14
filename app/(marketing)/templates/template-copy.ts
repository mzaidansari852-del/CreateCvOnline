import { FREE_TEMPLATE_COUNT, TEMPLATE_CATEGORIES, TEMPLATE_COUNT } from '@/lib/cv/template-registry';
import type { FaqEntry } from '@/components/marketing/primitives';
import type { TemplateCategory, TemplateMeta } from '@/types/cv';

/**
 * Editorial copy for the template pages.
 *
 * Fifty-six detail pages generated from one component is only worth publishing if the
 * fifty-six pages are actually different. Everything here therefore selects sentences
 * from matrices keyed on the axes that genuinely change the advice — category, column
 * count, photo support and ATS score — rather than interpolating a name into a single
 * paragraph. Where two templates share every axis (the six ATS layouts, for instance) a
 * deterministic per-id rotation picks a different variant, and each block also leans on
 * the template's own `tagline`, `description`, `bestFor` and `features`, which are
 * written by hand and unique.
 *
 * "Deterministic" matters: the same template must produce the same sentence on every
 * build, or statically generated pages would churn between deployments.
 */

/* -------------------------------------------------------------------------- */
/* Axes                                                                        */
/* -------------------------------------------------------------------------- */

export type AtsBand = 'excellent' | 'strong' | 'moderate' | 'limited';
type Columns = 1 | 2;
type NonEmpty<T> = readonly [T, ...T[]];

export function atsBand(score: number): AtsBand {
  if (score >= 5) return 'excellent';
  if (score === 4) return 'strong';
  if (score === 3) return 'moderate';
  return 'limited';
}

export function atsBandLabel(score: number): string {
  const band = atsBand(score);
  if (band === 'excellent') return 'Excellent';
  if (band === 'strong') return 'Strong';
  if (band === 'moderate') return 'Moderate';
  return 'Limited';
}

export function categoryLabel(category: TemplateCategory): string {
  return TEMPLATE_CATEGORIES.find((entry) => entry.id === category)?.label ?? category;
}

export function categoryBlurb(category: TemplateCategory): string {
  return TEMPLATE_CATEGORIES.find((entry) => entry.id === category)?.blurb ?? '';
}

export function columnsLabel(columns: Columns): string {
  return columns === 1 ? 'Single column' : 'Two columns';
}

export function planLabel(premium: boolean): string {
  return premium ? 'Pro' : 'Free';
}

/** Small deterministic hash so same-axis templates still get different sentences. */
function rotation(id: string, salt: number, length: number): number {
  let hash = (salt + 1) * 2654435761;
  for (let index = 0; index < id.length; index += 1) {
    hash = (hash * 33 + id.charCodeAt(index)) >>> 0;
  }
  return hash % length;
}

function pick<T>(options: NonEmpty<T>, id: string, salt: number): T {
  return options[rotation(id, salt, options.length)] ?? options[0];
}

function columnsOf(template: TemplateMeta): Columns {
  return template.columns === 2 ? 2 : 1;
}

/* -------------------------------------------------------------------------- */
/* Category voice                                                              */
/* -------------------------------------------------------------------------- */

interface CategoryVoice {
  /** Opening positioning sentence, shown under the tagline. */
  lede: NonEmpty<string>;
  /** Use-case slot 2: what kind of career history the layout flatters. */
  fitTitle: NonEmpty<string>;
  fit: Record<Columns, string>;
  /** Customisation guidance. */
  colour: string;
  typography: string;
  sections: string;
  /** The category-specific FAQ entry. */
  faq: { question: string; answer: NonEmpty<string> };
  /** Extra sentence for the ATS section, when the category itself carries a risk. */
  parserNote: string | null;
}

const CATEGORY_VOICE: Record<TemplateCategory, CategoryVoice> = {
  modern: {
    lede: [
      'Modern is the family to reach for when you have no strong signal about a company’s house style: current spacing, one accent colour, and nothing a hiring manager would have to interpret.',
      'The design work here is in the spacing and the hierarchy rather than in ornament, which is why it reads as contemporary without dating the way a heavily styled CV does.',
    ],
    fitTitle: ['A career that reads in order', 'Three roles, one argument', 'A steady progression'],
    fit: {
      1: 'One uninterrupted flow suits a history where the last three roles are the argument: a reviewer reads titles, dates and outcomes downward, without correlating a sidebar with the job it belongs to.',
      2: 'Moving skills, tools and languages into the side column keeps the main narrative about outcomes, which is what you want when your experience is strong but your skills list is long enough to crowd it out.',
    },
    colour:
      'The accent drives headings, rules and any highlighted detail. A deep navy, a slate or a saturated brand colour all hold up — the hierarchy does not depend on the hue, so choosing is a taste decision rather than a legibility one.',
    typography:
      'A humanist or geometric sans throughout gives the intended look. Setting a serif for headings only is the one substitution that changes the personality without breaking the spacing.',
    sections:
      'Summary, experience, education and skills carry the weight. Projects and certifications drop in without upsetting the rhythm, and anything you are not using can be hidden rather than left empty.',
    faq: {
      question: 'Is a modern design safe for a conservative employer?',
      answer: [
        'Usually, yes — “modern” here means current typography and spacing, not decoration. If you are applying to a very traditional institution such as a court, a ministry or an old-line bank, set the accent to near-black and the document becomes indistinguishable from a classic layout.',
        'For most employers it is fine, because nothing in the design is playful. Where a sector is genuinely conservative — law, government, academia — either darken the accent to charcoal or move to the Classic range, which is drawn for those readers specifically.',
      ],
    },
    parserNote: null,
  },

  corporate: {
    lede: [
      'Corporate templates are built for a reader who sees a hundred CVs a week and is looking for evidence: numbers, scope, budget, headcount, in that order.',
      'Restraint is the point. A corporate layout should make your results easy to find and give the reviewer nothing else to react to.',
    ],
    fitTitle: ['Numbers first', 'Scope and results', 'A promotion track'],
    fit: {
      1: 'Achievements stay directly under the role they belong to, so a promotion track inside one employer reads as a single story rather than three disconnected entries — the thing internal-mobility and executive reviewers look for first.',
      2: 'Certifications, licences and languages sit where a reviewer expects to find them, in the side column, leaving the main column free for revenue, headcount, budget and P&L figures.',
    },
    colour:
      'Keep the accent dark: navy, charcoal, oxblood or a deep green. A bright hue is the fastest way to undercut the seriousness that makes this layout work, and it is the first thing to look wrong when the page is printed in black and white.',
    typography:
      'A neutral sans body with a heavier heading weight is the safe pairing. A transitional serif for headings is the alternative if the employer is an older institution rather than a modern corporate.',
    sections:
      'Experience and achievements dominate; certifications and languages matter in finance, banking and consulting so both are wired in. Interests and volunteering can be switched off entirely without leaving a gap.',
    faq: {
      question: 'How long should a corporate CV using this template be?',
      answer: [
        'Two pages for most senior commercial roles, one if you are under five years in. This layout is spaced for two pages: it does not compress your history into an unreadable block to keep it on a single sheet, and a recruiter in finance or consulting expects the second page.',
        'One page early in a career, two pages once you have scope worth describing, and three only in the rare case of a very long regulated career. The section spacing slider is the honest way to fit the page — reduce it before you start deleting achievements.',
      ],
    },
    parserNote: null,
  },

  creative: {
    lede: [
      'A creative CV is itself a work sample: the person reading it is judging craft before they open your portfolio, and this layout is built to be looked at as well as read.',
      'Creative templates spend their design budget where a studio reviewer will notice it, which is the opposite of what an automated screen rewards — a trade-off worth making deliberately.',
    ],
    fitTitle: ['Work that speaks first', 'A portfolio in document form', 'Craft on the page'],
    fit: {
      1: 'Everything runs in one column, so a long list of projects and commissions keeps the sequence you chose — and the sequencing is part of the edit when the reader is a creative director.',
      2: 'Tools, software and links live in the side column while the wide column keeps the projects and the story behind them, which is the order a design reviewer reads in anyway.',
    },
    colour:
      'The accent is doing visible design work, so choose it deliberately: pull it from your portfolio site or your personal identity rather than accepting a default. One strong colour beats two competing ones on a page this expressive.',
    typography:
      'A display or editorial face for headings over a quiet body face is the pairing this layout is drawn around. Let one voice lead — setting both at high contrast is what turns an art-directed CV into a noisy one.',
    sections:
      'Projects, awards and links carry more weight than a long employment history. If the work itself is your strongest argument, move projects above experience — it takes one drag in the editor.',
    faq: {
      question: 'Should I send a creative CV to a recruitment agency?',
      answer: [
        'Send it to the studio or client directly, and give agencies a plainer version. Agencies re-key or re-format CVs into their own house document, and the layout they produce from a heavily designed file is rarely the one you would have chosen.',
        'It depends who reads it first. A creative director or gallery will respond to it; a large agency’s database will flatten it. Keep this version for direct approaches and build a single-column duplicate in the same account for everything else.',
      ],
    },
    parserNote:
      'Frames, tinted panels and centred headings are drawn rather than written: they never confuse a human, but they are the reason the extracted text can come out in a different shape from the page you see.',
  },

  technology: {
    lede: [
      'Engineering CVs fail in two directions — a keyword dump nobody reads, or a beautiful page with no stack on it. This family is drawn to give tooling, projects and open-source work somewhere honest to live.',
      'Built for a document that gets read twice: once by a recruiter matching keywords, once by an engineer who wants to know what you actually shipped.',
    ],
    fitTitle: ['Stack and shipped work', 'For engineers who ship', 'Projects that carry weight'],
    fit: {
      1: 'A single flow suits a CV where each role needs three or four bullets of measurable impact, and where a hiring manager will read the projects section as carefully as the employment history.',
      2: 'The side column absorbs the stack, cloud platforms and certifications, which is exactly what keeps the experience column about what you built and what it did rather than a list of technology names.',
    },
    colour:
      'Cool accents — indigo, teal, slate — suit the type of document. The accent is used at small sizes on labels and rules here, so anything too pale loses contrast against white; test it before you commit.',
    typography:
      'A clean sans keeps library names, version numbers and acronyms legible at 10pt, which is where a technical CV is actually read. Decorative heading faces make a stack list harder to scan for no gain.',
    sections:
      'Skills, projects and certifications matter as much as employment. Promote projects above experience if you are early-career, self-taught or changing track — the work is the evidence in all three cases.',
    faq: {
      question: 'Where should I put my tech stack in this template?',
      answer: [
        'In the skills section, grouped by category — languages, frameworks, infrastructure, tooling — rather than one long alphabetical string. Grouped skills read faster for a human and still match the keywords a screening system is looking for.',
        'Keep the full stack in the skills section and mention only the relevant parts inside each role. Repeating every technology under every job inflates the document and makes it harder to see what you were actually responsible for.',
      ],
    },
    parserNote: null,
  },

  classic: {
    lede: [
      'A traditional document for a reader who expects one: measured type, plain hierarchy and no ornament that a formal committee would read as flippant.',
      'Classic layouts follow conventions that predate the web, which is precisely why they still work in academia, law, government and the older professions.',
    ],
    fitTitle: ['A long formal record', 'Credentials in order', 'A document, not a pitch'],
    fit: {
      1: 'One column with generous leading suits a document that may legitimately run to three pages — an academic or legal CV is not trying to be a one-page pitch, and compressing it signals the wrong thing.',
      2: 'A narrow column of credentials beside a full-width record of positions held keeps a long formal history readable without abbreviating any of it.',
    },
    colour:
      'Near-black or a very dark neutral is the honest choice. These layouts are designed to survive being photocopied and scanned by a committee secretary, and a mid-tone accent is the first thing to disappear when they are.',
    typography:
      'A serif body is the point of this family. If you switch to a sans, drop the font size a notch — the spacing is set for serif text and looks loose without it.',
    sections:
      'Education often outranks experience here, and publications, awards and references all have a legitimate place. Reordering takes one drag, which matters because the convention differs by field and by country.',
    faq: {
      question: 'Is this template suitable for an academic or legal CV?',
      answer: [
        'Yes — it is one of the few formats where a multi-page document is correct. Publications, teaching, grants and references are all supported as first-class sections, and nothing in the design objects to a CV that runs long.',
        'It is drawn for exactly that reader. Formal committees, chambers, ministries and university panels expect a conventional document, and this layout gives them one without looking like an unformatted word-processor file.',
      ],
    },
    parserNote: null,
  },

  ats: {
    lede: [
      'This family exists for one situation: your file is read by software before any person sees it, and everything decorative has been removed on purpose.',
      'Nothing here is drawn for effect. Each choice — plain headings, a single flow, text-only contact details — exists because it is what a parser reads back correctly.',
    ],
    fitTitle: ['Straight through the portal', 'For the machine that reads first', 'Uploaded, not emailed'],
    fit: {
      1: 'Plain headings, plain lists and one text flow mean the file you upload is the file the system reads back: no reordered sections, no dropped job titles, no dates attached to the wrong employer.',
      2: 'Even split across two columns, the record of employment stays in one block, which is the part of the document a parser is most likely to mangle.',
    },
    colour:
      'Colour is deliberately minimal. A dark accent on the headings is safe and makes the printed page easier for a human to scan; nothing about the accent affects parsing, because a parser reads text and ignores hue entirely.',
    typography:
      'Stay with a common sans or serif. Unusual faces can export with non-standard character mappings, which produces a PDF that looks correct and extracts as gibberish — precisely the failure this family exists to prevent.',
    sections:
      'Use the conventional section names. A screening system matches on headings it recognises, so “Experience” earns matches that “Where I’ve worked” does not, however much better the second one reads.',
    faq: {
      question: 'Will this template get me past an applicant tracking system?',
      answer: [
        'It removes the formatting reasons a system misreads a CV, which is the part a template can control. What it cannot do is make you a match for the role — parsing gets your experience into the database accurately, and the content decides what happens next.',
        'It gives you the best possible chance on the mechanical side: correct headings, extractable text, a predictable reading order. Screening still ranks you on relevance, so tailor the wording of your summary and skills to the advert as well.',
      ],
    },
    parserNote: null,
  },
};

/* -------------------------------------------------------------------------- */
/* Lede                                                                        */
/* -------------------------------------------------------------------------- */

const STRUCTURE_LEDE: Record<Columns, Record<'photo' | 'no-photo', NonEmpty<string>>> = {
  1: {
    photo: [
      'It is a single-column layout with a portrait, so it suits markets where a photo is expected and stays readable if you switch the photo off.',
      'One column, with a place for a photograph that the layout closes up cleanly when you decide not to use one.',
    ],
    'no-photo': [
      'It runs as one column with no photo, which is the combination most application portals and most UK, US and Irish employers prefer.',
      'One column and no portrait: the plainest structure a CV can have, and the one that travels furthest across markets.',
    ],
  },
  2: {
    photo: [
      'A two-column page with a portrait: more information density and more visual anchoring than a single column, at the usual cost in machine readability.',
      'The split page and the photograph together make it feel designed rather than typed — appropriate when a person, not a portal, opens the file first.',
    ],
    'no-photo': [
      'A two-column page without a photo, which buys you room for a long skills or certification list without pushing your experience onto a third page.',
      'Two columns and no portrait: density where you need it, and nothing on the page that a black-and-white printer would ruin.',
    ],
  },
};

export function ledeSentence(template: TemplateMeta): string {
  const voice = CATEGORY_VOICE[template.category];
  const structure = STRUCTURE_LEDE[columnsOf(template)][template.hasPhoto ? 'photo' : 'no-photo'];
  return `${pick(voice.lede, template.id, 1)} ${pick(structure, template.id, 2)}`;
}

/* -------------------------------------------------------------------------- */
/* ATS narrative                                                               */
/* -------------------------------------------------------------------------- */

export interface AtsNarrative {
  verdict: string;
  mechanics: string;
  caveat: string | null;
  advice: { before: string; linkLabel: string; after: string };
}

const ATS_VERDICT: Record<AtsBand, Record<Columns, NonEmpty<string>>> = {
  excellent: {
    1: [
      'Everything on this page is text a parser can lift: real headings, one linear reading order, and no content that exists only as a graphic. It scores 5 out of 5 because there is nothing here for a parser to guess at.',
      'It holds the full 5 out of 5 for a simple reason — no sidebar, no table, no text baked into an image. What you upload is very close to what the system reads back.',
      'Nothing in this layout has to be interpreted. Job titles, employers and dates are ordinary text in an ordinary order, which is what a 5 out of 5 actually means.',
      'A perfect parsing score: the document is a single sequence of headed text blocks, so an extractor recovers your history in the order you wrote it rather than in the order elements happen to sit on the page.',
    ],
    2: [
      'It keeps a 5 out of 5 despite the split page, because the two columns are plain text blocks divided by a rule rather than a filled panel, and your entire employment history stays in one uninterrupted column.',
    ],
  },
  strong: {
    1: [
      'At 4 out of 5 the substance comes through cleanly — headings, dates, employers and titles all parse — and the missing point is for styling that a small number of older systems simplify rather than read.',
      'It scores 4 out of 5: the reading order is linear and the text is real text, but there is enough visual structure that an unusually strict parser may flatten some of the presentation.',
      'Four out of five. Nothing important is at risk; what costs the fifth point is decoration around the content rather than anything the content itself depends on.',
    ],
    2: [
      'Four out of five: the wide column keeps experience and education in a single reading order, and only the narrow column — skills, languages, certifications — is exposed to being re-ordered by a strict parser.',
      'It scores 4 out of 5, which is high for a split page. The main column carries the whole career narrative, so even a parser that mishandles the sidebar recovers the part that matters most.',
      'Four out of five, and the deduction is specifically about the second column: everything a screening system ranks you on lives in the wide one.',
    ],
  },
  moderate: {
    1: [
      'Three out of five. The text is all real and extractable, but the styling is doing enough work that some systems will return a plainer, slightly re-ordered version of your document.',
      'A middling 3 out of 5: this is a designed page first and a data file second, and while nothing is unreadable, you should assume some of the presentation is lost in extraction.',
    ],
    2: [
      'Three out of five. A split page plus visible styling is the combination parsers handle least consistently — most cope, but a minority will interleave the columns and blur the boundary between a skills list and a job description.',
      'It scores 3 out of 5: expect the content to survive and the structure to be approximated. Where the sidebar text lands in the extracted version is genuinely unpredictable between systems.',
    ],
  },
  limited: {
    1: [
      'Two out of five, and that is a deliberate trade. The composition — framing, centring, generous negative space — is the whole point of the design, and it is exactly what a parser strips away.',
      'It scores 2 out of 5. This is a portfolio piece in document form: beautiful in an inbox, unreliable in an upload field, and it would be dishonest to describe it any other way.',
    ],
    2: [
      'Two out of five: a split page with heavy visual structure is close to the worst case for automated parsing. Everything is still real text, but the shape it comes back in is anyone’s guess.',
    ],
  },
};

const ATS_MECHANICS: Record<Columns, NonEmpty<string>> = {
  1: [
    'Sections stack in a single flow, so the order you set in the editor is the order the parser records: summary, then experience, then education, then whatever you put next.',
    'Because there is only one text column, an extractor never has to decide which block to read first — the page has exactly one reading order and it is the one you can see.',
    'Headings are real headings and lists are real lists, so the boundaries between one role and the next survive extraction intact.',
  ],
  2: [
    'The narrow column is a second text box. Most current systems read it after the main column; a minority interleave the two, which can drop a skills list into the middle of a job description.',
    'Two columns mean two reading orders, and the parser picks one. Modern systems handle it well, older ones read straight across the page and mix the side column into your experience.',
    'Skills, languages and certifications sit in the side column, so those are the entries most likely to move in the extracted text; experience and education stay in the wide column and stay in sequence.',
  ],
};

const PHOTO_CAVEAT: NonEmpty<string> = [
  'The portrait is an image, so no parser reads it, and a handful of large employers’ systems flag documents that contain images at all. Switching the photo off in the editor takes one click and the layout closes up around it.',
  'A photograph is invisible to a parser and occasionally counts against you in US and UK screening. Turn it off for portal applications and keep it for the version you email directly.',
];

export function atsNarrative(template: TemplateMeta): AtsNarrative {
  const columns = columnsOf(template);
  const band = atsBand(template.atsScore);
  const voice = CATEGORY_VOICE[template.category];

  const verdict = pick(ATS_VERDICT[band][columns], template.id, 3);
  const mechanics = pick(ATS_MECHANICS[columns], template.id, 4);
  const caveat = template.hasPhoto ? pick(PHOTO_CAVEAT, template.id, 5) : voice.parserNote;

  if (columns === 2) {
    return {
      verdict,
      mechanics,
      caveat,
      advice: {
        before:
          'A single column parses more reliably than two, in every system we have tested against. If the application goes through a portal you do not recognise, or the employer is large enough to screen automatically, send a one-column version instead — the ',
        linkLabel: 'ATS CV templates',
        after: ' are built for that job, and your content moves across without being retyped.',
      },
    };
  }

  if (band === 'excellent') {
    return {
      verdict,
      mechanics,
      caveat,
      advice: {
        before: 'There is little left to fix here. If you want to see how the rest of the parser-safe range compares — and what a 5 out of 5 is actually measuring — the ',
        linkLabel: 'ATS CV templates',
        after: ' page scores every layout on the same criteria.',
      },
    };
  }

  if (band === 'strong') {
    return {
      verdict,
      mechanics,
      caveat,
      advice: {
        before: 'For most applications this is safe. Where the employer is very large, or the advert names a specific tracking system, a plainer single-column layout removes the remaining doubt: compare it against the ',
        linkLabel: 'ATS CV templates',
        after: ', which trade this template’s styling for the highest possible parsing score.',
      },
    };
  }

  return {
    verdict,
    mechanics,
    caveat,
    advice: {
      before: 'Use this one where a person opens the file: a direct approach, a studio, an agent, a client, a networking introduction. For anything uploaded to a careers portal, build a second version from the ',
      linkLabel: 'ATS CV templates',
      after: ' — the same content, a layout that survives extraction, and no need to write anything twice.',
    },
  };
}

/* -------------------------------------------------------------------------- */
/* Example use cases                                                           */
/* -------------------------------------------------------------------------- */

export interface UseCase {
  title: string;
  body: string;
}

interface Channel {
  title: string;
  body: string;
}

const CHANNEL: Record<AtsBand, Record<Columns, NonEmpty<Channel>>> = {
  excellent: {
    1: [
      {
        title: 'A large-employer application portal',
        body: 'You are uploading a PDF into a careers site that will index it before a recruiter opens anything. This layout is designed for precisely that first reader, so nothing is lost between the upload button and the recruiter’s screen.',
      },
      {
        title: 'A high-volume application campaign',
        body: 'When you are sending thirty applications in a month, the document has to work unattended. Nothing here needs explaining, reformatting or defending, which is what makes it the version to keep as your default.',
      },
      {
        title: 'A recruiter who will re-format your CV',
        body: 'Agencies routinely re-key a CV into their own house template before sending it to a client. Starting from a plain, correctly structured document means what arrives at the client end still resembles what you wrote.',
      },
      {
        title: 'A public-sector or graduate scheme',
        body: 'Structured schemes score CVs against fixed criteria, often mechanically. A conventional document with conventional headings lets the assessor find each criterion where they expect it to be.',
      },
    ],
    2: [
      {
        title: 'A formal application that still has to parse',
        body: 'You want the authority of a divided page and you cannot risk the upload being misread. This is the rare layout that gives you both, because the split is made with a rule rather than a panel.',
      },
    ],
  },
  strong: {
    1: [
      {
        title: 'A named hiring manager',
        body: 'Sent to a person rather than a system: enough visual polish that the document looks considered on screen, and enough structure that it still parses if it is forwarded into a tracking system afterwards.',
      },
      {
        title: 'A shortlist you have already reached',
        body: 'Past the screening stage, the document gets read properly — often printed, often circulated to a panel. The styling here is aimed at that second, slower reading.',
      },
      {
        title: 'A referral or internal move',
        body: 'When someone inside the company is passing your CV on, it is read by colleagues rather than software. A little design signals care without costing you the parsing safety net.',
      },
    ],
    2: [
      {
        title: 'A specialist role with a long requirements list',
        body: 'The advert lists fourteen technologies or six certifications and you have most of them. The side column takes that inventory off the main narrative so a reviewer can tick it off in one glance.',
      },
      {
        title: 'A direct application to a mid-sized employer',
        body: 'Small enough that a human opens the file, structured enough that the wide column still parses if it is loaded into a database later — the position most applications actually occupy.',
      },
      {
        title: 'A role where credentials are the qualifier',
        body: 'Licences, clearances and accreditations decide the first cut. Putting them in a column of their own makes them findable in seconds instead of buried three roles deep.',
      },
    ],
  },
  moderate: {
    1: [
      {
        title: 'A direct approach to a small team',
        body: 'Emailed to a founder, a studio lead or a head of department who will read it themselves. There is no screening layer to satisfy, so the design gets to do its job.',
      },
      {
        title: 'A role where presentation is part of the brief',
        body: 'Marketing, brand, communications: the document quietly demonstrates the skill you are claiming, and the person hiring you notices whether or not they can articulate why.',
      },
    ],
    2: [
      {
        title: 'A pitch to a client or an agency',
        body: 'Attached to a proposal or an introduction rather than an application form. Density and hierarchy matter more than machine readability, because the file is going straight to a human.',
      },
      {
        title: 'A senior role won on positioning',
        body: 'At this level a CV is a positioning document. The split page lets you lead with a profile and scope on one side and the evidence on the other, which is how the conversation goes anyway.',
      },
    ],
  },
  limited: {
    1: [
      {
        title: 'A portfolio submission',
        body: 'Sent alongside images or a link, to a reader who is already assessing your visual judgement. The CV is one more exhibit, and it should not be the weakest one in the set.',
      },
      {
        title: 'A gallery, residency or commission',
        body: 'The people reading this are not running keyword screens. They are looking for taste, coherence and a body of work — which is what this composition is built to present.',
      },
    ],
    2: [
      {
        title: 'A creative studio approach',
        body: 'Hand-delivered, emailed or dropped into a portfolio review, where the document itself is part of the argument. It is not built for an upload field and should not be sent to one.',
      },
    ],
  },
};

const CHANNEL_CONNECTOR: NonEmpty<string> = [
  'The obvious case',
  'A typical example',
  'Where it earns its keep',
  'The reader it was drawn for',
];

interface PhotoScene {
  title: string;
  body: string;
}

const PHOTO_SCENE: Record<'photo' | 'no-photo', Record<AtsBand, NonEmpty<PhotoScene>>> = {
  photo: {
    excellent: [
      {
        title: 'A European or Gulf application',
        body: 'A photograph is standard practice in France, Germany, Spain, Morocco and much of the Middle East, and its absence is occasionally read as an omission. This layout gives the portrait a proper place instead of pasting it into a corner — and still parses cleanly with it there.',
      },
      {
        title: 'A client-facing role',
        body: 'Recruitment, hospitality, sales and account management all trade on presence, and a portrait does real work in those applications. The unusual part is having that portrait on a document this machine-readable.',
      },
    ],
    strong: [
      {
        title: 'A market where a photo is expected',
        body: 'Continental Europe, North Africa, the Gulf and much of Asia treat a photograph as part of a complete CV. Here it is integrated into the header rather than floated on top of it, which is the difference between a designed document and a decorated one.',
      },
      {
        title: 'A personal introduction',
        body: 'Following up a conference conversation or a warm introduction, a face on the page reconnects your name to the person the reader met. Turn it off again for the portal version and nothing else about the document changes.',
      },
    ],
    moderate: [
      {
        title: 'A brand-led or public-facing role',
        body: 'When the job involves being seen — presenting, hosting, teaching, selling — a portrait is content rather than decoration, and this layout treats it that way.',
      },
      {
        title: 'A direct approach where you are already known',
        body: 'Sent to someone who has met you or seen your work, the photograph anchors the document to a memory. That is a real advantage, and it is worth the parsing trade-off in exactly this situation.',
      },
    ],
    limited: [
      {
        title: 'A portfolio-led creative approach',
        body: 'For photographers, art directors and stylists the portrait is a statement about how you frame an image, including one of yourself. Reviewers in these fields read that, and no screening system ever will.',
      },
      {
        title: 'An agent, gallery or representation submission',
        body: 'Representation is a personal relationship, and the submission is read as one. A composed page with a portrait belongs in that conversation in a way a plain text CV does not.',
      },
    ],
  },
  'no-photo': {
    excellent: [
      {
        title: 'A UK, US, Canadian or Irish application',
        body: 'Employers in these markets discourage photographs outright — some screening teams remove them before a hiring manager sees the file, to keep the process defensible. Starting without one means nothing has to be removed.',
      },
      {
        title: 'An anonymised or blind-screening process',
        body: 'Public bodies and larger employers increasingly strip identifying detail before review. A layout with no portrait slot survives that process unchanged, which is one less way for your CV to arrive looking damaged.',
      },
    ],
    strong: [
      {
        title: 'An application where the work speaks',
        body: 'No photograph means the top third of the page belongs to your name, your title and your profile — the three things a reviewer uses to decide whether to keep reading past six seconds.',
      },
      {
        title: 'A regulated or compliance-heavy sector',
        body: 'Finance, law, healthcare and the public sector all prefer a CV with no personal imagery, and often have policies that say so. This layout puts the emphasis on credentials instead.',
      },
    ],
    moderate: [
      {
        title: 'A design-led application without a portrait',
        body: 'You want the page to be art-directed and you would rather not put your face on it. The composition carries the visual interest, so nothing looks empty where a photograph would otherwise sit.',
      },
      {
        title: 'A studio submission with a linked portfolio',
        body: 'The images live behind a link and the CV carries the argument. That division of labour suits a photo-free layout: one document to read, one place to look.',
      },
    ],
    limited: [
      {
        title: 'An expressive CV for a photo-averse market',
        body: 'You are applying somewhere a portrait is discouraged but a plain document would undersell you. This is the compromise — visual ambition in the layout, nothing personal on the page.',
      },
      {
        title: 'A printed leave-behind',
        body: 'Printed for an interview, a portfolio review or a stand at a fair, where the object itself makes an impression. It is composed for paper first, and the absence of a portrait keeps it about the work.',
      },
    ],
  },
};

export function exampleUseCases(template: TemplateMeta): UseCase[] {
  const columns = columnsOf(template);
  const band = atsBand(template.atsScore);
  const voice = CATEGORY_VOICE[template.category];

  const channel = pick(CHANNEL[band][columns], template.id, 6);
  const audience = template.bestFor[0];
  const connector = pick(CHANNEL_CONNECTOR, template.id, 7);
  const scene = pick(PHOTO_SCENE[template.hasPhoto ? 'photo' : 'no-photo'][band], template.id, 8);

  const photoCloser = template.hasPhoto
    ? ` If the employer asks for a document without one, the photo toggle in the editor removes it and ${template.name} re-balances the header on its own.`
    : ` ${template.name} has no photo slot to remove, so the same file works in every market you send it to.`;

  return [
    {
      title: channel.title,
      body: audience ? `${channel.body} ${connector}: ${audience}.` : channel.body,
    },
    {
      title: pick(voice.fitTitle, template.id, 9),
      body: voice.fit[columns],
    },
    {
      title: scene.title,
      body: `${scene.body}${photoCloser}`,
    },
  ];
}

/* -------------------------------------------------------------------------- */
/* Customisation                                                               */
/* -------------------------------------------------------------------------- */

export interface CustomisationItem {
  title: string;
  description: string;
}

const DENSITY: Record<Columns, NonEmpty<string>> = {
  1: [
    'Font size, line height, section spacing and page margins are all sliders. On a single column they behave predictably: reduce section spacing first, margins second, and only then the type size — a CV set below 9.5pt starts to look like an attempt to hide its length.',
    'Three sliders control density — type size, line height and the gap between sections — and on a one-column page each of them affects the whole document evenly, so fitting two pages into one is a matter of small adjustments rather than deletions.',
  ],
  2: [
    'The column split is fixed, but everything inside it is not: type size, line height, section spacing and page margins all adjust, and on a divided page the margins are the setting that buys you the most room without crowding the rule between the columns.',
    'Density is yours to set. Because the side column is narrower, drop the type size a notch before you reduce margins — long certification names are the first thing to wrap awkwardly on a two-column page.',
  ],
};

export function customisationItems(template: TemplateMeta): CustomisationItem[] {
  const voice = CATEGORY_VOICE[template.category];
  const columns = columnsOf(template);

  const items: CustomisationItem[] = [
    {
      title: 'Accent colour',
      description: `${template.name} ships with ${template.accentDefault} as its accent. ${voice.colour}`,
    },
    {
      title: 'Fonts and heading style',
      description: `${voice.typography} Heading case — uppercase, capitalised or as typed — is a separate switch, and it changes the character of the page more than most people expect.`,
    },
    {
      title: 'Spacing and density',
      description: pick(DENSITY[columns], template.id, 10),
    },
    {
      title: 'Sections and order',
      description: `${voice.sections} Every section can be renamed, reordered or hidden, and Pro adds custom sections for anything the standard set does not cover.`,
    },
  ];

  items.push(
    template.hasPhoto
      ? {
          title: 'Photo',
          description:
            'The portrait can be circular, rounded or square, and it can be switched off entirely — the header reflows rather than leaving a hole, so one CV serves both a market that expects a photograph and one that does not.',
        }
      : {
          title: 'Paper size and export',
          description:
            'A4 or US Letter, switched in one control, with the layout re-flowing to the new page rather than being scaled to fit. The PDF is generated from the same code you see in the preview, so what you approve on screen is what downloads.',
        },
  );

  if (template.hasPhoto) {
    items.push({
      title: 'Paper size and export',
      description:
        'Switch between A4 and US Letter and the document re-flows to the new page instead of being scaled into it. The exported PDF is rendered from the same component as the preview, so nothing shifts between the screen and the file.',
    });
  }

  return items;
}

/* -------------------------------------------------------------------------- */
/* FAQ                                                                         */
/* -------------------------------------------------------------------------- */

const ATS_FAQ_ANSWER: Record<AtsBand, Record<Columns, NonEmpty<string>>> = {
  excellent: {
    1: [
      'Yes. It scores 5 out of 5 on our parsing checks: one column, standard headings, no tables, no text inside images and no icon fonts. An applicant tracking system reads the sections back in the order you arranged them.',
      'Yes — this is one of the safest layouts we publish. The page is a single sequence of headed text blocks, which is exactly the structure parsers were written to handle.',
    ],
    2: [
      'Yes, unusually so for a two-column design: it scores 5 out of 5 because the columns are divided by a rule rather than a filled panel and your employment history stays in one continuous block. A single column is still marginally safer if the employer is very large.',
    ],
  },
  strong: {
    1: [
      'Largely, yes — it scores 4 out of 5. Headings, dates, employers and job titles all extract correctly; the point it drops is for visual styling that a small number of older systems simplify. For a national employer or a government portal, a 5 out of 5 layout is the safer choice.',
      'It scores 4 out of 5, which is fine for the overwhelming majority of applications. The content parses; only some of the presentation may be flattened on the way in.',
    ],
    2: [
      'Mostly. It scores 4 out of 5 because the wide column keeps your experience and education in a single reading order — only the side column carrying skills and certifications is exposed to being re-ordered. A one-column layout remains the more reliable choice for portal applications.',
      'It scores 4 out of 5, high for a split page. The parts a screening system ranks you on sit in the main column and come through intact; a single-column template is still the safest option if the advert names a tracking system.',
    ],
  },
  moderate: {
    1: [
      'Partly. At 3 out of 5, the text is all extractable but the styling is doing enough work that some systems will return a plainer, re-ordered version. Use it where a person opens the file, and keep a single-column version for portals.',
    ],
    2: [
      'Only moderately — it scores 3 out of 5. A divided page with visible styling is the combination parsers handle least consistently, so send this version to people and a single-column version to application systems.',
    ],
  },
  limited: {
    1: [
      'No, and it does not try to be: it scores 2 out of 5. The composition that makes it worth sending to a creative director is the same composition a parser strips. Keep it for direct approaches and build a single-column version for anything uploaded.',
    ],
    2: [
      'No. At 2 out of 5 this is a designed document rather than a machine-readable one. It belongs in an inbox or a portfolio review, not in an upload field — build a plain version alongside it for those.',
    ],
  },
};

export function templateFaq(template: TemplateMeta): FaqEntry[] {
  const columns = columnsOf(template);
  const band = atsBand(template.atsScore);
  const voice = CATEGORY_VOICE[template.category];

  const photoAnswer = template.hasPhoto
    ? `Yes. ${template.name} has a dedicated photo slot, and you can choose a circular, rounded or square crop — or switch the photograph off completely, in which case the header closes up rather than leaving a gap. A photo is conventional in much of Europe, North Africa, the Middle East and Asia, and best left off for UK, US, Canadian and Irish applications.`
    : `No — ${template.name} is drawn without a photo slot, which is deliberate: UK, US, Canadian and Irish employers discourage photographs, and several screening teams remove them before review. If you need a portrait, filter the gallery for templates with photo support and switch to one without retyping anything.`;

  const planAnswer = template.premium
    ? `${template.name} is a Pro template. A Pro or Lifetime plan unlocks it along with all ${TEMPLATE_COUNT} designs, unlimited CVs, unlimited PDF downloads and full control over fonts, spacing and sections. If you would rather start free, ${FREE_TEMPLATE_COUNT} of our templates — including every high-scoring ATS layout — are available on the free plan.`
    : `${template.name} is free. Create an account, write your CV and download the PDF without paying: it is one of ${FREE_TEMPLATE_COUNT} free templates. Pro exists for people who want all ${TEMPLATE_COUNT} designs, unlimited CVs and downloads, custom sections and no credit line on the export.`;

  const layoutEntry: FaqEntry = {
    question:
      columns === 1
        ? `Why is ${template.name} a single-column layout?`
        : `How does the two-column layout in ${template.name} work?`,
    answer:
      columns === 1
        ? `One column keeps a single reading order for both a human and a parser: your sections appear in the sequence you set, and nothing competes for attention beside them. It also prints and photocopies predictably, and it is the format most recruiters say they prefer to receive.`
        : `Skills, languages and certifications are routed into the narrow column automatically, while experience, education and your profile stay in the wide one. You do not lay it out by hand — enable a section in the editor and it lands on the correct side. If a section is empty it disappears rather than leaving white space.`,
  };

  const categoryEntry: FaqEntry = {
    question: voice.faq.question,
    answer: pick(voice.faq.answer, template.id, 12),
  };

  return [
    {
      question: `Is the ${template.name} template ATS-friendly?`,
      answer: pick(ATS_FAQ_ANSWER[band][columns], template.id, 11),
    },
    {
      question: `Can I use a photo with ${template.name}?`,
      answer: photoAnswer,
    },
    {
      question: template.premium
        ? `Do I need a paid plan to use ${template.name}?`
        : `Is ${template.name} really free?`,
      answer: planAnswer,
    },
    pick([layoutEntry, categoryEntry] as const, template.id, 13),
  ];
}

/* -------------------------------------------------------------------------- */
/* Metadata copy                                                               */
/* -------------------------------------------------------------------------- */

/**
 * "Formal CV" must not become "Formal CV CV template", and "ATS Resume" must not become
 * "ATS Resume CV template" — a third of the library already carries the noun in its name.
 */
export function templateHeading(template: TemplateMeta, noun = 'template'): string {
  return /\b(cv|resume)$/i.test(template.name)
    ? `${template.name} ${noun}`
    : `${template.name} CV ${noun}`;
}

/**
 * Title qualifiers, longest first.
 *
 * `templateMetaTitle` picks the longest one that still leaves the finished title inside
 * the roughly 60-character window a search result actually displays — including the
 * ` | CreateCVOnline` suffix the metadata helper appends. A qualifier that gets truncated
 * to an ellipsis is worse than no qualifier at all.
 */
function metaQualifiers(template: TemplateMeta): string[] {
  const columns = columnsOf(template) === 1 ? 'One-Column' : 'Two-Column';
  const plan = template.premium ? 'Pro' : 'Free';
  const ats = template.atsScore >= 5 ? 'ATS-Friendly' : null;

  return [
    ats ? `${plan} ${ats} ${columns}` : `${plan} ${columns} ${categoryLabel(template.category)}`,
    ats ? `${plan} ${ats}` : `${plan} ${columns}`,
    ats ?? categoryLabel(template.category),
    plan,
  ];
}

/** Characters the metadata helper adds for the brand suffix. */
const BRAND_SUFFIX_LENGTH = ' | CreateCVOnline'.length;

/**
 * The window a search result actually displays, in characters.
 *
 * 68 was the number here, contradicting the comment four lines above that says 60. Google
 * truncates on rendered pixel width rather than a character count, but ~60 characters of
 * mixed-case Latin is the usual place it lands; at 68 the qualifier this function works so
 * hard to fit is exactly what gets cut. Dropping it to 60 means some templates fall back
 * to a shorter qualifier, which is the intended behaviour: a qualifier that survives beats
 * a longer one replaced by an ellipsis.
 */
const TITLE_BUDGET = 60;

export function templateMetaTitle(template: TemplateMeta): string {
  const heading = templateHeading(template, 'Template');
  const available = TITLE_BUDGET - BRAND_SUFFIX_LENGTH - heading.length - ' — '.length;

  for (const qualifier of metaQualifiers(template)) {
    if (qualifier.length <= available) return `${heading} — ${qualifier}`;
  }
  return heading;
}

function clamp(text: string, max: number): string {
  if (text.length <= max) return text;
  const cut = text.slice(0, max);
  const lastSpace = cut.lastIndexOf(' ');
  return `${cut.slice(0, lastSpace > 0 ? lastSpace : max).replace(/[,;:.\s]+$/, '')}…`;
}

const META_CLOSER: Record<AtsBand, Record<'free' | 'pro', string>> = {
  excellent: {
    free: 'Free, ATS-safe and editable online — download as a PDF in minutes.',
    pro: 'ATS-safe, fully editable online and ready to download as a PDF.',
  },
  strong: {
    free: 'Free to use, ATS-tested and editable online with instant PDF download.',
    pro: 'ATS-tested, editable online and downloadable as a PDF in minutes.',
  },
  moderate: {
    free: 'Free to edit online, then download as a print-ready PDF.',
    pro: 'Edit it online, set your own colours and fonts, download a print-ready PDF.',
  },
  limited: {
    free: 'Free to customise online and download as a high-resolution PDF.',
    pro: 'Customise the colours, fonts and sections online, then download a PDF.',
  },
};

export function templateMetaDescription(template: TemplateMeta): string {
  const closer = META_CLOSER[atsBand(template.atsScore)][template.premium ? 'pro' : 'free'];
  return clamp(`${template.tagline} ${closer}`, 178);
}
