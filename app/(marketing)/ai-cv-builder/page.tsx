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
import { TEMPLATE_COUNT } from '@/lib/cv/template-registry';
import { pageMetadata } from '@/lib/seo/metadata';
import { howToSchema } from '@/lib/seo/schema';
import { site } from '@/lib/site';

export const metadata = pageMetadata({
  title: 'AI CV Builder — Answer Ten Questions, Get a CV That Is True',
  description:
    'An AI CV writer that will not invent your achievements. Answer ten questions in plain words; it writes the summary, the bullets and the dates — and removes any figure you did not give it.',
  path: '/ai-cv-builder',
  keywords: [
    'ai cv builder',
    'ai cv writer',
    'ai resume builder',
    'write cv with ai',
    'ai cv generator',
    'cv builder that writes for you',
  ],
});

const steps = [
  {
    title: 'Answer about ten questions',
    description:
      'Your name, the job you are after, and then one job at a time: what it was, where, when, and what you actually did — in the words you would use out loud. Each question carries an example answer underneath it, because "what did you do there" is only a useful question if you know how much to write.',
  },
  {
    title: 'Give the numbers you have',
    description:
      'One question asks specifically for figures: team size, budget, sites, customers. It is the only place numbers can come from. Leave it blank and your CV has none, which is the correct outcome if you do not have them to hand.',
  },
  {
    title: 'The AI writes the document',
    description:
      'It writes the professional summary from scratch, turns each answer into separate achievement bullets starting with a verb, works out dates from however you wrote them, and sorts everything into sections. About five seconds.',
  },
  {
    title: 'Read it before it exists',
    description:
      'Nothing is saved until you have seen it. The draft is on screen, in full, and you keep it or go back and change your answers. Then it opens in the editor like any other CV — same templates, same PDF export.',
  },
];

const guarantees = [
  {
    title: 'It cannot use a number you did not give',
    description:
      'After the AI writes the CV, every bullet is checked against what you typed. Any line carrying a figure that never appeared in your answers is removed, and you are told how many were taken out. Not a prompt asking nicely — a check that runs afterwards, because an instruction is a request and this is not something to leave to good behaviour.',
  },
  {
    title: 'It rephrases, it does not embellish',
    description:
      '"I managed the maintenance team and did the monthly reports" becomes two clean bullets. It does not become "Led a high-performing team of 12, driving a 30% improvement in response times" — because you did not say twelve, and you did not say thirty per cent.',
  },
  {
    title: 'It writes in your language',
    description:
      'Answer in French and your CV is in French. There is no translation step that quietly turns your words into somebody else’s, and no English phrasing leaking into a document you are sending to an employer in Lyon.',
  },
  {
    title: 'Every word is editable afterwards',
    description:
      'The result is an ordinary CV in the ordinary editor. Rewrite a bullet, drop a job, switch template — nothing about it is locked because a machine produced the first draft.',
  },
];

const whyItMatters = [
  {
    title: 'Invented figures fail in the room',
    description:
      'A CV claiming a 30% improvement invites the question "how did you measure that?" — and an interviewer asks it. A candidate who cannot answer has not just lost a point; they have made everything else on the page suspect.',
  },
  {
    title: 'They are also the easiest thing to invent',
    description:
      'Numbers are what makes CV prose sound senior, which is exactly why a model reaches for them. Ask any general-purpose AI to write a CV bullet and count how many percentages come back that you never mentioned.',
  },
  {
    title: 'You will not notice',
    description:
      'Nobody proof-reads a sentence that flatters them. A fabricated achievement reads as a good day you had half-forgotten, which is why the check has to happen before you see the draft rather than relying on you to catch it.',
  },
];

