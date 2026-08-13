import Link from 'next/link';

import {
  Breadcrumbs,
  CtaBanner,
  Eyebrow,
  FaqSection,
  Prose,
  RelatedLinks,
  Section,
  SectionHeading,
  type FaqEntry,
} from '@/components/marketing/primitives';
import { TemplateGrid } from '@/components/marketing/TemplateStrip';
import { ButtonLink } from '@/components/ui/button';
import { getTemplateBySlug } from '@/lib/cv/template-registry';
import { pageMetadata } from '@/lib/seo/metadata';
import type { TemplateDefinition } from '@/types/cv';

export const metadata = pageMetadata({
  title: 'Professional CV: What Separates Good From Average',
  description:
    'A working editor’s guide to the professional CV: structure, evidence, verb choice, length by seniority, formatting discipline, what to leave out, and a twelve-point audit.',
  path: '/professional-cv',
  keywords: [
    'professional cv',
    'how to write a professional cv',
    'cv writing guide',
    'cv formatting rules',
    'what to leave off a cv',
    'cv checklist',
  ],
});

function pickTemplates(slugs: string[]): TemplateDefinition[] {
  return slugs
    .map((slug) => getTemplateBySlug(slug))
    .filter((template): template is TemplateDefinition => Boolean(template));
}

const contents = [
  { id: 'skim', label: 'The twenty-second reading' },
  { id: 'structure', label: 'Structure: the spine a reader expects' },
  { id: 'evidence', label: 'Evidence: numbers, and what to do without them' },
  { id: 'language', label: 'Language: verbs, tense and words to delete' },
  { id: 'length', label: 'Length: what seniority justifies' },
  { id: 'formatting', label: 'Formatting discipline' },
  { id: 'omit', label: 'What to leave out' },
  { id: 'finishing', label: 'The last ten per cent' },
  { id: 'audit', label: 'The twelve-point audit' },
];

const audit = [
  'The top third of page one contains your target job title, your level, and at least one number.',
  'Every role has dates in the same format, and no gap longer than three months is unexplained.',
  'At least half of your bullets contain a figure — a quantity, a percentage, a currency amount or a timeframe.',
  'No bullet runs beyond two lines at the size the document is actually printed.',
  'Every bullet begins with a verb, and no verb is repeated more than twice in the document.',
  'The words “responsible for”, “helped with”, “assisted in” and “duties included” appear nowhere.',
  'One typeface, at most two, and exactly one accent colour.',
  'Section headings are visually identical to each other, and so are job titles.',
  'Nothing in the document is a claim you would not be comfortable being questioned on for ten minutes.',
  'No date of birth, no marital status, no full street address, no “references available on request”.',
  'The document ends near the bottom of a page rather than a third of the way down one.',
  'The file is a PDF, named with your own name, and you have opened it once after exporting.',
];

