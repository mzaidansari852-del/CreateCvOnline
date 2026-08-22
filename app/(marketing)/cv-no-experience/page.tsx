import Link from 'next/link';

import {
  Breadcrumbs,
  CtaBanner,
  Eyebrow,
  FaqSection,
  FeatureGrid,
  RelatedLinks,
  Section,
  SectionHeading,
  StatRow,
  StepList,
  type FaqEntry,
} from '@/components/marketing/primitives';
import { JsonLd } from '@/components/seo/JsonLd';
import { ButtonLink } from '@/components/ui/button';
import { pageMetadata } from '@/lib/seo/metadata';
import { howToSchema } from '@/lib/seo/schema';

export const metadata = pageMetadata({
  title: 'CV With No Work Experience — What to Put on the Page Instead',
  description:
    'A CV with no jobs on it is not an empty CV. What to put in place of an employment history, in what order, and the two mistakes that make an inexperienced CV look worse than it is.',
  path: '/cv-no-experience',
  keywords: [
    'cv with no work experience',
    'how to write a cv with no work experience',
    'cv for no work experience template',
    'first cv',
    'cv with no job history',
    'student cv no experience',
  ],
});

const sections = [
  {
    title: 'Education, in more detail than you would normally give',
    description:
      'Later on, education is three lines at the bottom. Now it is the main event, and it can carry the weight: relevant modules, your dissertation or final project, the grade if it helps you, and any coursework that involved doing something rather than reading about it. "Final-year project: designed and tested a queue simulation for a 40-bed clinic" is a real piece of work.',
  },
  {
    title: 'Projects — the section that does the heavy lifting',
    description:
      'Anything you built, ran, organised or fixed, whether or not anyone paid you. A shop for a family business, a modded server with users on it, a fundraiser, a translated manual. Describe it exactly as you would describe a job: what it was, what you did, what happened as a result.',
  },
  {
    title: 'Volunteering and unpaid work',
    description:
      'Unpaid work is work. Reading with primary pupils, running a club, sorting stock in a charity shop — all of it shows up for something on a schedule and being relied on, which is most of what an employer is checking for in a first hire.',
  },
  {
    title: 'Part-time, seasonal and family work',
    description:
      'Two summers in a restaurant is experience. So is a Saturday job, and so is unpaid work in a family business — write it as an employer with dates. People routinely leave these off because they feel unrelated to the job they want, which removes the only evidence that they have ever held down a shift.',
  },
  {
    title: 'Skills, with a level attached',
    description:
      'A list of software with no context reads as aspiration. "Excel — pivot tables and VLOOKUP, used for the club’s membership records" is checkable. Languages get the same treatment: name the level rather than the word "fluent", which means different things to different readers.',
  },
  {
    title: 'A short profile that says what you are aiming at',
    description:
      'Three lines. What you have just finished, what you are looking for, and one thing you can already do. Its job is to stop the reader wondering why they are holding a CV with no jobs on it — answering that in the first three seconds is worth more than any other line on the page.',
  },
];

const steps = [
  {
    title: 'Put education first',
    description:
      'Move it above experience. With no employment history, education is your strongest section and it belongs where the reader looks first. Section order is a drag in the editor, not a template you have to find.',
  },
  {
    title: 'Write projects as if they were jobs',
    description:
      'Same shape: a title, a date range, and two or three bullets that start with a verb. "Built", "organised", "translated", "ran". A project written in this shape reads as work; the same project written as a paragraph reads as a hobby.',
  },
  {
    title: 'Add everything paid, however unrelated',
    description:
      'Every shift you have worked, in reverse order. You are not claiming they are relevant. You are showing that somebody has employed you and you turned up.',
  },
  {
    title: 'Cut it to one page and stop',
    description:
      'A first CV is one page. If it runs to two, the second page is padding, and padding is more obvious on a short career than on a long one.',
  },
];

