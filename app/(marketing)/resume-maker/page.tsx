import Link from 'next/link';

import {
  Breadcrumbs,
  CtaBanner,
  Eyebrow,
  FaqSection,
  RelatedLinks,
  Section,
  type FaqEntry,
} from '@/components/marketing/primitives';
import { TemplateGrid } from '@/components/marketing/TemplateStrip';
import { ButtonLink } from '@/components/ui/button';
import { getTemplateBySlug } from '@/lib/cv/template-registry';
import { pageMetadata } from '@/lib/seo/metadata';
import type { TemplateDefinition } from '@/types/cv';

export const metadata = pageMetadata({
  title: 'Resume Maker: What to Write at Each Career Stage',
  description:
    'Student, career changer, mid-level or executive — what your resume should lead with, how long it should be, which sections to drop, and which template fits each stage.',
  path: '/resume-maker',
  keywords: [
    'resume maker',
    'student resume',
    'career change resume',
    'executive resume',
    'mid level resume',
    'resume sections by experience',
  ],
});

function pickTemplates(slugs: string[]): TemplateDefinition[] {
  return slugs
    .map((slug) => getTemplateBySlug(slug))
    .filter((template): template is TemplateDefinition => Boolean(template));
}

interface Stage {
  id: string;
  marker: string;
  title: string;
  subtitle: string;
  length: string;
  leadsWith: string;
  body: { heading: string; text: string }[];
  drop: string[];
  templateSlugs: string[];
  templateNote: string;
}

