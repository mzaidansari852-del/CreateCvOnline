import Link from 'next/link';

import {
  Breadcrumbs,
  CtaBanner,
  Eyebrow,
  FaqSection,
  RelatedLinks,
  Section,
  SectionHeading,
  type FaqEntry,
} from '@/components/marketing/primitives';
import { TemplateGrid } from '@/components/marketing/TemplateStrip';
import { JsonLd } from '@/components/seo/JsonLd';
import { ButtonLink } from '@/components/ui/button';
import { getTemplateBySlug } from '@/lib/cv/template-registry';
import { PLANS } from '@/lib/plans';
import { pageMetadata } from '@/lib/seo/metadata';
import { howToSchema } from '@/lib/seo/schema';
import type { TemplateDefinition } from '@/types/cv';

export const metadata = pageMetadata({
  title: 'CV Maker: Finish a Real CV in One Sitting',
  description:
    'A timed, minute-by-minute plan for turning rough notes or an old CV into a finished document — what to write in each section, and three bullets rewritten in full.',
  path: '/cv-maker',
  keywords: [
    'cv maker',
    'make a cv',
    'quick cv maker',
    'how to write a cv fast',
    'cv writing guide',
    'cv bullet points examples',
  ],
});

function pickTemplates(slugs: string[]): TemplateDefinition[] {
  return slugs
    .map((slug) => getTemplateBySlug(slug))
    .filter((template): template is TemplateDefinition => Boolean(template));
}

const timeline = [
  {
    clock: '00:00 – 00:05',
    title: 'Empty your head onto a scratch list',
    body: 'Open your old CV, your last two performance reviews and the advert you actually want. Write down eight to ten things you finished in the past two years — not duties, finished things. Do not phrase them well yet.',
    doneWhen: 'You have a scruffy list you would be embarrassed to send to anyone.',
  },
  {
    clock: '00:05 – 00:12',
    title: 'Build the skeleton',
    body: 'Header first: your name, the job title you are aiming at, city and country, an email address you actually read, a phone number with the country code, and one link. Then create an empty entry for every job and every qualification, dates only.',
    doneWhen: 'The page already looks like a CV with the words missing.',
  },
  {
    clock: '00:12 – 00:30',
    title: 'Write the experience section — the block that decides everything',
    body: 'Current or most recent role: four or five bullets. The one before: three. Anything more than ten years old: a single line with the title, employer and years. Each bullet is a verb, the thing you did, and the number it moved.',
    doneWhen: 'A stranger could tell what changed at that company because you worked there.',
  },
  {
    clock: '00:30 – 00:38',
    title: 'Education, skills, languages',
    body: 'One line per qualification once you have real work behind you. Eight to fourteen skills, grouped rather than listed as a wall. Languages only at the level you would take a phone call in, named plainly: native, fluent, professional, conversational.',
    doneWhen: 'You could be interviewed on every single item without wincing.',
  },
  {
    clock: '00:38 – 00:45',
    title: 'Only now, write the profile',
    body: 'Three sentences. What you are and for how long; the scale you operate at — team size, budget, users, revenue; what you want next. Writing it last is the whole trick: by now your best number is already on the page and you can quote it.',
    doneWhen: 'The profile contains at least one figure and no adjective you cannot prove.',
  },
  {
    clock: '00:45 – 00:55',
    title: 'Fit it, then export',
    body: 'Try three templates with your real text in place. Cut until the document ends where a page ends — one page that stops two-thirds down looks unfinished, and two pages with three lines on the second look careless. Export the PDF and read it once on a phone.',
    doneWhen: 'You have a PDF named after you that you would send tonight.',
  },
];

