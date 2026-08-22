'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Plus, Trash2 } from 'lucide-react';

import { apiRequest } from '@/components/dashboard/api';
import { useStoredJson, writeStoredJson } from '@/hooks/browser';
import { useCopy, useLocale } from '@/components/i18n/LocaleProvider';
import { Button, ButtonLink } from '@/components/ui/button';
import { Alert } from '@/components/ui/feedback';
import { Field, Input, Textarea } from '@/components/ui/form';
import { useToast } from '@/components/ui/toast';
import { formatDateRange } from '@/lib/cv/format';
import {
  INTERVIEW_STEPS,
  MAX_EDUCATION,
  MAX_JOBS,
  type InterviewAnswers,
} from '@/lib/cv/interview/questions';
import { defaultSectionLabels } from '@/lib/i18n/cv-labels';
import type { CVData } from '@/types/cv';

/**
 * The interview: ask, then write, then let them read it before it exists.
 *
 * ## Why the answers are kept in the browser
 *
 * Somebody halfway through describing four jobs has done ten minutes of real work, and a
 * refreshed tab, a dead battery or a mistaken back button would otherwise cost all of it —
 * on the exact screen where the person is least willing to start again. Saving the answers
 * server-side would mean a second collection, a second set of rules and a second thing to
 * delete when the account goes; `localStorage` costs a few lines and covers the case that
 * actually happens.
 *
 * ## Why the paywall is at the end
 *
 * A free account walks the whole questionnaire. The questions are worth answering in their
 * own right — several people will read them, write their own CV in the editor, and never pay,
 * which is fine — and a paywall in front of an empty form asks somebody to buy something they
 * have not seen. It appears where the cost is actually incurred, with the answers safe.
 */

const STORAGE_KEY = 'cv-interview-draft';

const EMPTY: InterviewAnswers = {
  fullName: '',
  targetRole: '',
  email: '',
  phone: '',
  location: '',
  jobs: [{ role: '', company: '', period: '', did: '', numbers: '' }],
  education: [{ qualification: '', school: '', year: '' }],
  skills: '',
  languages: '',
  extras: '',
};

type Draft = { title: string; data: CVData };

interface BuildResponse {
  draft: Draft;
  removed: number;
}