const faqs: FaqEntry[] = [
  {
    question: 'What makes a CV look professional at a glance, before a word is read?',
    answer:
      'Alignment and repetition. Every date sits on the same right edge or the same left indent; every job title has the same weight; the space above each heading is identical. Readers register that consistency in under a second and unconsciously credit the writer with care. Decoration does the opposite — a coloured banner is noticed, then discounted.',
  },
  {
    question: 'Is a two-column CV unprofessional?',
    answer:
      'Not inherently. A two-column layout uses the page efficiently and reads well on screen, and in design, marketing and some technical fields it is entirely normal. The caution is mechanical rather than aesthetic: automated parsers handle columns less reliably, so if the application goes through a large careers portal, prefer a single column and keep the two-column version for direct applications.',
  },
  {
    question: 'Should I include hobbies and interests?',
    answer:
      'Only when they carry information. “Volunteer treasurer for a 200-member sports club” tells a reader about numbers and responsibility. “Reading, cinema, travel” tells them nothing and costs you a line you could have spent on evidence. If you keep the section, hold it to one line.',
  },
  {
    question: 'Which tense should a CV be written in?',
    answer:
      'Present tense for the role you currently hold, past tense for everything finished, and no first-person pronouns anywhere. Mixed tense inside a single role is the most common error: if the responsibility is ongoing it is present, if the achievement is complete it is past, and both can sit in the same job entry.',
  },
  {
    question: 'Does a professional CV still need a personal profile?',
    answer:
      'A three-line profile earns its place when it says something the rest of the document cannot: your level, your domain, your scale and what you are aiming at next. A profile made of adjectives — hard-working, passionate, detail-oriented — is worse than no profile, because it uses the most valuable space on the page to say nothing.',
  },
  {
    question: 'How much colour is acceptable?',
    answer:
      'One accent, used consistently for headings or rules, and never for body text. Colour should survive being printed in greyscale on a shared office printer, because it frequently is. If your CV becomes unreadable without colour, it is a design, not a document.',
  },
  {
    question: 'How do I present a career gap without it looking like a problem?',
    answer:
      'Treat it as an entry rather than an absence: a dated line with a plain label, and one sentence about anything that kept you current — study, freelance work, caring responsibilities, recovery, relocation. Professionalism here is composure. The gap becomes a fact among facts rather than the thing the reader is trying to work out.',
  },
];