const mistakes = [
  {
    title: 'Padding it to look longer',
    description:
      'Wider margins, 14pt body text, three lines of interests, a skills bar chart showing 70% Microsoft Word. Every one of these signals that there was not enough to fill the page, which is the exact impression you were trying to avoid. A confident one-page CV with white space on it beats a stretched one.',
  },
  {
    title: 'Calling yourself passionate and hard-working',
    description:
      'Every candidate with no experience writes this, so it distinguishes nobody, and none of it is checkable. Replace it with something that happened: a thing you made, a group you organised, a shift you covered every Saturday for a year.',
  },
  {
    title: 'Leaving off unpaid or unrelated work',
    description:
      'The two most common deletions are the family business and the supermarket job, on the grounds that neither is "professional". They are the only proof on the page that you have ever been relied upon.',
  },
  {
    title: 'An objective aimed at yourself',
    description:
      '"Seeking a challenging role that will develop my skills" describes what you want from the employer. "Recent economics graduate looking for an analyst role; comfortable with Excel and SQL from my final-year project" describes what they get.',
  },
];

const faqs: FaqEntry[] = [
  {
    question: 'How long should a CV be with no work experience?',
    answer:
      'One page. Not as a rule imposed from outside — as a consequence. With no employment history, a second page can only be filled with padding, and padding is far more visible on a short CV than on a long one.',
  },
  {
    question: 'What goes where the work experience section normally is?',
    answer:
      'Education first, then projects, then any paid or unpaid work you have done. Projects do most of the work: something you built, organised, ran or fixed, written in exactly the same shape as a job — title, dates, bullets starting with a verb.',
  },
  {
    question: 'Should I include a Saturday job that has nothing to do with the role?',
    answer:
      'Yes. It is the only evidence on the page that an employer has relied on you and that you turned up. Nobody expects a first CV to be full of relevant roles; they are checking whether you have held down a commitment.',
  },
  {
    question: 'Can I put school projects and coursework on a CV?',
    answer:
      'Yes, and you should — provided you write what you did rather than what the module covered. "Studied database design" is a syllabus. "Designed and populated a 12-table database for a mock booking system, presented to a panel" is a piece of work.',
  },
  {
    question: 'Do I need a cover letter if my CV is thin?',
    answer:
      'It matters more here than at any other stage of a career. The CV shows what you have done; the letter explains why you are applying to this employer, which is the question a thin CV leaves open.',
  },
  {
    question: 'Is a creative template a good idea for a first CV?',
    answer:
      'Usually not. A decorated layout on a CV with little content draws attention to how little there is, and it parses badly if the employer uses an applicant tracking system. A clean single-column layout puts the focus on what you have written.',
  },
  {
    question: 'What if I have genuinely never worked, studied recently, or volunteered?',
    answer:
      'Then lead with skills and projects, and start one this month — a small, finished, describable thing is worth more on the page than another month of looking. A finished project you can talk about for five minutes changes the CV more than any wording will.',
  },
];