const stages: Stage[] = [
  {
    id: 'student',
    marker: 'Stage one',
    title: 'Student and recent graduate',
    subtitle: 'Nothing to hide, everything to frame.',
    length: 'One page. There are no exceptions to this one.',
    leadsWith: 'Education — with two lines of substance under it, not just a degree title.',
    body: [
      {
        heading: 'Give the degree a body',
        text: 'A line that reads “BSc Economics, 2:1” tells a reader almost nothing. Add the dissertation title if it is relevant to the job, the three modules that map onto the role, and any group project that produced something real. That is the difference between claiming an education and evidencing one.',
      },
      {
        heading: 'Everything counts as experience if you frame it',
        text: 'Internships, part-time work, society treasurer, freelance jobs, volunteering, a coursework project with a deliverable. Hospitality and retail are not filler: “handled a £1,200 till float and closed the shop four nights a week” demonstrates trust and reliability, which is most of what an employer is buying at this stage.',
      },
      {
        heading: 'Be specific about skill level',
        text: '“Python — two university projects and a six-week internship” is worth more than four stars out of five, because it can be checked and it invites the question you want in the interview.',
      },
    ],
    drop: [
      'High school detail, once you hold a degree',
      'An objective statement describing what you hope to gain',
      'Hobbies that say nothing: reading, socialising, travelling',
      'A photograph, a date of birth and a referees section',
    ],
    templateSlugs: ['entry-level-resume', 'student-cv', 'ats-simple-cv'],
    templateNote:
      'All three keep education near the top and stay legible with little content, so a one-page document does not look empty.',
  },
  {
    id: 'career-changer',
    marker: 'Stage two',
    title: 'Career changer',
    subtitle: 'The reader must never have to guess why you are applying.',
    length: 'One to two pages — two only if the relevant evidence fills them.',
    leadsWith: 'A four-line profile naming the target role, then skills, then experience.',
    body: [
      {
        heading: 'Say the switch out loud in sentence one',
        text: 'A recruiter spends seconds deciding whether your application is a mistake. “Operations manager moving into data analysis, with three years of reporting and forecasting work inside a logistics team” closes that question immediately. Vagueness is read as confusion.',
      },
      {
        heading: 'Group, do not scramble',
        text: 'Split the history into “Relevant experience” and “Additional experience”, keeping dates and reverse-chronological order inside each group. You get the emphasis of a skills-first document without the timeline gaps that make screeners suspicious.',
      },
      {
        heading: 'Translate, do not merely list',
        text: 'Rewrite each bullet in the vocabulary of the field you are entering, where that is honest. “Reconciled a 40-store stock report weekly in SQL and Excel” speaks to a data team; “managed stock accuracy” does not.',
      },
      {
        heading: 'Show that the change has already started',
        text: 'A completed course, a portfolio project with a link, freelance work, a volunteering stint in the target field. One finished project outweighs three certificates, because it proves you can deliver rather than attend.',
      },
    ],
    drop: [
      'Duties that only make sense inside the old industry',
      'Internal jargon, product names and acronyms from the previous employer',
      'Certifications for tools you are deliberately leaving behind',
      'Any implication that you are “looking for a new challenge”',
    ],
    templateSlugs: ['modern-clean', 'business-professional-cv', 'ats-cv'],
    templateNote:
      'Calm, single-column layouts with a strong profile block and a skills section that can sit above the work history without looking rearranged.',
  },
  {
    id: 'mid-level',
    marker: 'Stage three',
    title: 'Mid-level, roughly four to ten years',
    subtitle: 'The stage where most resumes get longer instead of better.',
    length: 'Two pages, or one if it fits without shrinking the type.',
    leadsWith: 'Experience. The profile drops to three lines and education to one line per degree.',
    body: [
      {
        heading: 'Stop describing the job, start describing the delta',
        text: 'By now the reader knows roughly what an account manager or a backend engineer does. What they cannot infer is what was different because you held the role. Choose the three or four things you would put in a promotion case and give each one a number.',
      },
      {
        heading: 'Bullet budget',
        text: 'Four to five bullets for the current role, three for the previous, one or two for the one before, and a single line for anything older than about ten years. An even distribution across five jobs flattens your career into a list.',
      },
      {
        heading: 'Claim scope even as an individual contributor',
        text: 'Scope is not only headcount. “Owned the checkout service handling 40,000 transactions a day” and “ran the vendor relationship for a £600k annual contract” are both scope statements, and both change how the reader ranks you.',
      },
    ],
    drop: [
      'Internships and the university summer job',
      'GPA, A-levels and school grades',
      'A skills line containing “Microsoft Office”',
      'The referees block and the phrase “references available on request”',
    ],
    templateSlugs: ['modern-professional', 'modern-corporate', 'consultant-cv'],
    templateNote:
      'Enough structure to carry two dense pages of history without the reader losing the hierarchy between employers, roles and achievements.',
  },
  {
    id: 'senior',
    marker: 'Stage four',
    title: 'Senior and executive',
    subtitle: 'Seniority is signalled by restraint, not by length.',
    length: 'Two pages. Three only for board, academic or federal contexts.',
    leadsWith: 'A scope statement: what you run, how large it is, and what changed under you.',
    body: [
      {
        heading: 'Open with the size of the thing you are responsible for',
        text: 'Revenue, headcount, budget, region, board exposure. “Commercial director for a €48M business unit, 90 staff across four markets” orients the reader in one line and sets the bar for everything below it.',
      },
      {
        heading: 'A selected achievements block is legitimate here',
        text: 'Three to five career-defining results above the chronology, each with a timeframe. At this level the last two roles cannot hold everything that matters, and a reader should not have to excavate page two for the turnaround you led.',
      },
      {
        heading: 'Direction, not operations',
        text: 'The bullets should describe decisions, trade-offs and change: restructures, market entries, cost bases, retention, funding rounds, exits. A tool list or a certification from 2011 pulls the document downwards in perceived level.',
      },
      {
        heading: 'Plain beats decorated',
        text: 'The most senior documents are usually the plainest: one typeface, one accent, generous margins, no icons. Anything that looks designed invites the question of who designed it.',
      },
    ],
    drop: [
      'Software and tool lists',
      'Certifications more than about ten years old',
      'Detail on early-career roles — compress them into one “Earlier career” line',
      'Any adjective you would not say aloud in a board meeting',
    ],
    templateSlugs: ['executive-cv', 'executive-classic-cv', 'modern-executive'],
    templateNote:
      'Formal, unhurried layouts with room for a scope statement and a selected-achievements block before the chronology begins.',
  },
];

const overview: { stage: string; length: string; leads: string; cut: string }[] = [
  {
    stage: 'Student / graduate',
    length: 'One page',
    leads: 'Education with substance under it',
    cut: 'High school, objective statement, referees',
  },
  {
    stage: 'Career changer',
    length: 'One to two pages',
    leads: 'A profile naming the target role, then skills',
    cut: 'Old-industry duties and jargon',
  },
  {
    stage: 'Mid-level (4–10 years)',
    length: 'Two pages',
    leads: 'Experience, with numbers on every recent bullet',
    cut: 'Internships, GPA, generic software skills',
  },
  {
    stage: 'Senior / executive',
    length: 'Two pages',
    leads: 'Scope: budget, headcount, region, results',
    cut: 'Tool lists, old certifications, early-career detail',
  },
];

