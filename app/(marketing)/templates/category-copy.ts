import { TEMPLATE_CATEGORIES, templatesByCategory } from '@/lib/cv/template-registry';
import type { TemplateCategory, TemplateDefinition } from '@/types/cv';

/**
 * Copy for the six template category pages.
 *
 * Written by hand, one block per category, rather than generated from a sentence
 * skeleton. Six pages is exactly the scale at which hand-written copy is affordable and
 * templated copy is obvious — and the specification's own rule is to create a category
 * page only "where there is enough unique value".
 *
 * Note what is *not* here: no `/templates/executive` or `/templates/student`. Those are
 * not categories in the registry, so such a page could only re-filter the same designs
 * under a new URL. That is a doorway page, and the audience advice it would carry already
 * lives on `/cv-for/[profession]` where it belongs.
 */

export interface CategoryCopy {
  /** Search-facing name, used in the H1 and title. */
  heading: string;
  metaTitle: string;
  metaDescription: string;
  /** Two or three sentences under the H1. */
  lede: string;
  /** Who should pick from this category, and who should not. */
  audience: { forYou: string[]; notForYou: string };
  /** What the designs in this category actually have in common. */
  characteristics: { title: string; description: string }[];
  /** An honest paragraph about how this category behaves in an ATS. */
  ats: string;
  faq: { question: string; answer: string }[];
  /** Slugs of the two most closely related categories. */
  related: TemplateCategory[];
}