const rewrites = [
  {
    before: 'Responsible for the company’s social media accounts.',
    after:
      'Ran four social channels for a 60-person retailer; grew the combined following from 11,000 to 38,000 in 14 months with no paid budget.',
    why: 'The original states a job description. The rewrite states a scope (four channels, 60 people), a result (11k to 38k), a timeframe and a constraint — the constraint is what makes it impressive.',
  },
  {
    before: 'Helped improve the onboarding process for new employees.',
    after:
      'Rebuilt the new-starter onboarding checklist with HR; cut average ramp-up from six weeks to four across roughly 12 starters a month.',
    why: '“Helped” hides your contribution — a reader cannot tell whether you led it or attended the meeting. A pair of before-and-after numbers shows the size of the change without exaggerating your role.',
  },
  {
    before: 'Worked on the annual budget and monthly reporting.',
    after:
      'Owned a £2.4M departmental budget and closed the year 3% under plan without cutting headcount.',
    why: 'An ownership verb, one absolute figure for scale, one relative figure for performance, and the trade-off you did not make. Three facts in nineteen words.',
  },
];

const sectionTargets = [
  {
    section: 'Profile',
    length: '40–60 words, three sentences',
    test: 'Does it say what you are, at what scale, and contain one number?',
  },
  {
    section: 'Recent roles (last 5 years)',
    length: '3–5 bullets, each at most two lines',
    test: 'Could a stranger tell what changed because you were there?',
  },
  {
    section: 'Older roles',
    length: 'One line: title, employer, years',
    test: 'Would deleting it change the reader’s impression at all?',
  },
  {
    section: 'Education',
    length: 'One line each — two or three if you graduated recently',
    test: 'Is the grade or the thesis doing any work for this application?',
  },
  {
    section: 'Skills',
    length: '8–14, grouped into two or three clusters',
    test: 'Could you survive fifteen minutes of questions on each one?',
  },
  {
    section: 'Languages',
    length: 'Only those above conversational',
    test: 'Would you take an unscheduled phone call in it?',
  },
  {
    section: 'Interests',
    length: 'One line, or leave it out',
    test: 'Does it give a real signal, or is it filling space?',
  },
];

const faqs: FaqEntry[] = [
  {
    question: 'Can anyone genuinely finish a CV in under an hour?',
    answer:
      'A strong first draft, yes — if your raw material exists somewhere. The 55-minute plan assumes you can look up dates, employers and a handful of numbers. A fifteen-year career usually wants two sittings: one to get everything down, and a second, a day later, to cut it back by a third.',
  },
  {
    question: 'Can I upload my old CV and have the fields filled in automatically?',
    answer:
      'No. Text extracted from a PDF — especially a two-column one — comes back in scrambled reading order, and fixing that takes longer than retyping. Copying section by section takes about ten minutes and forces you to delete the lines you have been carrying since 2016.',
  },
  {
    question: 'How many bullet points should each job have?',
    answer:
      'Four or five for the current role, three for the one before, one to two for anything older, and a single line for jobs beyond about ten years back. If every role has six bullets, the reader stops distinguishing between them.',
  },
  {
    question: 'What do I write if none of my work produced numbers?',
    answer:
      'Use frequency, volume, stakes or audience instead of money. “Handled about 40 support tickets a day at a 92% first-contact resolution rate” and “wrote the deployment runbook three teams now follow” are both quantified. Do not invent figures — you will be asked about them.',
  },
  {
    question: 'Should I write the CV in the first person?',
    answer:
      'Write it in implied first person: no “I”, no “he/she”, no full sentences in bullets. “Led a team of six” rather than “I led a team of six” or “Amina led a team of six”. Third person about yourself reads oddly outside academia.',
  },
  {
    question: 'How should I handle a gap in employment?',
    answer:
      'Give it one honest line — caring responsibilities, study, illness, redundancy plus what you did with the time. A dated one-line entry closes the question; year-only dates that quietly hide an eighteen-month gap invite the interviewer to ask about it first.',
  },
  {
    question: 'Do I need a different CV for every application?',
    answer: `For the two or three jobs you actually want, yes: duplicate the document, rewrite the profile for that role and reorder the skills. The free plan holds ${PLANS.free.limits.maxCvs} CVs at once, which covers a targeted search; ${PLANS.pro.name} lifts that to unlimited copies.`,
  },
];