const faqs: FaqEntry[] = [
  {
    question: 'Does the AI actually write the CV, or is it a form?',
    answer:
      'It writes it. The professional summary does not exist in your answers at all — the AI composes it. Your plain sentences become structured achievement bullets, and "January 2021 to now" becomes a start date with the role marked as current. The questions exist because an AI cannot write about a person it knows nothing about; they are the input, not a substitute for the writing.',
  },
  {
    question: 'How is this different from asking ChatGPT to write my CV?',
    answer:
      'Two things. It asks you the right questions first, so it has real material instead of guessing at a generic CV for your job title. And it will not keep a figure you did not give it — a general-purpose chatbot will happily hand you a percentage it invented, and it looks exactly like one you earned.',
  },
  {
    question: 'What if I do not have impressive numbers?',
    answer:
      'Then your CV will not have numbers in it, and that is fine. Most people do not have a clean metric for most of what they have done. A specific true bullet — "ran the monthly reporting cycle for four regional offices" — beats an invented percentage, because you can talk about it for ten minutes without flinching.',
  },
  {
    question: 'How long does it take?',
    answer:
      'The questions take five to ten minutes if you know your dates. The writing takes a few seconds. Most of the remaining time goes on the editor afterwards, where you cut and sharpen — which is the part worth spending time on.',
  },
  {
    question: 'Can I use it if I already have a CV?',
    answer:
      'Use import instead. It reads a PDF or Word file straight into the editor, keeping your jobs, dates and bullet points, and takes about ten seconds. The AI writer is for starting from nothing.',
  },
  {
    question: 'Is it free?',
    answer:
      'Answering the questions is free, and the questions are useful on their own — several people work through them and then write the CV themselves in the editor, which costs nothing and always will. The AI writing step is part of Pro and Lifetime.',
  },
  {
    question: 'Which languages does it work in?',
    answer:
      'English, French, German and Dutch. The questions and their examples are written in each language rather than machine-translated, and the CV comes back in whichever language you answered in.',
  },
  {
    question: 'Does the finished CV still work with applicant tracking systems?',
    answer:
      'It is a normal CV in a normal template, so ATS behaviour depends on the template you pick, not on how the text was written. Choose one of the single-column layouts scored for parser safety and it will parse cleanly.',
  },
];