const faqs: FaqEntry[] = [
  {
    question: 'I am a student with no jobs at all. What goes in the experience section?',
    answer:
      'Rename it. “Projects and experience” lets you include a coursework project with a real deliverable, a society role with a budget, a volunteering commitment with a schedule, and any paid work you have done. Each entry still gets dates, a one-line context and one or two bullets with something measurable in them.',
  },
  {
    question: 'Should a career changer use a functional, skills-only resume?',
    answer:
      'Almost never. Documents without dated roles read as concealment to experienced screeners, and applicant tracking systems extract employment history by looking for date-anchored entries. Use a hybrid instead: a strong skills block near the top, then a grouped but fully dated chronology.',
  },
  {
    question: 'When should education stop being at the top?',
    answer:
      'Once you have roughly two to three years of relevant full-time work, or immediately after your first role in the field if that role is more impressive than your degree. Education moves to the bottom as a one-line entry per qualification; it never disappears entirely.',
  },
  {
    question: 'Can two pages really hold twenty years of work?',
    answer:
      'It has to, and the constraint is the point. A senior reader is assessing judgement, and a document that includes everything demonstrates none. Give the last two roles most of the space, compress the middle, and reduce anything before the last decade to a single “Earlier career” line.',
  },
  {
    question: 'How do I show two promotions at the same employer?',
    answer:
      'One employer block with the total date span, then each title nested beneath it with its own dates and bullets. This makes the progression visible at a glance, keeps the tenure honest, and avoids the impression of three separate short jobs.',
  },
  {
    question: 'Do I need a portfolio link?',
    answer:
      'For design, front-end, content, research and data roles, yes — and make it the only link, pointing at three finished pieces rather than an archive. For most other roles a customised LinkedIn URL is enough. A link that 404s is worse than no link.',
  },
  {
    question: 'How do I present a return to work after a career break?',
    answer:
      'As a dated entry with a plain label — “Career break: caring responsibilities” or “Career break: relocation and retraining” — plus one line on anything you did that keeps you current. Unexplained gaps invite speculation; a labelled one closes the subject in a single line.',
  },
];