export default function ProfessionalCvPage() {
  const restrainedTemplates = pickTemplates([
    'classic-professional-cv',
    'timeless-cv',
    'executive-classic-cv',
    'modern-minimal',
    'business-professional-cv',
    'formal-cv',
  ]);

  return (
    <>
      <Section size="lg">
        <Breadcrumbs
          items={[
            { name: 'Home', path: '/' },
            { name: 'Professional CV', path: '/professional-cv' },
          ]}
        />
        <div className="max-w-3xl">
          <Eyebrow>Guide</Eyebrow>
          <h1 className="mt-3 text-4xl font-extrabold tracking-tight text-balance text-ink-950 sm:text-5xl lg:text-[3.4rem] lg:leading-[1.05]">
            What separates a professional CV from an average one
          </h1>
          <p className="mt-5 text-base leading-relaxed text-pretty text-ink-600 sm:text-lg">
            Almost every CV that gets rejected is competent. It is spelled correctly, it lists the
            right jobs, and it is entirely forgettable. The difference between that document and a
            professional one is not talent or design budget — it is a set of decisions about
            structure, evidence and restraint, and all of them can be applied in an evening.
          </p>
          <div className="mt-8 flex flex-wrap gap-3">
            <ButtonLink href="/register" size="lg">
              Apply this to your CV
            </ButtonLink>
            <ButtonLink href="#audit" size="lg" variant="outline">
              Skip to the audit
            </ButtonLink>
          </div>
        </div>

        <nav aria-label="On this page" className="mt-12 max-w-3xl rounded-xl border border-ink-200 bg-ink-50 p-5">
          <h2 className="text-sm font-bold tracking-[0.12em] text-ink-700 uppercase">
            On this page
          </h2>
          <ol className="mt-3 grid gap-x-6 gap-y-1.5 text-sm sm:grid-cols-2">
            {contents.map((item, index) => (
              <li key={item.id} className="flex gap-2 text-ink-600">
                <span aria-hidden className="tabular-nums text-ink-400">
                  {String(index + 1).padStart(2, '0')}
                </span>
                <Link
                  href={`#${item.id}`}
                  className="font-medium text-brand-700 underline underline-offset-2 hover:text-brand-800"
                >
                  {item.label}
                </Link>
              </li>
            ))}
          </ol>
        </nav>
      </Section>

      <Section>
        <Prose>
          <h2 id="skim" className="scroll-mt-28">
            The twenty-second reading
          </h2>
          <p>
            Before anyone reads your CV, somebody skims it. In a competitive posting the first pass
            is measured in seconds, and it answers three questions: is this person roughly the
            right level, are they in the right field, and is there any evidence they are good at
            it. A professional CV is built so that all three can be answered from the top third of
            page one. Everything else on the document exists to support a decision that has, in
            practice, already been provisionally made.
          </p>
          <p>
            This is why the most valuable edit is almost never adding something. It is moving your
            strongest fact upwards and deleting whatever is currently occupying that space —
            usually a paragraph of adjectives, an objective statement, or a list of software.
          </p>

          <h2 id="structure" className="scroll-mt-28">
            Structure: the spine a reader expects
          </h2>
          <p>
            Conventional structure is not a lack of imagination; it is a courtesy to someone
            reading their fortieth document of the day. The expected spine runs: contact details,
            a short profile, professional experience in reverse chronological order, education,
            then skills and anything specialist. A reader can navigate that shape without
            conscious effort, which means their attention goes to your content rather than to your
            layout.
          </p>
          <h3>The top third of page one</h3>
          <p>
            Treat the first third of the first page as the only part guaranteed to be read
            properly. It should contain your name, the title of the role you are applying for
            rather than an internal job code, and a profile of no more than three sentences that
            states your level, your domain, the scale you operate at and one hard number. If your
            best achievement is buried on page two under a job from 2019, the document is
            structurally wrong even if every sentence in it is good.
          </p>
          <h3>Deviating from the order, deliberately</h3>
          <p>
            There are three legitimate reasons to change the sequence. A recent graduate puts
            education above experience, because the degree is the strongest asset. A career changer
            puts a skills block above the chronology, so the relevance is established before the
            history is read. A specialist — an academic, a clinician, a researcher — puts
            publications, grants or clinical experience where a commercial CV would put jobs. Every
            other reordering is decoration, and it costs the reader time.
          </p>

          <h2 id="evidence" className="scroll-mt-28">
            Evidence: numbers, and what to do without them
          </h2>
          <p>
            The single most reliable marker of a professional CV is that its claims are checkable.
            An average CV describes activity: managed a team, improved processes, supported
            stakeholders. A professional one describes consequence, and consequence usually has a
            number attached to it.
          </p>
          <h3>Three kinds of number</h3>
          <ul>
            <li>
              <strong>Scale.</strong> How big was the thing you were responsible for? Headcount,
              budget, users, transactions, territory, caseload. Scale tells a reader what level you
              genuinely operate at, independently of your job title, which varies wildly between
              organisations.
            </li>
            <li>
              <strong>Change.</strong> What was different afterwards? A before-and-after pair is
              more persuasive than a single figure, because it shows the starting point and
              implicitly acknowledges that you did not do it alone.
            </li>
            <li>
              <strong>Speed or efficiency.</strong> How long did it take, how often does it happen,
              what did it cost. A result delivered in one quarter reads differently from the same
              result over three years, and you should be the one to say which it was.
            </li>
          </ul>
          <h3>When your work does not produce metrics</h3>
          <p>
            Plenty of good work is unmeasured. Substitute frequency, volume, stakes or audience:
            the number of cases you handle in a week, the size of the group you brief, the value of
            the contract whose renewal you support, the number of teams that use the process you
            wrote. If none of that applies, name the difficulty instead — the migration nobody had
            attempted, the audit finding you closed, the client who had already given notice.
          </p>
          <p>
            What you must not do is invent figures. Numbers on a CV are conversation starters, and
            an interviewer will ask how a percentage was calculated. A defensible approximation
            with the word “approximately” in front of it is professional; a precise-looking
            fabrication is a very short interview.
          </p>

          <h2 id="language" className="scroll-mt-28">
            Language: verbs, tense and the words to delete
          </h2>
          <p>
            Start every bullet with a verb that describes what you did, not what you were near.
            Led, built, negotiated, migrated, reduced, launched, recovered, standardised. Avoid the
            four constructions that quietly remove you from your own achievements: “responsible
            for”, “helped with”, “assisted in”, “duties included”. Each of them turns a person into
            a job description.
          </p>
          <p>
            Vary the verbs, but do not go hunting in a thesaurus. A CV that says “spearheaded”
            three times reads as coached; one that says “orchestrated a paradigm shift” reads as
            unserious. Plain, specific verbs are what senior readers expect, and the more senior
            the reader, the plainer the language they trust.
          </p>
          <p>
            Use present tense for the role you hold now and past tense for everything else. Drop
            the pronouns entirely — a CV is written in an implied first person, so “Led a team of
            six” is correct and both “I led a team of six” and “Amina led a team of six” are not.
            Third person about yourself belongs in an academic biography, not on a CV.
          </p>
          <p>
            Finally, delete the vocabulary that survives on CVs purely by inheritance:
            results-driven, dynamic, proactive, team player, go-getter, self-starter, passionate
            about excellence. None of them are checkable, all of them are claimed by everyone, and
            each one occupies space that a fact could have used.
          </p>

          <h2 id="length" className="scroll-mt-28">
            Length: what seniority justifies
          </h2>
          <p>
            Length signals judgement. A graduate with a three-page CV is telling a reader they
            cannot distinguish important from unimportant; a director with a one-page CV may be
            underselling twenty years of scope. The working conventions: one page for students,
            graduates and the first few years of a career; two pages for most established
            professionals; two pages for executives as well, because selection is the skill being
            demonstrated. Academic, medical and some public-sector CVs are the genuine exceptions,
            where a complete record of publications, grants and appointments is expected and may
            run to many pages.
          </p>
          <p>
            The last page should end near its own bottom. A second page holding four lines looks
            like an accident, and the fix is either to compress until it fits on one page or to
            expand the evidence until the second page is at least half full. Nothing here is about
            typography for its own sake — a document that ends where a page ends looks finished,
            and looking finished is most of what “professional” means.
          </p>

          <h2 id="formatting" className="scroll-mt-28">
            Formatting discipline
          </h2>
          <h3>Type</h3>
          <p>
            One typeface is sufficient; two — one for headings, one for body — is the maximum. Body
            text between 10 and 11.5 points is readable in print and on screen; below 10 points a
            reader over forty will notice, and reading your CV should never feel like effort. Set
            headings apart by weight and space rather than by colour and size at once.
          </p>
          <h3>Space</h3>
          <p>
            Margins between roughly 12 and 20 mm, consistent on all four sides. White space is not
            wasted space: it is what makes a scan possible. If the page feels tight, cut a bullet
            rather than shave a margin, because the eye registers crowding long before it registers
            content.
          </p>
          <h3>Consistency</h3>
          <p>
            Consistency is the cheapest professionalism available. One date format throughout — pick
            “Mar 2021 – Present” or “03/2021 – Present” and never mix them. The same punctuation
            convention at the end of every bullet, either all with full stops or all without. The
            same treatment for every employer name. Alignment that repeats down the page. Readers
            cannot articulate this, but they feel it, and it is the difference between a document
            that looks assembled and one that looks composed.
          </p>
          <p>
            Left-align body text rather than justifying it. Justification creates uneven word
            spacing and rivers of white running down a narrow column, which is precisely the visual
            noise you have been eliminating everywhere else.
          </p>

          <h2 id="omit" className="scroll-mt-28">
            What to leave out
          </h2>
          <ul>
            <li>
              <strong>A photograph</strong>, unless you are applying somewhere it is genuinely
              expected — parts of continental Europe, some Gulf states, and performance roles. It
              is inappropriate in the US, UK, Ireland, Canada and Australia, and it breaks text
              extraction in a number of tracking systems.
            </li>
            <li>
              <strong>Date of birth, age, marital status, dependants, religion and nationality.</strong>{' '}
              These are protected characteristics in most jurisdictions and their presence creates
              a problem for the employer as well as for you. Work authorisation is the only related
              fact worth stating, and only where it is genuinely in question.
            </li>
            <li>
              <strong>Your full street address.</strong> City and country is enough. The document is
              emailed to strangers and forwarded onwards.
            </li>
            <li>
              <strong>“References available on request”.</strong> Universally assumed, and it
              consumes a line at the point of the page where you should be strongest.
            </li>
            <li>
              <strong>Skill bars and percentage ratings.</strong> A bar claiming 80% Excel is
              unverifiable and slightly comic. Name the skill and, where it matters, the evidence.
            </li>
            <li>
              <strong>School grades once you hold a degree</strong>, every certificate ever
              collected, and software everybody uses. Keep the certifications a hiring manager in
              your field would recognise.
            </li>
            <li>
              <strong>Salary history and expectations</strong>, unless an application explicitly
              requires them. In several jurisdictions asking is restricted; volunteering it only
              limits you.
            </li>
          </ul>

          <h2 id="finishing" className="scroll-mt-28">
            The last ten per cent
          </h2>
          <p>
            Read the document backwards, last bullet to first. It breaks the sentence rhythm that
            hides typos when you read forwards for the ninth time. Then read the profile aloud: if
            you would not say it to a colleague in those words, rewrite it.
          </p>
          <p>
            Export to PDF, always, and open the exported file before you send it — page breaks are
            where good documents die. Name the file with your own name and the role, not
            “cv-final-v3”. Check it once on a phone, because a substantial proportion of first
            reads now happen there. Then stop: past a certain point, further polishing is a
            displacement activity for applying.
          </p>
        </Prose>
      </Section>

      <Section tone="muted" id="audit">
        <SectionHeading
          align="left"
          eyebrow="Self-audit"
          title="Twelve checks before you send it"
          description="Go through these against the document you have now. Any line you cannot tick is a specific, fixable edit rather than a vague feeling that something is off."
        />
        <ul className="mt-10 grid gap-3 lg:grid-cols-2">
          {audit.map((item, index) => (
            <li
              key={item}
              className="flex gap-3 rounded-xl border border-ink-200 bg-white p-4"
            >
              <span
                aria-hidden
                className="grid size-6 shrink-0 place-items-center rounded-md border border-ink-300 text-xs font-bold text-ink-500"
              >
                {index + 1}
              </span>
              <span className="text-sm leading-relaxed text-ink-700">{item}</span>
            </li>
          ))}
        </ul>
      </Section>

      <Section>
        <SectionHeading
          align="left"
          eyebrow="Templates"
          title="Layouts that get out of the way"
          description="Every one of these is restrained by design: one accent, clear heading hierarchy, and enough space that a two-page document still breathes. The document should look like the work of someone who had nothing to prove typographically."
        />
        <div className="mt-10">
          <TemplateGrid templates={restrainedTemplates} columns={3} />
        </div>
      </Section>

      <Section tone="muted">
        <FaqSection
          entries={faqs}
          title="Questions about professional presentation"
          description="Judgement calls that come up once the content is already good."
        />
      </Section>

      <Section>
        <CtaBanner
          title="Rewrite one section tonight"
          description="Take the top third of page one and apply the first three rules on this page. It is the highest-return twenty minutes available to anyone applying for a job."
          primaryLabel="Open the editor — free"
          secondaryHref="/cv-examples"
          secondaryLabel="Study finished examples"
          note="Autosaves as you write, exports a page-accurate PDF when you are done."
        />
        <div className="mt-16">
          <RelatedLinks
            title="Go deeper"
            links={[
              {
                label: 'CV examples by role',
                href: '/cv-examples',
                description: 'See these principles applied to complete documents.',
              },
              {
                label: 'ATS-friendly CV templates',
                href: '/ats-cv',
                description: 'Where presentation meets automated parsing.',
              },
              {
                label: 'CV templates',
                href: '/cv-templates',
                description: 'The full library, grouped by tone and category.',
              },
              {
                label: 'US resume conventions',
                href: '/resume-builder',
                description: 'What changes when you apply in North America.',
              },
              {
                label: 'The CV builder',
                href: '/cv-builder',
                description: 'Where the editing and exporting actually happens.',
              },
              {
                label: 'Blog',
                href: '/blog',
                description: 'Longer pieces on writing, gaps and applications.',
              },
            ]}
          />
        </div>
      </Section>
    </>
  );
}