export default function CvNoExperiencePage() {
  return (
    <>
      <Section size="lg">
        <Breadcrumbs
          items={[
            { name: 'Home', path: '/' },
            { name: 'CV with no work experience', path: '/cv-no-experience' },
          ]}
        />

        <div className="max-w-3xl">
          <Eyebrow>First CV</Eyebrow>
          <h1 className="mt-3 text-4xl font-extrabold tracking-tight text-balance text-ink-950 sm:text-5xl lg:text-[3.4rem] lg:leading-[1.05]">
            A CV with no work experience is not an empty CV
          </h1>
          <p className="mt-5 max-w-2xl text-base leading-relaxed text-pretty text-ink-600 sm:text-lg">
            It is a CV with a different order. Education moves to the top, projects do the work that
            employment usually does, and the unpaid things you have been dismissing become the
            evidence. Here is what goes on the page, in what order, and the two mistakes that make
            an inexperienced CV look worse than it is.
          </p>
          <div className="mt-8 flex flex-wrap gap-3">
            <ButtonLink href="/register" size="lg">
              Start your first CV — free
            </ButtonLink>
            <ButtonLink href="/cv-examples/student" size="lg" variant="outline">
              See a student CV in full
            </ButtonLink>
          </div>
        </div>

        <div className="mt-16 border-t border-ink-200 pt-10">
          <StatRow
            stats={[
              { value: '1', label: 'page, and stop there' },
              { value: '3', label: 'lines in the profile' },
              { value: 'Education', label: 'goes first, not last' },
              { value: '0', label: 'uses for “hard-working”' },
            ]}
          />
        </div>
      </Section>

      <Section tone="muted">
        <SectionHeading
          align="left"
          eyebrow="What goes on the page"
          title="Six sections that replace an employment history"
          description="Between them these fill a page honestly. Not one of them requires you to have had a job."
        />
        <div className="mt-10">
          <FeatureGrid items={sections} columns={3} />
        </div>
      </Section>

      <Section>
        <SectionHeading
          eyebrow="How to write it"
          title="Four steps, in order"
          description="An afternoon, most of which is remembering things you had not thought to count."
        />
        <div className="mt-12">
          <StepList steps={steps} />
        </div>
        <JsonLd
          nodes={[
            howToSchema({
              name: 'How to write a CV with no work experience',
              description:
                'Move education above experience, write projects in the same shape as jobs, include every paid and unpaid role however unrelated, and keep the whole thing to one page.',
              steps: steps.map((step) => ({ name: step.title, text: step.description })),
            }),
          ]}
        />
      </Section>

      <Section tone="muted">
        <SectionHeading
          align="left"
          eyebrow="What to avoid"
          title="The four things that make it look worse"
          description="Each of these is done with good intentions, and each has the opposite effect on the person reading."
        />
        <ul className="mt-10 grid gap-4 sm:grid-cols-2">
          {mistakes.map((item) => (
            <li key={item.title} className="rounded-xl border border-ink-200 bg-white p-5">
              <h3 className="text-base font-semibold text-ink-950">{item.title}</h3>
              <p className="mt-1.5 text-sm leading-relaxed text-ink-600">{item.description}</p>
            </li>
          ))}
        </ul>
        <p className="mt-10 max-w-3xl text-sm leading-relaxed text-ink-600">
          The through-line is the same in all four: an employer reading a first CV already knows you
          have not worked much. Nothing is gained by disguising it, and the disguise is what gets
          noticed. What they are looking for is evidence that you finish things and turn up — which
          is why a{' '}
          <Link
            href="/cv-examples/student"
            className="font-medium text-brand-700 underline underline-offset-2"
          >
            specific, ordinary, true detail
          </Link>{' '}
          outperforms any adjective.
        </p>
      </Section>

      <Section>
        <FaqSection
          entries={faqs}
          title="Questions about a first CV"
          description="The ones that come up before anyone starts writing."
        />
      </Section>

      <Section tone="muted">
        <CtaBanner
          title="Write it in an editor that lets education go first"
          description="Section order is a drag, not a template you have to hunt for. Put education above experience, add a projects section, and see the page as you type."
          primaryLabel="Start — free"
          secondaryHref="/cv-builder"
          secondaryLabel="See the editor"
          note="No card required. One page, exported as a PDF that looks the same on their machine."
        />
        <div className="mt-16">
          <RelatedLinks
            title="Where to go next"
            links={[
              {
                label: 'A student CV, written out in full',
                href: '/cv-examples/student',
                description:
                  'A complete first CV with no employment history, and why each choice was made.',
              },
              {
                label: 'Worked CV examples',
                href: '/cv-examples',
                description: 'Complete documents by role, with every choice explained.',
              },
              {
                label: 'CV advice by profession',
                href: '/cv-for',
                description: 'What to write for your field once you have something to write.',
              },
              {
                label: 'AI CV builder',
                href: '/ai-cv-builder',
                description: 'Ten questions, and it writes the first draft from your answers.',
              },
              {
                label: 'ATS-friendly CV templates',
                href: '/ats-cv',
                description: 'Clean single-column layouts that parse correctly.',
              },
              {
                label: 'The CV builder, screen by screen',
                href: '/cv-builder',
                description: 'Drag education above experience in about two seconds.',
              },
              {
                label: 'Free CV builder',
                href: '/free-cv-builder',
                description: 'What the free plan includes, and what it does not.',
              },
              {
                label: 'CV blog',
                href: '/blog',
                description: 'Longer guides, including one written for students and graduates.',
              },
              {
                label: 'All CV templates',
                href: '/cv-templates',
                description: 'The full library, by category.',
              },
            ]}
          />
        </div>
      </Section>
    </>
  );
}