export const CATEGORY_COPY: Record<TemplateCategory, CategoryCopy> = {
  modern: {
    heading: 'Modern CV templates',
    metaTitle: 'Modern CV Templates — Clean, Contemporary Designs',
    metaDescription:
      'Modern CV templates with generous whitespace, a single accent colour and contemporary type. Ten designs, most of them ATS-safe. Free to start.',
    lede: 'Contemporary layouts that look current without shouting. If you are not sure what your industry expects, this is the safest place to start — a modern template reads as considered in almost any sector, and half of the ten here are single-column designs a parser handles without complaint.',
    audience: {
      forYou: [
        'Anyone with two to fifteen years of experience applying through an online portal',
        'Career changers who need the work history to lead, not the design',
        'Applicants in sectors with no strong formatting convention — most of tech, marketing, operations and general business',
      ],
      notForYou:
        'If you are applying to a law firm, a university department or a public body, the Classic category is a better fit — those readers expect a conventional document and a contemporary one can read as unserious.',
    },
    characteristics: [
      {
        title: 'Whitespace does the work',
        description:
          'Sections are separated by space and typographic weight rather than boxes and rules, which keeps the page calm at a glance and easy to skim.',
      },
      {
        title: 'One accent colour',
        description:
          'A single colour marks headings and rules. Changing it changes the whole document, and the default for each design is chosen to stay legible in greyscale when someone prints your CV.',
      },
      {
        title: 'Restraint over decoration',
        description:
          'No icons competing with text, no skill bars presented as evidence. The visual interest comes from the type and the grid.',
      },
    ],
    ats: 'Most of the modern designs are single-column and score 5/5 on our parser-safety heuristic, including Modern ATS, which exists specifically for portals. The two-column members — Modern Executive, Modern Corporate, Modern Compact — score 3 or 4 because reading order in a two-column layout depends on how the extractor walks the document. If you are applying through a large employer’s portal rather than emailing a person, pick a one-column design from this category.',
    faq: [
      {
        question: 'Is a modern template appropriate for a senior role?',
        answer:
          'Yes. Modern Executive and Modern Corporate were designed for people with fifteen or more years of history: the sidebar moves contact details and skills out of the way so the main column carries nothing but the narrative of your career. The perception that senior CVs must look traditional is largely a UK legal and academic convention rather than a general rule.',
      },
      {
        question: 'Will the accent colour print badly?',
        answer:
          'Every default accent in this category has been chosen to remain legible when a reader prints in greyscale, which still happens more often than people expect. If you change it, avoid pale yellows and mid-greys — they flatten out.',
      },
      {
        question: 'How many pages should a modern CV be?',
        answer:
          'The template does not decide that; your history does. Two pages is normal in the UK and Europe. If you are under roughly ten years into a career, one page is usually achievable and is expected on a US résumé.',
      },
      {
        question: 'Can I use a photo?',
        answer:
          'Several designs in this category support one and it can be switched off in the editor. Whether you should is regional: a photo is expected in Germany and France, neutral in much of the MENA region, and usually avoided in the UK, Ireland and the US, where employers may discard a CV carrying one to reduce bias-claim exposure.',
      },
    ],
    related: ['ats', 'corporate'],
  },

  corporate: {
    heading: 'Corporate CV templates',
    metaTitle: 'Corporate CV Templates for Business Roles',
    metaDescription:
      'Structured CV templates for finance, consulting, management and sales. Restrained designs that put rigour before personality. Ten layouts.',
    lede: 'Structured, disciplined designs for environments where a CV is assessed on rigour first. These are the templates for finance, consulting, banking, HR and management — sectors where a document that looks improvised undermines the content, however good the content is.',
    audience: {
      forYou: [
        'Finance, banking, accounting, audit and consulting applicants',
        'Managers and department heads at any level',
        'Sales, operations, HR and marketing roles inside larger organisations',
      ],
      notForYou:
        'For a design, art-direction or content role, the Creative category will serve you better — in those fields the document is itself a work sample, and a corporate layout reads as a missed opportunity.',
    },
    characteristics: [
      {
        title: 'A visible grid',
        description:
          'Dates align down a consistent edge, entries share a common indent, and the eye can compare two roles without re-reading. Finance CV in particular aligns every date into a fixed right-hand column.',
      },
      {
        title: 'Conservative colour',
        description:
          'Deep navy, forest and slate defaults. Colour marks structure rather than drawing attention to itself.',
      },
      {
        title: 'Room for outcomes',
        description:
          'These layouts assume achievement bullets with numbers in them and give them space to breathe, because that is what the reader is looking for.',
      },
    ],
    ats: 'The category ranges from 3/5 to 5/5. Finance CV and Operations CV are single-column and score 5. Marketing CV is the outlier at 3: its split two-tone header is deliberately expressive, and a header split across two coloured panels is exactly the construct that confuses a naive text extractor. If you are applying through a portal for a finance or audit role, take Finance CV or Business Professional.',
    faq: [
      {
        question: 'Which template suits a consulting application?',
        answer:
          'Consultant CV, which uses side-label sections — the heading sits in a fixed left gutter with the content beside it. It reads as structured thinking, which is the trait being assessed. Corporate Executive is the alternative if you want something more formal.',
      },
      {
        question: 'Do investment banks and Big Four firms have formatting rules?',
        answer:
          'Many run their own application forms rather than accepting a CV directly, and graduate programmes in particular often specify a format. Read the posting first. Where a CV is accepted, a single-column, conservatively typeset document is the safe choice — Business Professional or Finance CV.',
      },
      {
        question: 'Should a manager list team size and budget?',
        answer:
          'Yes, and prominently. Scope is the fastest way for a reader to place you: headcount managed, budget owned, revenue influenced, region covered. Management CV gives the experience section room for exactly that.',
      },
      {
        question: 'Is two pages acceptable for a senior corporate CV?',
        answer:
          'Two pages is standard and three is defensible past twenty years or where a long publication or transaction list is genuinely relevant. What is not acceptable is padding one page of substance across two.',
      },
    ],
    related: ['classic', 'modern'],
  },

  creative: {
    heading: 'Creative CV templates',
    metaTitle: 'Creative CV Templates for Designers and Studios',
    metaDescription:
      'Expressive CV templates for designers, art directors, photographers and content creators — where the document itself is a work sample.',
    lede: 'Expressive layouts for fields where the CV is read as a sample of your work. A poster masthead, an editorial two-column spread, a gallery frame — these designs take a position, which is the point. They also make the clearest trade-off in the library: visual ambition costs parser reliability.',
    audience: {
      forYou: [
        'Graphic designers, art directors and visual designers',
        'Photographers, illustrators and content creators',
        'Product and UX designers applying to studios rather than large corporate portals',
      ],
      notForYou:
        'If the application goes through a large employer’s applicant tracking system — which is common even for in-house design roles at big companies — send an ATS template instead and bring the portfolio separately.',
    },
    characteristics: [
      {
        title: 'A deliberate composition',
        description:
          'Each design has a real idea behind it: Graphic Designer is a poster, Editorial is a magazine spread, Photographer is a framed print. They are not one layout with the colours changed.',
      },
      {
        title: 'Type as the主 material',
        description:
          'Oversized names, vertical word stacks, drop-cap section initials. The typography carries the personality, so the content does not have to compete with ornament.',
      },
      {
        title: 'Space for projects',
        description:
          'Portfolio Style promotes the projects section into large cards, on the reasonable assumption that in a creative field the work matters more than the job titles.',
      },
    ],
    ats: 'Be honest with yourself about the route your application takes. Most of this category scores 2 or 3 out of 5 — full-bleed headers, two-column reading order and photos that bleed to the page edge are all things a text extractor handles unpredictably. That is an acceptable price when a human opens the PDF, which is normal at studios and agencies. It is the wrong bet for an in-house role at a large company. Creative Professional (4/5) and UI/UX Designer (4/5) are the compromises: they still look designed, but the body is a conventional flow.',
    faq: [
      {
        question: 'Should a designer use a creative CV or an ATS one?',
        answer:
          'It depends entirely on who opens it. A studio or agency application is read by a person, usually a designer, and a plain document there is a wasted signal. A role at a large company almost certainly passes through a parser first. Many designers keep two versions — that is what unlimited CVs on the Pro plan is for.',
      },
      {
        question: 'Does a creative CV replace a portfolio?',
        answer:
          'No, and it should not try. The CV establishes scope, tools and trajectory; the portfolio shows the work. Every template here has a prominent link field — use it, and make sure the URL is short enough to be typed from a printout.',
      },
      {
        question: 'Are two columns a problem?',
        answer:
          'For a human reader, no — a well-set two-column CV is easier to scan than a wall of text. For a parser, sometimes: reading order depends on how the extractor walks the document, and some walk column-by-column while others walk line-by-line across both. That uncertainty is the whole reason the ATS category exists.',
      },
      {
        question: 'Can I use my own brand colours?',
        answer:
          'Yes — accent, heading and body colours are all editable, and for a designer with an existing personal identity that is usually the first thing to change. Check the result in greyscale before you send it.',
      },
    ],
    related: ['technology', 'modern'],
  },

  technology: {
    heading: 'Technology CV templates',
    metaTitle: 'Tech CV Templates for Engineers and Data Roles',
    metaDescription:
      'CV templates for software engineers, data scientists, DevOps, security and product roles. Room for a stack and real projects, without keyword dumping.',
    lede: 'Engineering-oriented layouts with proper room for a technical stack, side projects and open-source work — without turning the document into a keyword dump. Ten designs, from a plain single-column standard to a pipeline motif and a terminal-card header.',
    audience: {
      forYou: [
        'Software engineers, full-stack developers and mobile engineers',
        'Data scientists, analysts, DevOps, SRE and security specialists',
        'Product managers and technical leads',
      ],
      notForYou:
        'If you are early in a career with no shipped work yet, the ATS category — Student CV or Entry-Level Resume in particular — gives education and projects the prominence they need.',
    },
    characteristics: [
      {
        title: 'Skills as prose, not decoration',
        description:
          'Software Engineer and Tech Minimal render skills as category prose — "Languages: Go, TypeScript, Python" — because that is both what a parser reads cleanly and what an engineer reading it actually wants.',
      },
      {
        title: 'Projects treated as first-class',
        description:
          'Open-source and side projects get the same structural weight as employment, with room for a link, a stack and a result.',
      },
      {
        title: 'A motif, not a costume',
        description:
          'DevOps Engineer uses a CI-pipeline rail, Modern Tech a terminal card, Data Scientist a bracket motif. One idea each, applied to the chrome — never at the expense of the text.',
      },
    ],
    ats: 'Most of this category scores 4/5, and Software Engineer and Tech Minimal score 5. The single most useful thing you can do for parsing in a technical field is to write the stack as plain comma-separated text under a heading a parser recognises, rather than as a grid of logos or a row of proficiency bars. A bar claiming "React: 90%" tells a reader nothing verifiable and tells a parser nothing at all.',
    faq: [
      {
        question: 'How should I list a technical stack?',
        answer:
          'Grouped and written out: "Languages: …", "Infrastructure: …", "Data: …". Set the skill display to Text in the editor. Group by category rather than listing thirty items flat, and drop anything you would not want to be interviewed on.',
      },
      {
        question: 'Do I need a GitHub link?',
        answer:
          'Only if what is there helps you. An active profile with real projects is strong evidence; a profile with three abandoned tutorials is worse than no link. The same applies to a personal site.',
      },
      {
        question: 'Where do side projects go for an experienced engineer?',
        answer:
          'Below employment, and trimmed. Projects earn their space early in a career and lose it later, when what you shipped at work is more persuasive. You can reorder and hide sections in the editor without touching the content.',
      },
      {
        question: 'Should I tailor the stack per application?',
        answer:
          'Yes, and it is the highest-return edit you can make. Reorder so the technologies in the posting appear first, and cut what is irrelevant. That is honest tailoring; padding the list with terms lifted from the job advert is keyword stuffing and reads badly to the human who reaches it.',
      },
    ],
    related: ['ats', 'modern'],
  },

  classic: {
    heading: 'Classic CV templates',
    metaTitle: 'Classic CV Templates — Traditional and Academic',
    metaDescription:
      'Traditional CV templates for academia, law, government and any employer expecting a conventional document. Serif-friendly, restrained, highly parseable.',
    lede: 'Traditional formats for readers who expect a conventional document: academia, law, medicine, government and long-established firms. Restraint here is not a lack of design — it is the design. These are also, almost incidentally, the most reliably parseable layouts in the library after the ATS category.',
    audience: {
      forYou: [
        'Academic, research and clinical applications, where a CV runs long and lists publications',
        'Law, government, the civil service and regulated professions',
        'Anyone applying to an organisation whose own materials look formal',
      ],
      notForYou:
        'For a startup or an agency, a classic template can read as dated. The Modern category gets you a document that is just as readable without the institutional tone.',
    },
    characteristics: [
      {
        title: 'Rules and alignment instead of colour',
        description:
          'Hierarchy comes from hairlines, small caps and hanging indents. Six of the ten use essentially no colour at all.',
      },
      {
        title: 'Built for length',
        description:
          'Academic CV in particular assumes a document that runs to several pages with a numbered publication list, and sets a dense, even rhythm so page four looks like page one.',
      },
      {
        title: 'Serif-friendly typography',
        description:
          'These layouts are designed with a serif body in mind — Source Serif, Lora, EB Garamond and Libre Baskerville are all one change away in the editor.',
      },
    ],
    ats: 'The strongest category in the library for parsing after ATS itself: eight of the ten score 5/5. Single column, standard headings, plain date ranges, no graphics. Simple Classic is the one to reach for when you have no information about how an application will be processed — it is deliberately the plainest document here.',
    faq: [
      {
        question: 'What makes an academic CV different?',
        answer:
          'Length and emphasis. Publications, funding, teaching and conference activity carry the document, and it is normal for it to run well past two pages. Academic CV numbers its section headings and gives publications a hanging indent so long author lists stay readable.',
      },
      {
        question: 'Is a serif font better for a traditional CV?',
        answer:
          'It reads as more formal, which is the intent here, and there is no meaningful parsing difference between a common serif and a common sans. What matters is that the font is a widely available one — avoid anything unusual, because a substituted font can shift your pagination.',
      },
      {
        question: 'Should I include "references available on request"?',
        answer:
          'No. It is assumed, it tells the reader nothing, and it spends a line you could use. Give referees when they are asked for. The references section is switched off by default for this reason.',
      },
      {
        question: 'Do government applications accept a CV?',
        answer:
          'Often they require their own form instead, and where a CV is accepted the posting usually specifies length and required sections. Read it carefully — Government CV uses a bordered, form-like structure precisely because that is the register those readers expect.',
      },
    ],
    related: ['ats', 'corporate'],
  },

  ats: {
    heading: 'ATS-friendly CV templates',
    metaTitle: 'ATS CV Templates — Built to Be Parsed Correctly',
    metaDescription:
      'Single-column CV templates engineered for applicant tracking systems: no columns, no tables, no graphics, standard headings. All free to use.',
    lede: 'Stripped-back layouts engineered so an applicant tracking system extracts your text in the right order. No columns, no tables, no icons, no progress bars — the constraint is the design. Five of the six are free, because the template that gives you the best chance in a portal should not be behind a paywall.',
    audience: {
      forYou: [
        'Anyone applying through a large employer’s careers portal or a job board that re-hosts your CV',
        'High-volume applications where you will not know who opens the file',
        'Students and career starters, where Student CV and Entry-Level Resume are the natural fits',
      ],
      notForYou:
        'If you are sending the PDF directly to a person at a small company or a studio, you can afford a design with more personality — try Modern or Creative.',
    },
    characteristics: [
      {
        title: 'Strictly one column',
        description:
          'Reading order is unambiguous. This is the single most important property: a parser that walks a two-column page in the wrong order can interleave your job titles with your skills.',
      },
      {
        title: 'Nothing but text',
        description:
          'No icons, no chips, no skill bars, no tables, no text inside images. Everything on the page is selectable text a parser can extract.',
      },
      {
        title: 'Headings a parser recognises',
        description:
          'Real heading elements carrying conventional words — "Work Experience", "Education", "Skills". Section detection is largely heading matching, so a heading reading "Where I have made an impact" is a genuine risk.',
      },
    ],
    ats: 'Every template in this category scores 5/5 on our heuristic. That word matters: it is our assessment of layout properties known to affect text extraction, not a certification. No builder — including this one — can test against every applicant tracking system in use, and any vendor claiming a guaranteed pass rate is selling something. What these templates do is remove the layout risks that are actually within a template’s control.',
    faq: [
      {
        question: 'What does an ATS actually do to my CV?',
        answer:
          'It extracts the text, tries to identify sections by their headings, normalises dates and employers into fields, and stores the result so a recruiter can search it. Most systems keep the original file too. The failure mode is not usually rejection by a robot — it is your experience landing in the wrong field, or not being found in a search. There is a full explanation on our ATS CV page.',
      },
      {
        question: 'Is a PDF safe to upload?',
        answer:
          'Generally yes. Modern systems read PDFs well, and a text-based PDF — which is what this builder produces — extracts reliably. The genuine problems are scanned PDFs, PDFs exported from design tools as outlines, and text baked into images. Where a posting explicitly asks for .docx, send .docx.',
      },
      {
        question: 'Which of these six should I pick?',
        answer:
          'ATS CV if you want maximum safety with no colour at all. ATS Resume for US conventions — centred name, one page, Letter paper. Student CV if education should lead. Accountant CV if you want dates aligned in a ledger-like column. ATS Simple if you want one restrained accent colour. Entry-Level Resume for a compact one-page start.',
      },
      {
        question: 'Do keywords matter, and how do I use them honestly?',
        answer:
          'They matter, because recruiters search the parsed database. Use the terminology of the posting where it genuinely describes what you did — if they say "stakeholder management" and you did that, use their phrase rather than your synonym. What does not work is a hidden block of keywords or a list of skills you cannot discuss; both are detectable and both cost you the interview.',
      },
    ],
    related: ['classic', 'technology'],
  },
};

export function categoryBySlug(slug: string): TemplateCategory | null {
  const match = TEMPLATE_CATEGORIES.find((category) => category.slug === slug);
  return match ? match.id : null;
}

export function categoryTemplates(category: TemplateCategory): TemplateDefinition[] {
  return templatesByCategory(category);
}