export default function AiCvBuilderPage() {
  return (
    <>
      <Section size="lg">
        <Breadcrumbs
          items={[
            { name: 'Home', path: '/' },
            { name: 'AI CV builder', path: '/ai-cv-builder' },
          ]}
        />

        <div className="max-w-3xl">
          <Eyebrow>The AI writer</Eyebrow>
          <h1 className="mt-3 text-4xl font-extrabold tracking-tight text-balance text-ink-950 sm:text-5xl lg:text-[3.4rem] lg:leading-[1.05]">
            An AI CV builder that will not make things up
          </h1>
          <p className="mt-5 max-w-2xl text-base leading-relaxed text-pretty text-ink-600 sm:text-lg">
            Answer about ten questions in your own words. It writes the summary, turns what you said
            into proper achievement bullets and sorts out the dates — then removes any figure you
            did not give it, and tells you how many it removed.
          </p>
          <div className="mt-8 flex flex-wrap gap-3">
            <ButtonLink href="/register" size="lg">
              Start answering — free
            </ButtonLink>
            <ButtonLink href="/cv-builder" size="lg" variant="outline">
              See the editor
            </ButtonLink>
          </div>
          <p className="mt-4 text-[13px] text-ink-500">
            The questions are free. The AI writing step is part of Pro and Lifetime.
          </p>
        </div>

        <div className="mt-16 border-t border-ink-200 pt-10">
          <StatRow
            stats={[
              { value: '~10', label: 'questions, with an example under each' },
              { value: '4', label: 'languages, written not translated' },
              { value: '0', label: 'figures invented, by design' },
              { value: String(TEMPLATE_COUNT), label: 'templates for the result' },
            ]}
          />
        </div>
      </Section>

      <Section tone="muted">
        <SectionHeading
          eyebrow="How it works"
          title="From a blank page to a first draft"
          description="The blank page is what stops most people finishing a CV. Being asked one concrete question at a time is a different task entirely."
        />
        <div className="mt-12">
          <StepList steps={steps} />
        </div>
        <JsonLd
          nodes={[
            howToSchema({
              name: 'How to write a CV with AI',
              description:
                'Answer around ten questions about your work in plain words, give any figures you have, let the AI write the summary and bullets, then review the draft before saving it.',
              steps: steps.map((step) => ({ name: step.title, text: step.description })),
            }),
          ]}
        />
      </Section>

      <Section>
        <SectionHeading
          align="left"
          eyebrow="The promise"
          title="What it will not do"
          description="Every AI CV tool claims accuracy. This is the mechanism behind the claim, so you can judge it rather than trust it."
        />
        <div className="mt-10">
          <FeatureGrid items={guarantees} columns={2} />
        </div>
      </Section>

      <Section tone="muted">
        <SectionHeading
          align="left"
          eyebrow="Why it matters"
          title="The problem with an AI that flatters you"
          description="This is the failure mode nobody talks about when selling an AI CV builder, and it is the one that costs you the job."
        />
        <div className="mt-10">
          <FeatureGrid items={whyItMatters} columns={3} />
        </div>
        <p className="mt-10 max-w-3xl text-sm leading-relaxed text-ink-600">
          The honest version is less impressive to demo and better to send. A bullet you can talk
          about for ten minutes is worth more than one that reads well and collapses under a single
          follow-up question — and an interviewer only has to ask once.
        </p>
      </Section>

      <Section>
        <SectionHeading
          align="left"
          eyebrow="Already have a CV?"
          title="Then do not answer questions — upload it"
          description="The AI writer is for starting from nothing. If a CV already exists, importing it is faster and keeps your own wording."
        />
        <p className="mt-6 max-w-3xl text-sm leading-relaxed text-ink-600">
          Import reads a PDF or Word file and fills the editor: jobs, employers, dates, bullet
          points, education, skills and languages. It works from the page layout rather than the raw
          text order, which is what stops a two-column CV coming back scrambled — and it shows you
          what it read before anything is saved.{' '}
          <Link
            href="/cv-builder"
            className="font-medium text-brand-700 underline underline-offset-2"
          >
            See how the editor handles it
          </Link>
          .
        </p>
      </Section>

      <Section tone="muted">
        <FaqSection
          entries={faqs}
          title="Questions about the AI writer"
          description={`Specific to how ${site.name} writes a CV. Pricing is on the plans page.`}
        />
      </Section>

      <Section>
        <CtaBanner
          title="Answer the first three questions and see"
          description="They take under a minute, they cost nothing, and they are the questions you would have to answer to write the CV yourself anyway."
          primaryLabel="Start — free"
          secondaryHref="/pricing"
          secondaryLabel="See plans"
          note="No card required. The questions are free; the AI writing step is part of Pro and Lifetime."
        />
        <div className="mt-16">
          <RelatedLinks
            title="Where to go next"
            links={[
              {
                label: 'The CV builder, screen by screen',
                href: '/cv-builder',
                description: 'What the editor actually looks like, and what it deliberately omits.',
              },
              {
                label: 'CV maker: the one-sitting method',
                href: '/cv-maker',
                description: 'A timed plan for writing it yourself, if you would rather.',
              },
              {
                label: 'ATS-friendly CV templates',
                href: '/ats-cv',
                description: 'Single-column layouts scored for parser safety.',
              },
              {
                label: 'Worked CV examples',
                href: '/cv-examples',
                description: 'Complete documents by role, with every choice explained.',
              },
              {
                label: 'CV advice by profession',
                href: '/cv-for',
                description: 'What to write for your field — metrics, order, rewrites.',
              },
              {
                label: 'Free CV builder',
                href: '/free-cv-builder',
                description: 'What the free plan includes, and what it does not.',
              },
              {
                label: `All ${TEMPLATE_COUNT} CV templates`,
                href: '/cv-templates',
                description: 'The full library, by category.',
              },
              {
                label: 'Pricing',
                href: '/pricing',
                description: 'Free, Pro and one-time Lifetime, side by side.',
              },
            ]}
          />
        </div>
      </Section>
    </>
  );
}