export function InterviewFlow() {
  const allCopy = useCopy();
  const copy = allCopy.interview;
  const locale = useLocale();
  const labels = defaultSectionLabels(locale);
  const router = useRouter();
  const toast = useToast();

  const [step, setStep] = useState(0);
  /*
   * Seeded from storage through the shared hook rather than an effect.
   *
   * Reading `localStorage` in the render body causes a hydration mismatch — the server has no
   * such thing — and restoring it with `setState` inside an effect costs an extra render and
   * is what `react-hooks/set-state-in-effect` exists to stop. `useStoredJson` returns the
   * server value during hydration and the stored one immediately after, which is the same
   * arrangement the dashboard preferences already use.
   */
  const restored = useStoredJson<InterviewAnswers>(STORAGE_KEY, EMPTY);
  const [edited, setEdited] = useState<InterviewAnswers | null>(null);
  const answers = edited ?? { ...EMPTY, ...restored };
  const [busy, setBusy] = useState(false);
  const [creating, setCreating] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [upgrade, setUpgrade] = useState(false);
  const [result, setResult] = useState<BuildResponse | null>(null);

  const steps = INTERVIEW_STEPS;
  const current = steps[step]!;
  const isLast = step === steps.length - 1;

  function set<K extends keyof InterviewAnswers>(key: K, value: InterviewAnswers[K]) {
    const next = { ...answers, [key]: value };
    setEdited(next);
    // Best effort: private browsing and a full quota both refuse, and the questionnaire
    // still works — it just forgets if the tab is closed.
    writeStoredJson(STORAGE_KEY, next);
  }

  async function build() {
    setBusy(true);
    setError(null);
    setUpgrade(false);
    try {
      const response = await apiRequest<BuildResponse>('/api/cvs/interview', {
        method: 'POST',
        body: JSON.stringify(answers),
      });
      setResult(response);
    } catch (caught) {
      const message = caught instanceof Error ? caught.message : copy.genericError;
      // The one error worth a different screen: it is an offer, not a failure.
      if (/upgrade|Pro|Lifetime/i.test(message)) setUpgrade(true);
      else setError(message);
    } finally {
      setBusy(false);
    }
  }

  async function create() {
    if (!result) return;
    setCreating(true);
    try {
      const { cv } = await apiRequest<{ cv: { id: string } }>('/api/cvs', {
        method: 'POST',
        body: JSON.stringify({ title: result.draft.title, data: result.draft.data }),
      });
      // The answers have become a document; leaving them behind would greet the next visit
      // to this page with somebody else's finished CV half-filled into the form.
      writeStoredJson(STORAGE_KEY, EMPTY);
      toast.success(copy.createdTitle, copy.createdBody);
      router.push(`/dashboard/cvs/${cv.id}/edit`);
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : copy.genericError);
      setCreating(false);
    }
  }

  /* ------------------------------------------------------------------ review step */

  if (result) {
    const { data } = result.draft;
    return (
      <div className="mx-auto max-w-3xl">
        <div className="mb-6">
          <h2 className="text-xl font-bold text-ink-950">{copy.reviewTitle}</h2>
          <p className="mt-1.5 text-sm leading-relaxed text-ink-600">{copy.reviewLede}</p>
        </div>

        {error ? (
          <Alert tone="danger" title={copy.title} className="mb-6">
            {error}
          </Alert>
        ) : null}

        {/*
          Shown because it is the one line on this screen that proves the guard did something.
          A user who reads "we left out 2 lines that mentioned figures you did not give us"
          learns more about how this feature behaves than any amount of reassuring copy.
        */}
        {result.removed > 0 ? (
          <Alert tone="info" title={copy.honestyTitle} className="mb-6">
            {copy.removedNotice(result.removed)}
          </Alert>
        ) : null}

        <div className="rounded-2xl border border-ink-200 bg-white p-6">
          <p className="text-lg font-bold text-ink-950">
            {data.personal.firstName} {data.personal.lastName}
          </p>
          {data.personal.title ? (
            <p className="text-sm text-brand-700">{data.personal.title}</p>
          ) : null}
          {data.summary ? (
            <p className="mt-4 text-sm leading-relaxed text-ink-700">{data.summary}</p>
          ) : null}

          {data.experience.length > 0 ? (
            <section className="mt-6">
              <h3 className="text-sm font-bold tracking-wide text-ink-950 uppercase">
                {labels.experience}
              </h3>
              <ul className="mt-3 flex flex-col gap-4">
                {data.experience.map((job) => (
                  <li key={job.id}>
                    <p className="text-sm font-semibold text-ink-950">
                      {[job.role, job.company].filter(Boolean).join(' — ')}
                    </p>
                    <p className="text-[13px] text-ink-500">
                      {formatDateRange(
                        job.startDate,
                        job.endDate,
                        job.current,
                        'month-year-short',
                        locale,
                      )}
                    </p>
                    <ul className="mt-1.5 flex list-disc flex-col gap-1 pl-5">
                      {job.achievements.map((line, index) => (
                        <li key={index} className="text-[13px] leading-snug text-ink-700">
                          {line}
                        </li>
                      ))}
                    </ul>
                  </li>
                ))}
              </ul>
            </section>
          ) : null}

          {data.education.length > 0 ? (
            <section className="mt-6">
              <h3 className="text-sm font-bold tracking-wide text-ink-950 uppercase">
                {labels.education}
              </h3>
              <ul className="mt-3 flex flex-col gap-2">
                {data.education.map((entry) => (
                  <li key={entry.id} className="text-sm text-ink-700">
                    <span className="font-medium text-ink-950">{entry.degree}</span>
                    {entry.institution ? ` — ${entry.institution}` : ''}
                    {entry.startDate ? ` · ${entry.startDate}` : ''}
                  </li>
                ))}
              </ul>
            </section>
          ) : null}

          {data.skills.length > 0 ? (
            <section className="mt-6">
              <h3 className="text-sm font-bold tracking-wide text-ink-950 uppercase">
                {labels.skills}
              </h3>
              <p className="mt-2 text-[13px] text-ink-600">
                {data.skills.map((skill) => skill.name).join(' · ')}
              </p>
            </section>
          ) : null}
        </div>

        <div className="mt-6 flex flex-wrap gap-3">
          <Button size="lg" loading={creating} onClick={() => void create()}>
            {creating ? copy.creating : copy.create}
          </Button>
          <Button size="lg" variant="outline" disabled={creating} onClick={() => setResult(null)}>
            {copy.editAnswers}
          </Button>
        </div>
      </div>
    );
  }

  /* --------------------------------------------------------------- questionnaire */

  const questionsFor = (id: string) => copy.questions[id]!;

  return (
    <div className="mx-auto max-w-2xl">
      <p className="text-[13px] font-medium text-ink-500">{copy.stepOf(step + 1, steps.length)}</p>
      <h2 className="mt-1 text-xl font-bold text-ink-950">{copy.steps[current.id]!.title}</h2>
      <p className="mt-1.5 text-sm text-ink-600">{copy.steps[current.id]!.lede}</p>

      {error ? (
        <Alert tone="danger" title={copy.title} className="mt-6">
          {error}
        </Alert>
      ) : null}

      {upgrade ? (
        <Alert
          tone="info"
          title={copy.upgradeTitle}
          className="mt-6"
          action={
            <ButtonLink href="/pricing" size="sm">
              {copy.upgradeCta}
            </ButtonLink>
          }
        >
          {copy.upgradeBody}
        </Alert>
      ) : null}

      <div className="mt-6 flex flex-col gap-6">
        {'repeats' in current && current.repeats === 'jobs'
          ? answers.jobs.map((job, index) => (
              <fieldset key={index} className="rounded-2xl border border-ink-200 bg-white p-5">
                <legend className="px-1 text-sm font-semibold text-ink-950">
                  {copy.jobNumber(index)}
                </legend>
                <div className="flex flex-col gap-4">
                  {current.questions.map((question) => (
                    <Answer
                      key={question.id}
                      copy={questionsFor(question.id)}
                      kind={question.kind}
                      value={job[question.id as keyof typeof job]}
                      onChange={(value) =>
                        set(
                          'jobs',
                          answers.jobs.map((entry, at) =>
                            at === index ? { ...entry, [question.id]: value } : entry,
                          ),
                        )
                      }
                    />
                  ))}
                </div>
                {answers.jobs.length > 1 ? (
                  <Button
                    variant="ghost"
                    size="sm"
                    className="mt-3"
                    leadingIcon={<Trash2 size={14} aria-hidden />}
                    onClick={() =>
                      set(
                        'jobs',
                        answers.jobs.filter((_, at) => at !== index),
                      )
                    }
                  >
                    {copy.removeEntry}
                  </Button>
                ) : null}
              </fieldset>
            ))
          : null}

        {'repeats' in current && current.repeats === 'education'
          ? answers.education.map((entry, index) => (
              <fieldset key={index} className="rounded-2xl border border-ink-200 bg-white p-5">
                <legend className="px-1 text-sm font-semibold text-ink-950">
                  {copy.educationNumber(index)}
                </legend>
                <div className="flex flex-col gap-4">
                  {current.questions.map((question) => (
                    <Answer
                      key={question.id}
                      copy={questionsFor(question.id)}
                      kind={question.kind}
                      value={entry[question.id as keyof typeof entry]}
                      onChange={(value) =>
                        set(
                          'education',
                          answers.education.map((item, at) =>
                            at === index ? { ...item, [question.id]: value } : item,
                          ),
                        )
                      }
                    />
                  ))}
                </div>
                {answers.education.length > 1 ? (
                  <Button
                    variant="ghost"
                    size="sm"
                    className="mt-3"
                    leadingIcon={<Trash2 size={14} aria-hidden />}
                    onClick={() =>
                      set(
                        'education',
                        answers.education.filter((_, at) => at !== index),
                      )
                    }
                  >
                    {copy.removeEntry}
                  </Button>
                ) : null}
              </fieldset>
            ))
          : null}

        {!('repeats' in current)
          ? current.questions.map((question) => (
              <Answer
                key={question.id}
                copy={questionsFor(question.id)}
                kind={question.kind}
                value={answers[question.id as keyof InterviewAnswers] as string}
                onChange={(value) => set(question.id as 'skills', value)}
              />
            ))
          : null}

        {'repeats' in current && current.repeats === 'jobs' && answers.jobs.length < MAX_JOBS ? (
          <Button
            variant="outline"
            leadingIcon={<Plus size={15} aria-hidden />}
            onClick={() =>
              set('jobs', [
                ...answers.jobs,
                { role: '', company: '', period: '', did: '', numbers: '' },
              ])
            }
          >
            {copy.addJob}
          </Button>
        ) : null}

        {'repeats' in current &&
        current.repeats === 'education' &&
        answers.education.length < MAX_EDUCATION ? (
          <Button
            variant="outline"
            leadingIcon={<Plus size={15} aria-hidden />}
            onClick={() =>
              set('education', [...answers.education, { qualification: '', school: '', year: '' }])
            }
          >
            {copy.addEducation}
          </Button>
        ) : null}
      </div>

      {/*
        The promise, kept in front of them while they answer the question it is about.
        It belongs next to the figures question, not buried in a help page, because that is
        where somebody decides whether to make a number up.
      */}
      {'repeats' in current && current.repeats === 'jobs' ? (
        <Alert tone="info" title={copy.honestyTitle} className="mt-6">
          {copy.honestyBody}
        </Alert>
      ) : null}

      <div className="mt-8 flex flex-wrap items-center gap-3">
        {step > 0 ? (
          <Button variant="outline" size="lg" onClick={() => setStep(step - 1)}>
            {copy.back}
          </Button>
        ) : null}
        {isLast ? (
          <Button size="lg" loading={busy} onClick={() => void build()}>
            {busy ? copy.building : copy.build}
          </Button>
        ) : (
          <Button size="lg" onClick={() => setStep(step + 1)}>
            {copy.next}
          </Button>
        )}
      </div>
    </div>
  );
}

function Answer({
  copy,
  kind,
  value,
  onChange,
}: {
  copy: { label: string; hint: string };
  kind: 'short' | 'long';
  value: string;
  onChange: (value: string) => void;
}) {
  return (
    <Field label={copy.label} hint={copy.hint}>
      {({ id }) =>
        kind === 'long' ? (
          <Textarea
            id={id}
            rows={4}
            value={value}
            onChange={(event) => onChange(event.target.value)}
          />
        ) : (
          <Input id={id} value={value} onChange={(event) => onChange(event.target.value)} />
        )
      }
    </Field>
  );
}
