import {
  FREE_TEMPLATE_COUNT,
  TEMPLATES,
  TEMPLATE_CATEGORIES,
  TEMPLATE_COUNT,
} from '@/lib/cv/template-registry';
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

/**
 * Each template's position within its own category, 0-indexed.
 *
 * This replaces a hash of the template id, and the difference is the whole point.
 *
 * A hash spreads sentences evenly across the *catalogue* while guaranteeing nothing about
 * any particular pair. Two templates in the same category, with the same column count and
 * the same ATS band, draw from exactly the same pools — and a hash lets them land on the
 * same option about as often as not. Measured on the built pages, Modern Professional and
 * Modern Clean came out sharing 64% of their six-word phrases: same family, same one-column
 * layout, same 5/5 score, and the hash happened to agree with itself on nearly every slot.
 *
 * Cycling by position guarantees the opposite. Ten siblings drawing from a pool of four take
 * options 0, 1, 2, 3, 0, 1, 2, 3, 0, 1 — adjacent templates never collide and the worst case
 * is bounded by the pool size rather than left to chance. It also means every sentence added
 * to a pool buys the most separation it can, which is the argument for widening them.
 *
 * Still deterministic: the ordinal comes from registry order, so a template produces the
 * same page on every build.
 */
const CATEGORY_ORDINAL: ReadonlyMap<string, number> = (() => {
  const ordinals = new Map<string, number>();
  const seen = new Map<string, number>();
  for (const template of TEMPLATES) {
    const next = seen.get(template.category) ?? 0;
    ordinals.set(template.id, next);
    seen.set(template.category, next + 1);
  }
  return ordinals;
})();