export default function CvMakerPage() {
  const fastTemplates = pickTemplates([
    'modern-minimal',
    'ats-simple-cv',
    'modern-clean',
    'entry-level-resume',
    'tech-minimal-cv',
    'simple-classic-cv',
  ]);

  return (
    <>
      <Section size="lg">
        <Breadcrumbs
          items={[
            { name: 'Home', path: '/' },
            { name: 'CV maker', path: '/cv-maker' },
          ]}
        />
        <div className="max-w-3xl">
          <Eyebrow>One sitting</Eyebrow>
          <h1 className="mt-3 text-4xl font-extrabold tracking-tight text-balance text-ink-950 sm:text-5xl lg:text-[3.4rem] lg:leading-[1.05]">
            Make a CV tonight, not next weekend
          </h1>
          <p className="mt-5 text-base leading-relaxed text-pretty text-ink-600 sm:text-lg">
            The reason a CV takes three weeks is almost never the writing. It is the reformatting,
            the re-reading and the tab that stays open. Below is the alternative: a clock, six
            blocks of work, and a finished PDF at the end of the last one.
          </p>
          <div className="mt-8 flex flex-wrap gap-3">
            <ButtonLink href="/register" size="lg">
              Start the 55 minutes
            </ButtonLink>
            <ButtonLink href="/cv-examples" size="lg" variant="outline">
              Look at finished examples first
            </ButtonLink>
          </div>
        </div>
      </Section>

      <Section tone="muted" id="timeline">
        <SectionHeading
          align="left"
          eyebrow="The clock"
          title="Fifty-five minutes, in six blocks"
          description="The order matters more than the speed. Most people write the profile first, stare at it for twenty minutes, and never reach the experience section — which is the only part a recruiter reads closely."
        />
        <ol className="mt-12 space-y-5">
          {timeline.map((entry, index) => (
            <li
              key={entry.clock}
              className="relative rounded-xl border border-ink-200 bg-white p-6 sm:pl-24"
            >
              <span
                aria-hidden
                className="mb-3 inline-flex size-9 items-center justify-center rounded-full bg-brand-600 text-sm font-bold text-white sm:absolute sm:top-6 sm:left-6 sm:mb-0"
              >
                {index + 1}
              </span>
              <p className="font-mono text-xs font-semibold tracking-[0.08em] text-brand-700">
                {entry.clock}
              </p>
              <h3 className="mt-1.5 text-lg font-bold text-ink-950">{entry.title}</h3>
              <p className="mt-2 text-[15px] leading-relaxed text-ink-700">{entry.body}</p>
              <p className="mt-3 text-sm text-ink-500">
                <span className="font-semibold text-ink-700">Done when:</span> {entry.doneWhen}
              </p>
            </li>
          ))}
        </ol>
        <JsonLd
          nodes={[
            howToSchema({
              name: 'How to make a CV in one sitting',
              description:
                'A timed six-block method: collect raw material, build the skeleton, write the experience section, add education and skills, write the profile last, then fit the layout and export a PDF.',
              steps: timeline.map((entry) => ({ name: entry.title, text: entry.body })),
            }),
          ]}
        />
      </Section>

      <Section>
        <SectionHeading
          align="left"
          eyebrow="Before and after"
          title="Three bullets, rewritten in full"
          description="This is the difference between a CV that describes a job and one that describes a person doing it. Each rewrite took under two minutes."
        />
        <div className="mt-10 space-y-6">
          {rewrites.map((item) => (
            <article key={item.before} className="rounded-xl border border-ink-200 bg-white p-5 sm:p-6">
              <div className="grid gap-4 md:grid-cols-2">
                <div className="rounded-lg border border-danger-500/25 bg-danger-50 p-4">
                  <p className="text-2xs font-bold tracking-[0.14em] text-danger-700 uppercase">
                    Weak
                  </p>
                  <p className="mt-2 text-[15px] leading-relaxed text-ink-700">{item.before}</p>
                </div>
                <div className="rounded-lg border border-success-500/25 bg-success-50 p-4">
                  <p className="text-2xs font-bold tracking-[0.14em] text-success-700 uppercase">
                    Rewritten
                  </p>
                  <p className="mt-2 text-[15px] leading-relaxed text-ink-800">{item.after}</p>
                </div>
              </div>
              <p className="mt-4 text-sm leading-relaxed text-ink-600">
                <span className="font-semibold text-ink-800">Why it works:</span> {item.why}
              </p>
            </article>
          ))}
        </div>
        <p className="mt-8 max-w-3xl text-sm leading-relaxed text-ink-600">
          Notice that none of the rewrites are longer than two lines, and none use the words
          “passionate”, “dynamic” or “results-driven”. The numbers are doing all the persuading.
        </p>
      </Section>

      <Section tone="muted">
        <SectionHeading
          align="left"
          eyebrow="Section by section"
          title="How much to write, and how to know when to stop"
          description="Length is the easiest thing to get wrong under time pressure. These are the targets the plan above assumes."
        />
        <div className="mt-10 overflow-hidden rounded-xl border border-ink-200 bg-white">
          <table className="w-full border-collapse text-sm">
            <caption className="sr-only">
              Target length and quality test for each CV section
            </caption>
            <thead>
              <tr className="bg-ink-50 text-left">
                <th scope="col" className="px-4 py-3 font-semibold text-ink-950">
                  Section
                </th>
                <th scope="col" className="px-4 py-3 font-semibold text-ink-950">
                  Target length
                </th>
                <th scope="col" className="px-4 py-3 font-semibold text-ink-950">
                  The test before you move on
                </th>
              </tr>
            </thead>
            <tbody>
              {sectionTargets.map((row) => (
                <tr key={row.section} className="border-t border-ink-200 align-top">
                  <th scope="row" className="px-4 py-3 text-left font-medium text-ink-800">
                    {row.section}
                  </th>
                  <td className="px-4 py-3 text-ink-600">{row.length}</td>
                  <td className="px-4 py-3 text-ink-600">{row.test}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Section>

      <Section>
        <SectionHeading
          align="left"
          eyebrow="Templates"
          title="Six layouts that do not fight the clock"
          description="Single-column, no photo, no sidebar to balance. You paste text in and the page stays composed — which is what you want when the deadline is tonight."
        />
        <div className="mt-10">
          <TemplateGrid templates={fastTemplates} columns={3} />
        </div>
        <p className="mt-8 text-sm text-ink-600">
          Working to a US convention instead?{' '}
          <Link href="/resume-maker" className="font-medium text-brand-700 underline underline-offset-2">
            The résumé guide by career stage
          </Link>{' '}
          covers the same ground with different length rules.
        </p>
      </Section>

      <Section tone="muted">
        <FaqSection
          entries={faqs}
          title="Questions about writing it quickly"
          description="Answers that assume you are trying to finish, not to admire the process."
        />
      </Section>

      <Section>
        <CtaBanner
          title="Set a timer and open a blank document"
          description="The editor autosaves as you type, so the fifty-five minutes are spent writing rather than saving, formatting and re-checking that nothing moved."
          primaryLabel="Start writing — free"
          secondaryHref="/cv-builder"
          secondaryLabel="See how the editor works"
          note="Free plan: two saved CVs and five PDF downloads a month. No card."
        />
        <div className="mt-16">
          <RelatedLinks
            title="Read next"
            links={[
              {
                label: 'The CV builder, screen by screen',
                href: '/cv-builder',
                description: 'What the editor does while you are typing.',
              },
              {
                label: 'What makes a CV professional',
                href: '/professional-cv',
                description: 'The longer, editorial version of the rules above.',
              },
              {
                label: 'CV examples by role',
                href: '/cv-examples',
                description: 'Finished documents to steal structure from.',
              },
              {
                label: 'Résumé maker by career stage',
                href: '/resume-maker',
                description: 'Student, career changer, mid-level, executive.',
              },
              {
                label: 'CV templates',
                href: '/cv-templates',
                description: 'The full library, grouped by category.',
              },
              {
                label: 'Writing guides on the blog',
                href: '/blog',
                description: 'Longer pieces on bullets, gaps and cover letters.',
              },
            ]}
          />
        </div>
      </Section>
    </>
  );
}