export default function ResumeMakerPage() {
  return (
    <>
      <Section size="lg">
        <Breadcrumbs
          items={[
            { name: 'Home', path: '/' },
            { name: 'Resume maker', path: '/resume-maker' },
          ]}
        />
        <div className="max-w-3xl">
          <Eyebrow>By career stage</Eyebrow>
          <h1 className="mt-3 text-4xl font-extrabold tracking-tight text-balance text-ink-950 sm:text-5xl lg:text-[3.4rem] lg:leading-[1.05]">
            The same resume advice does not fit four different careers
          </h1>
          <p className="mt-5 text-base leading-relaxed text-pretty text-ink-600 sm:text-lg">
            A graduate and a commercial director are writing genuinely different documents. What
            leads, how long it runs, which sections earn their space and which layout carries it —
            all four change. Find your stage below and follow that column only.
          </p>
          <div className="mt-8 flex flex-wrap gap-3">
            <ButtonLink href="/register" size="lg">
              Start a resume — free
            </ButtonLink>
            <ButtonLink href="#student" size="lg" variant="outline">
              Jump to the stages
            </ButtonLink>
          </div>
        </div>

        <div className="mt-14 overflow-x-auto rounded-xl border border-ink-200 bg-white">
          <table className="w-full min-w-[44rem] border-collapse text-sm">
            <caption className="sr-only">Resume length and emphasis by career stage</caption>
            <thead>
              <tr className="bg-ink-50 text-left">
                <th scope="col" className="px-4 py-3 font-semibold text-ink-950">
                  Stage
                </th>
                <th scope="col" className="px-4 py-3 font-semibold text-ink-950">
                  Length
                </th>
                <th scope="col" className="px-4 py-3 font-semibold text-ink-950">
                  What leads the document
                </th>
                <th scope="col" className="px-4 py-3 font-semibold text-ink-950">
                  First thing to cut
                </th>
              </tr>
            </thead>
            <tbody>
              {overview.map((row) => (
                <tr key={row.stage} className="border-t border-ink-200 align-top">
                  <th scope="row" className="px-4 py-3 text-left font-medium text-ink-800">
                    {row.stage}
                  </th>
                  <td className="px-4 py-3 text-ink-600">{row.length}</td>
                  <td className="px-4 py-3 text-ink-600">{row.leads}</td>
                  <td className="px-4 py-3 text-ink-600">{row.cut}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Section>

      {stages.map((stage, index) => (
        <Section key={stage.id} id={stage.id} tone={index % 2 === 0 ? 'muted' : 'white'}>
          <div className="grid gap-10 lg:grid-cols-[1fr_1.15fr]">
            <div>
              <Eyebrow>{stage.marker}</Eyebrow>
              <h2 className="mt-3 text-3xl font-extrabold tracking-tight text-ink-950 sm:text-4xl">
                {stage.title}
              </h2>
              <p className="mt-3 text-base leading-relaxed text-ink-600">{stage.subtitle}</p>

              <dl className="mt-8 space-y-4 rounded-xl border border-ink-200 bg-white p-5">
                <div>
                  <dt className="text-2xs font-bold tracking-[0.14em] text-brand-700 uppercase">
                    Leads with
                  </dt>
                  <dd className="mt-1 text-sm leading-relaxed text-ink-800">{stage.leadsWith}</dd>
                </div>
                <div>
                  <dt className="text-2xs font-bold tracking-[0.14em] text-brand-700 uppercase">
                    Length
                  </dt>
                  <dd className="mt-1 text-sm leading-relaxed text-ink-800">{stage.length}</dd>
                </div>
                <div>
                  <dt className="text-2xs font-bold tracking-[0.14em] text-brand-700 uppercase">
                    Drop
                  </dt>
                  <dd className="mt-1">
                    <ul className="flex flex-col gap-1.5">
                      {stage.drop.map((item) => (
                        <li key={item} className="flex gap-2 text-sm leading-relaxed text-ink-700">
                          <span aria-hidden className="text-ink-400">
                            —
                          </span>
                          {item}
                        </li>
                      ))}
                    </ul>
                  </dd>
                </div>
              </dl>
            </div>

            <div>
              {stage.body.map((part) => (
                <div key={part.heading} className="mb-6 last:mb-0">
                  <h3 className="text-lg font-bold text-ink-950">{part.heading}</h3>
                  <p className="mt-2 text-[15px] leading-relaxed text-ink-700">{part.text}</p>
                </div>
              ))}
            </div>
          </div>

          <div className="mt-12">
            <h3 className="text-base font-semibold text-ink-950">
              Templates that suit this stage
            </h3>
            <p className="mt-1.5 max-w-2xl text-sm leading-relaxed text-ink-600">
              {stage.templateNote}
            </p>
            <div className="mt-6">
              <TemplateGrid templates={pickTemplates(stage.templateSlugs)} columns={3} width={240} />
            </div>
          </div>
        </Section>
      ))}

      <Section tone="muted">
        <FaqSection
          entries={faqs}
          title="Questions that depend on where you are"
          description="Answers that change with seniority, rather than one rule applied to everybody."
        />
      </Section>

      <Section>
        <CtaBanner
          title="Write the version that matches your stage"
          description="Pick the template for where you are now, not for the job you had five years ago. Switching later takes one click and keeps every word you have written."
          primaryLabel="Start a resume — free"
          secondaryHref="/cv-examples"
          secondaryLabel="See finished examples"
          note="Two saved documents on the free plan — enough to keep a general resume and a tailored one."
        />
        <div className="mt-16">
          <RelatedLinks
            title="Related pages"
            links={[
              {
                label: 'US resume conventions',
                href: '/resume-builder',
                description: 'Letter paper, no photo, and the CV distinction.',
              },
              {
                label: 'Resume and CV examples',
                href: '/cv-examples',
                description: 'Complete documents at each level of seniority.',
              },
              {
                label: 'What makes a CV professional',
                href: '/professional-cv',
                description: 'Evidence, verbs, formatting and what to omit.',
              },
              {
                label: 'The one-sitting method',
                href: '/cv-maker',
                description: 'A timed plan for producing the first draft.',
              },
              {
                label: 'ATS-friendly templates',
                href: '/ats-cv',
                description: 'Layouts scored for automated text extraction.',
              },
              {
                label: 'All templates',
                href: '/templates',
                description: 'The full library, by category and column count.',
              },
            ]}
          />
        </div>
        <p className="mt-10 text-sm text-ink-600">
          Not sure which stage you are in? If you are still explaining your degree in interviews,
          read the graduate section; if you are explaining your budget, read the senior one. Or
          start with{' '}
          <Link href="/cv-builder" className="font-medium text-brand-700 underline underline-offset-2">
            a tour of the editor
          </Link>
          .
        </p>
      </Section>
    </>
  );
}