function pick<T>(options: NonEmpty<T>, id: string, salt: number): T {
  const ordinal = CATEGORY_ORDINAL.get(id) ?? 0;
  return options[(ordinal + salt) % options.length] ?? options[0];
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
  colour: NonEmpty<string>;
  typography: string;
  sections: NonEmpty<string>;
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
    colour: [
      'The accent drives headings, rules and any highlighted detail. A deep navy, a slate or a saturated brand colour all hold up — the hierarchy does not depend on the hue, so choosing is a taste decision rather than a legibility one.',
      'Nothing structural depends on the colour here: take it to near-black and the page still reads correctly, because the hierarchy is carried by weight and space. That makes it the safest family to experiment in.',
      'One accent, used in three or four places. Because it appears so sparingly, a bright colour reads as deliberate rather than loud — the mistake in this family is usually too many colours, not too strong a one.',
      'Pick the accent last, after the content is settled. On this layout it is doing emphasis rather than decoration, so the right choice depends on which lines you want a reader to land on first.',
    ],
    typography:
      'A humanist or geometric sans throughout gives the intended look. Setting a serif for headings only is the one substitution that changes the personality without breaking the spacing.',
    sections: [
      'Summary, experience, education and skills carry the weight. Projects and certifications drop in without upsetting the rhythm, and anything you are not using can be hidden rather than left empty.',
      'The order is yours, and on this layout the first two sections do most of the work — whatever you put after education is read as supporting material rather than as part of the case.',
      'Because the spacing is even throughout, adding a section costs a predictable amount of room rather than throwing the page out. That makes this an easy family to extend as a career grows.',
      'A summary is optional here and often worth dropping if your first role speaks for itself: this layout does not leave a visible gap where one used to be.',
    ],
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
    colour: [
      'Corporate readers are unlikely to notice the accent and very likely to notice a wrong one. Navy, charcoal and deep green are the safe register; anything brighter reads as a marketing document rather than a professional one.',
      'The colour appears in the header band and the section rules, which is enough to look considered and little enough to stay sober. If you are applying to a firm whose brand you know, matching it quietly is a reasonable move.',
      'This is a document a hiring manager will print. Choose a colour that still separates from black on a laser printer — mid greys and pale blues collapse into the text and lose you the structure.',
      'Restraint is the register. A single dark accent used on headings and nothing else is what makes the page read as senior; the temptation to brighten it is worth resisting.',
    ],
    typography:
      'A neutral sans body with a heavier heading weight is the safe pairing. A transitional serif for headings is the alternative if the employer is an older institution rather than a modern corporate.',
    sections: [
      'Experience is the section that matters and the layout knows it. Keep education short, put certifications after it, and resist adding sections that dilute the scope you are demonstrating.',
      'A corporate reader scans for scope before anything else, so the order that works is summary, experience, then whatever evidences scale — budget, headcount, territory. Interests belong last or not at all.',
      'This layout rewards fewer, fuller sections. Four well-populated blocks read as seniority; eight thin ones read as padding, whatever the content.',
      'Move certifications up if they are the licence to practise in your field, and down if they are professional development. On this page, position is the signal.',
    ],
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
    colour: [
      'This is the family where the colour is part of the argument. A saturated accent is fine and often right — the layout is drawn to carry one, and a muted choice can make a portfolio CV look tentative.',
      'The accent is doing real work here rather than decorating, so pick it the way you would pick a colour for a piece of work: against the images you will be sending alongside it.',
      'Two colours is usually one too many. Set the accent to something you would defend in a portfolio review and let the layout do the rest — the design already has enough going on.',
      'A pale accent will look washed out in print even where it works on screen. If you are shortlisting on colour, print one page before you decide.',
    ],
    typography:
      'A display or editorial face for headings over a quiet body face is the pairing this layout is drawn around. Let one voice lead — setting both at high contrast is what turns an art-directed CV into a noisy one.',
    sections: [
      'Projects and a portfolio link usually deserve to sit above education here, because they are the evidence. The section order is yours and this is the family where reordering makes the most difference.',
      'A creative CV is often a cover for a portfolio rather than a standalone document, so put the link where a skim will find it and keep the written sections shorter than you would elsewhere.',
      'The layout carries an unusual section well — exhibitions, commissions, stockists, residencies. Custom sections exist for exactly this and the page does not look odd with one in it.',
      'Skills as a long tag list works better here than a rated one: the reader is looking for tools they recognise, not for how you scored yourself.',
    ],
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
    colour: [
      'The accent marks section boundaries and any rated element. Blues and teals are the convention in this category, but nothing about the layout requires them — the structure holds at any hue.',
      'Skills, levels and tags all pick up the accent, so a strong colour has more surface here than it does on a prose-heavy layout. Worth turning down a notch from whatever you would choose elsewhere.',
      'Terminal greens and electric blues are the cliché, which is not a reason to avoid them — a technology CV that looks like one is doing its job. Just pick a dark enough shade to stay readable on paper.',
      'The colour is load-bearing on this layout: it is what separates one section from the next. Take it too pale and the page stops having structure.',
    ],
    typography:
      'A clean sans keeps library names, version numbers and acronyms legible at 10pt, which is where a technical CV is actually read. Decorative heading faces make a stack list harder to scan for no gain.',
    sections: [
      'Skills, projects and experience are the three that matter and the layout gives all three room. Education can go last after a few years — nobody is checking your degree once you have shipped things.',
      'Put open source and side projects where a technical reader will find them, which on this page is above education. They are frequently the most-read section.',
      'A long tool list is normal in this field and this layout is built to hold one without turning into a chart. Group it by kind rather than by confidence.',
      'Certifications carry real weight in some corners of this industry and none in others. The section is easy to move, so put it where it is worth being for the roles you are applying to.',
    ],
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
    colour: [
      'Classic layouts want the colour almost absent. Near-black, dark navy or a deep burgundy on the headings alone is the whole intervention — anything more and the design starts arguing with itself.',
      'The convention in this register is one dark colour used for the name and the section rules and nowhere else. It is the difference between "typeset" and "designed", and typeset is what you want here.',
      'If in doubt, set the accent to the same colour as the body text. This family reads perfectly well in a single colour, and a purely black-and-white version is never wrong for law, government or academia.',
      'Colour is the one modern element in an otherwise traditional page, which is why it should be quiet. A dark accent signals that a choice was made; a bright one undoes the register.',
    ],
    typography:
      'A serif body is the point of this family. If you switch to a sans, drop the font size a notch — the spacing is set for serif text and looks loose without it.',
    sections: [
      'The conventional order is expected here and worth keeping: education before experience early in a career, the reverse once you have a few years. Deviating is noticed in this register.',
      'This family is read by people who know what a CV should look like, which means an unfamiliar section order costs more than it gains. Keep it orthodox and let the content differ.',
      'Publications, memberships and appointments all sit naturally in this layout, which is why it suits academic and professional careers where those sections are expected rather than optional.',
      'Length is not the constraint it is elsewhere. A classic CV running to three pages is normal in academia and law, and this layout paginates cleanly rather than fighting it.',
    ],
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
    fitTitle: [
      'Straight through the portal',
      'For the machine that reads first',
      'Uploaded, not emailed',
    ],
    fit: {
      1: 'Plain headings, plain lists and one text flow mean the file you upload is the file the system reads back: no reordered sections, no dropped job titles, no dates attached to the wrong employer.',
      2: 'Even split across two columns, the record of employment stays in one block, which is the part of the document a parser is most likely to mangle.',
    },
    colour: [
      'The colour is cosmetic here by design — a parser reads text, not hue, so nothing you choose affects the score. Keep it dark enough that the printed version still separates headings from body.',
      'Use the accent for headings only. It costs nothing in parseability and it is the one thing stopping the document reading as a plain text file.',
      'Any colour is safe from a parsing point of view. The only real constraint is print: pale accents disappear on a black-and-white printer, and these are the layouts most likely to be printed by a recruiter.',
      'Nothing in the parsing behaviour changes with the accent, so this is purely a question of how the page looks to the human who reads it after the system does.',
    ],
    typography:
      'Stay with a common sans or serif. Unusual faces can export with non-standard character mappings, which produces a PDF that looks correct and extracts as gibberish — precisely the failure this family exists to prevent.',
    sections: [
      'Standard section names are part of what makes these layouts safe: a parser matches on "Work Experience" and "Education" and can miss a cleverer heading. Rename with care.',
      'Keep the order conventional and the headings plain. Everything that makes this document parse well is a choice not to be interesting, and section naming is the easiest place to undo it.',
      'Sections can be reordered freely — the parser follows the document — but the names are worth leaving alone. "Professional Experience" is recognised; "Where I have been" is not.',
      'Fewer sections parse more reliably than many. If a block is one line long, fold it into another rather than giving it its own heading.',
    ],
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
        before:
          'There is little left to fix here. If you want to see how the rest of the parser-safe range compares — and what a 5 out of 5 is actually measuring — the ',
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
        before:
          'For most applications this is safe. Where the employer is very large, or the advert names a specific tracking system, a plainer single-column layout removes the remaining doubt: compare it against the ',
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
      before:
        'Use this one where a person opens the file: a direct approach, a studio, an agent, a client, a networking introduction. For anything uploaded to a careers portal, build a second version from the ',
      linkLabel: 'ATS CV templates',
      after:
        ' — the same content, a layout that survives extraction, and no need to write anything twice.',
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
      /*
       * `voice.fit` is one sentence per category and column count, which means every one of
       * ten siblings printed it verbatim. The template's own `features` are hand-written and
       * unique, so the shared sentence now has something of this template's in front of it —
       * the same move as the distinctive FAQ entry, and for the same reason: a pool cannot
       * separate a pair better than one-over-its-length, and per-template data has no floor.
       */
      body: template.features[0]
        ? `${template.features[0]} is the part of ${template.name} that decides this. ${voice.fit[columns]}`
        : voice.fit[columns],
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

/**
 * What is worth saying about customising *this* template.
 *
 * This block used to be five cards and 289 of the page's 1,248 words, and three of those
 * cards were hardcoded strings: sections can be renamed, the portrait can be circular, A4
 * or US Letter re-flows rather than scaling. All true, all true of every one of the
 * fifty-six, and all repeated word for word on fifty-six URLs. Measured on the built HTML,
 * this section was the single largest contributor to 81.3% of six-word phrases appearing on
 * two or more template pages.
 *
 * The temptation is to widen a pool and generate fifty-six ways of saying "you can rename a
 * section", which produces fifty-six pages of differently-worded identical information —
 * thinner, not less duplicated. A universal product fact belongs on one page. `/cv-builder`
 * and `/features` already carry these, and the page links to them.
 *
 * What is left is three cards that could only be written about this template: its own accent
 * and what that accent is actually driving in this layout, the density control that matters
 * most at this column count, and the structural decision this design has already made for
 * you. Roughly 130 words instead of 289, and none of it boilerplate.
 */
export function customisationItems(template: TemplateMeta): CustomisationItem[] {
  const voice = CATEGORY_VOICE[template.category];
  const columns = columnsOf(template);

  return [
    {
      title: 'Accent colour',
      description: `${template.name} ships with ${template.accentDefault}. ${pick(voice.colour, template.id, 3)}`,
    },
    {
      title: columns === 2 ? 'Density, on a divided page' : 'Density',
      description: pick(DENSITY[columns], template.id, 10),
    },
    {
      title: template.hasPhoto
        ? 'The photo, and what happens without it'
        : 'What this layout fixes',
      description: template.hasPhoto
        ? pick(PHOTO_NOTE[columns], template.id, 11)
        : `${pick(voice.sections, template.id, 5)} ${pick(NO_PHOTO_NOTE, template.id, 12)}`,
    },
  ];
}

/**
 * The photo note, which is genuinely template-specific: switching the portrait off changes
 * the header on a one-column design and the whole sidebar on a two-column one.
 */
const PHOTO_NOTE: Record<Columns, NonEmpty<string>> = {
  1: [
    'The portrait sits in the header and can be circular, rounded or square. Switch it off and the header reflows around the name rather than leaving a gap, which is what lets one document serve both a market that expects a photograph and one that forbids it.',
    'Turning the photo off here closes the header up rather than leaving a hole in it, so the same file works for a Casablanca application and a London one without a second version.',
  ],
  2: [
    'The portrait anchors the side column, so switching it off shortens that column rather than emptying it — the sections below simply move up. Worth checking both ways before you commit, because the balance between the columns changes.',
    'With the photo on, the side column reads as a profile; with it off, as a reference list. Both work in this layout, but they are different documents and it is worth looking at each.',
  ],
};

/** For templates with no photo slot, why that is a design decision rather than an omission. */
const NO_PHOTO_NOTE: NonEmpty<string> = [
  'There is no photo slot to switch off, which is the point: nothing has to be removed before sending it to an employer that does not want one.',
  'No portrait is drawn at any setting, so the document does not need a second version for markets where a photograph is discouraged.',
];

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

  /*
   * These two were single strings, which made them the largest guaranteed-identical block on
   * the page: every one of the forty photo-less templates carried the same sixty words, and
   * every one of the forty Pro templates the same sixty after that. Four answers to write
   * three ways each is the cheapest separation available anywhere in this file.
   */
  const photoAnswer = template.hasPhoto
    ? pick(
        [
          `Yes. ${template.name} has a dedicated photo slot, and you can choose a circular, rounded or square crop — or switch the photograph off completely, in which case the header closes up rather than leaving a gap. A photo is conventional in much of Europe, North Africa, the Middle East and Asia, and best left off for UK, US, Canadian and Irish applications.`,
          `Yes, and it is worth deciding early rather than late: the portrait is part of how ${template.name} balances its header, so adding one at the end changes the composition. Circular, rounded and square crops are all available, and turning it off closes the space rather than leaving it.`,
          `It supports one. Whether you should use one depends entirely on where you are applying — expected in much of continental Europe and the Gulf, quietly discouraged in the UK, and actively removed by some US screening teams before a human sees the file. Both versions come out of the same document here.`,
        ] as const,
        template.id,
        14,
      )
    : pick(
        [
          `No — ${template.name} is drawn without a photo slot, which is deliberate: UK, US, Canadian and Irish employers discourage photographs, and several screening teams remove them before review. If you need a portrait, filter the gallery for templates with photo support and switch to one without retyping anything.`,
          `There is no photo in this one, by design. It means the document needs no editing before it goes to an employer that does not want one, which is most of them in the English-speaking market. Switching to a template that does have a photo keeps everything you have written.`,
          `No, and that is the point of choosing it. A CV without a portrait is the safe default for UK and North American applications; if you also need a version with one, swap the template rather than the content — nothing is retyped.`,
        ] as const,
        template.id,
        14,
      );

  const planAnswer = template.premium
    ? pick(
        [
          `${template.name} is a Pro template. A Pro or Lifetime plan unlocks it along with all ${TEMPLATE_COUNT} designs, unlimited CVs, unlimited PDF downloads and full control over fonts, spacing and sections. If you would rather start free, ${FREE_TEMPLATE_COUNT} of our templates — including every high-scoring ATS layout — are available on the free plan.`,
          `This one is on the paid tier. What that buys is the whole catalogue rather than this design alone — ${TEMPLATE_COUNT} templates, unlimited documents and downloads, and no credit line on the export. It is worth starting on one of the ${FREE_TEMPLATE_COUNT} free layouts and switching later, because switching keeps every word.`,
          `Yes, a plan is needed for ${template.name}. Lifetime is a single payment rather than a subscription if you would rather not have another one. The free tier covers ${FREE_TEMPLATE_COUNT} designs and includes PDF download, so you can write the CV first and decide afterwards.`,
        ] as const,
        template.id,
        15,
      )
    : pick(
        [
          `${template.name} is free. Create an account, write your CV and download the PDF without paying: it is one of ${FREE_TEMPLATE_COUNT} free templates. Pro exists for people who want all ${TEMPLATE_COUNT} designs, unlimited CVs and downloads, custom sections and no credit line on the export.`,
          `Free, including the download — there is no watermark and no paywall at the export step, which is where most builders put one. Pro adds the other ${TEMPLATE_COUNT - FREE_TEMPLATE_COUNT} designs and unlimited documents if you end up wanting them.`,
          `Yes, genuinely. ${template.name} is one of ${FREE_TEMPLATE_COUNT} templates you can use and export without paying anything. The paid plans are about breadth — every design, unlimited CVs, custom sections — rather than about unlocking this page.`,
        ] as const,
        template.id,
        15,
      );

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

  /*
   * The one answer that cannot be shared with a sibling.
   *
   * Everything else on this page is selected from a pool, and a pool has a hard floor: ten
   * templates in a category drawing from four options means some pair says the same thing,
   * however well the picking is spread. `features` and `bestFor` do not have that floor —
   * they are hand-written per template and no two are alike — so the way out of the last of
   * the duplication is to generate from those rather than to keep widening pools.
   */
  const [first, second, third] = template.features;
  const distinctiveEntry: FaqEntry = {
    question: `What makes ${template.name} different from the other ${categoryLabel(template.category).toLowerCase()} templates?`,
    answer:
      `Four things are specific to this one: ${[first, second, third]
        .filter(Boolean)
        .map((feature) => (feature ?? '').charAt(0).toLowerCase() + (feature ?? '').slice(1))
        .join(', ')}. ` +
      `It was drawn for ${template.bestFor
        .slice(0, 2)
        .map((audience) => audience.charAt(0).toLowerCase() + audience.slice(1))
        .join(' and ')}, which is the readership the spacing and the section order assume. ` +
      `If that is not you, the ${categoryLabel(template.category).toLowerCase()} family has ${
        TEMPLATES.filter((entry) => entry.category === template.category).length - 1
      } other designs drawn for different readers.`,
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
    distinctiveEntry,
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
