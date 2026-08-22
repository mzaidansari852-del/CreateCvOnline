'use client';

import { useRef, useState } from 'react';
import { useRouter } from 'next/navigation';

import { useCopy, useLocale } from '@/components/i18n/LocaleProvider';
import { Button, ButtonLink } from '@/components/ui/button';
import { Alert } from '@/components/ui/feedback';
import { Field, Input } from '@/components/ui/form';
import { useToast } from '@/components/ui/toast';
import { apiRequest } from '@/components/dashboard/api';
import { defaultSectionLabels } from '@/lib/i18n/cv-labels';
import { formatDateRange } from '@/lib/cv/format';
import type { BuiltInSectionId, CVData } from '@/types/cv';

/**
 * Upload a CV, look at what came out, then create it.
 *
 * ## Why there is a review step at all
 *
 * Because the parse is a guess. A PDF records glyph positions, not meaning, so "this line is
 * an employer" is inferred — and inference is wrong often enough that saving straight to the
 * account produces a document nobody checked, with a merged job or a shifted date in it. The
 * person who eventually notices is a recruiter.
 *
 * So the flow refuses to skip the look: `POST /api/cvs/import` saves nothing, this screen
 * shows what was read and what was not, and only pressing Create writes anything — through
 * the ordinary `POST /api/cvs`, which already owns the quota and entitlement checks.
 *
 * ## Why only the contact fields are editable here
 *
 * Everything else is editable one screen later, in an editor that already does it properly.
 * Rebuilding that here would be a second, worse editor to maintain. The contact block is the
 * exception because it is what the parser most often gets wrong — the name is the weakest
 * inference in the whole module — and it is what a recruiter reads first, so it is worth
 * fixing before the document exists rather than after.
 */

type Draft = { title: string; data: CVData };

interface ImportResponse {
  source: 'pdf' | 'docx' | 'json';
  drafts: Draft[];
  report: {
    found: BuiltInSectionId[];
    partial: BuiltInSectionId[];
    contact: string[];
    likelyMultiColumn: boolean;
  };
}

const ACCEPT = '.pdf,.docx,.json,application/pdf,application/json';

export function ImportFlow() {
  /*
   * One `useCopy()` call, at the top.
   *
   * The back-link needs `cvs.backToMyCvs` and originally called the hook again where it
   * was used — inside the review branch, which returns early on the upload step. That is a
   * different number of hooks between two renders of the same component, which React
   * detects as a violation and which breaks the moment the user moves between the steps.
   */
  const allCopy = useCopy();
  const copy = allCopy.importCv;
  const locale = useLocale();
  const labels = defaultSectionLabels(locale);
  const router = useRouter();
  const toast = useToast();
  const inputRef = useRef<HTMLInputElement>(null);

  const [busy, setBusy] = useState(false);
  const [creating, setCreating] = useState(false);
  const [dragging, setDragging] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<ImportResponse | null>(null);
  const [draft, setDraft] = useState<Draft | null>(null);

  const personal = draft?.data.personal;

  async function upload(file: File) {
    setBusy(true);
    setError(null);
    try {
      const body = new FormData();
      body.set('file', file);
      // Not `apiRequest`: that sets a JSON content type, and multipart needs the browser to
      // set its own boundary.
      const response = await fetch('/api/cvs/import', { method: 'POST', body });
      const payload = (await response.json().catch(() => null)) as
        ImportResponse | { error?: { code?: string; message?: string } } | null;

      if (!response.ok) {
        const code = (payload as { error?: { code?: string } })?.error?.code ?? '';
        setError(copy.error(code));
        return;
      }

      const data = payload as ImportResponse;
      setResult(data);
      setDraft(data.drafts[0] ?? null);
    } catch {
      setError(copy.genericError);
    } finally {
      setBusy(false);
    }
  }

  async function create() {
    if (!draft) return;
    setCreating(true);
    try {
      const { cv } = await apiRequest<{ cv: { id: string } }>('/api/cvs', {
        method: 'POST',
        body: JSON.stringify({ title: draft.title, data: draft.data }),
      });
      toast.success(copy.createdTitle, copy.createdBody);
      router.push(`/dashboard/cvs/${cv.id}/edit`);
    } catch (caught) {
      const message = caught instanceof Error ? caught.message : copy.genericError;
      setError(message);
      setCreating(false);
    }
  }

  function patchPersonal(patch: Partial<CVData['personal']>) {
    setDraft((current) =>
      current
        ? {
            ...current,
            data: { ...current.data, personal: { ...current.data.personal, ...patch } },
          }
        : current,
    );
  }

  /* ---------------------------------------------------------------- upload step */

  if (!result || !draft) {
    return (
      <div className="mx-auto max-w-2xl">
        {error ? (
          <Alert tone="danger" title={copy.title} className="mb-6">
            {error}
          </Alert>
        ) : null}

        <div
          onDragOver={(event) => {
            event.preventDefault();
            setDragging(true);
          }}
          onDragLeave={() => setDragging(false)}
          onDrop={(event) => {
            event.preventDefault();
            setDragging(false);
            const file = event.dataTransfer.files?.[0];
            if (file) void upload(file);
          }}
          className={`rounded-2xl border-2 border-dashed px-6 py-14 text-center transition-colors ${
            dragging ? 'border-brand-400 bg-brand-50' : 'border-ink-300 bg-ink-50'
          }`}
        >
          <p className="text-base font-semibold text-ink-950">{copy.dropHere}</p>
          <p className="mt-1.5 text-sm text-ink-600">{copy.formats}</p>

          <input
            ref={inputRef}
            type="file"
            accept={ACCEPT}
            className="sr-only"
            onChange={(event) => {
              const file = event.target.files?.[0];
              if (file) void upload(file);
              // Reset, so choosing the same file twice after an error still fires `change`.
              event.target.value = '';
            }}
          />
          <Button
            className="mt-6"
            size="lg"
            loading={busy}
            onClick={() => inputRef.current?.click()}
          >
            {busy ? copy.reading : copy.chooseFile}
          </Button>
        </div>
      </div>
    );
  }

  /* ---------------------------------------------------------------- review step */

  const { report } = result;

  /*
   * Each section is shown with its contents, not just a count.
   *
   * "Work Experience — 1 entry" is a number the user cannot check. It is right when the CV
   * holds one job and badly wrong when it holds four that got merged, and it reads exactly
   * the same either way — so the screen that exists to catch parsing mistakes was hiding the
   * only mistake worth catching. Printing the job titles and dates makes a merge obvious at
   * a glance, which is the entire point of asking someone to review this.
   */
  const sections: { id: BuiltInSectionId; label: string; detail: string; lines: string[] }[] = [];
  const add = (id: BuiltInSectionId, count: number, kind: 'entries' | 'items', lines: string[]) => {
    if (!report.found.includes(id)) return;
    sections.push({
      id,
      label: labels[id],
      detail: kind === 'entries' ? copy.entriesFound(count) : copy.itemsFound(count),
      lines,
    });
  };

  /** `Role — Company · Jan 2020 – Present`, with the empty parts dropped rather than padded. */
  const withDates = (
    title: string,
    subtitle: string,
    start: string,
    end: string,
    current: boolean,
  ) =>
    [
      [title, subtitle].filter(Boolean).join(' — '),
      formatDateRange(start, end, current, 'month-year-short', locale),
    ]
      .filter(Boolean)
      .join('  ·  ');

  add(
    'experience',
    draft.data.experience.length,
    'entries',
    draft.data.experience.map((job) =>
      withDates(job.role, job.company, job.startDate, job.endDate, job.current),
    ),
  );
  add(
    'education',
    draft.data.education.length,
    'entries',
    draft.data.education.map((entry) =>
      withDates(entry.degree, entry.institution, entry.startDate, entry.endDate, entry.current),
    ),
  );
  // Skills and languages are one line each: a 25-item list down the page would bury the
  // entries above it, which are the ones that go wrong.
  add('skills', draft.data.skills.length, 'items', [
    draft.data.skills.map((skill) => skill.name).join(' · '),
  ]);
  add('languages', draft.data.languages.length, 'items', [
    draft.data.languages.map((language) => language.name).join(' · '),
  ]);
  if (report.found.includes('summary')) {
    sections.push({
      id: 'summary',
      label: labels.summary,
      detail: '',
      lines: [draft.data.summary ?? ''],
    });
  }

  const readNothing = sections.length === 0;

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

      {report.likelyMultiColumn ? (
        <Alert tone="warning" title={copy.multiColumnTitle} className="mb-6">
          {copy.multiColumnBody}
        </Alert>
      ) : null}

      {readNothing ? (
        <Alert tone="warning" title={copy.nothingHeading} className="mb-6">
          {copy.nothingBody}
        </Alert>
      ) : (
        <div className="mb-6 rounded-2xl border border-ink-200 bg-white p-6">
          <h3 className="text-sm font-bold tracking-wide text-ink-950 uppercase">
            {copy.foundHeading}
          </h3>
          <ul className="mt-4 flex flex-col gap-5">
            {sections.map((section) => (
              <li key={section.id}>
                <div className="flex items-baseline justify-between gap-4 text-sm">
                  <span className="font-medium text-ink-900">{section.label}</span>
                  <span className="shrink-0 text-ink-500">{section.detail}</span>
                </div>
                {section.lines.some(Boolean) ? (
                  <ul className="mt-2 flex flex-col gap-1.5 border-l-2 border-ink-100 pl-3.5">
                    {section.lines.filter(Boolean).map((line, index) => (
                      <li key={index} className="text-[13px] leading-snug text-ink-600">
                        {line.length > 180 ? `${line.slice(0, 180).trimEnd()}…` : line}
                      </li>
                    ))}
                  </ul>
                ) : null}
              </li>
            ))}
          </ul>

          {report.partial.length > 0 ? (
            <>
              <h3 className="mt-6 text-sm font-bold tracking-wide text-ink-950 uppercase">
                {copy.partialHeading}
              </h3>
              <ul className="mt-3 flex flex-wrap gap-2">
                {report.partial.map((id) => (
                  <li
                    key={id}
                    className="rounded-full border border-ink-200 px-3 py-1 text-[13px] text-ink-600"
                  >
                    {labels[id]}
                  </li>
                ))}
              </ul>
            </>
          ) : null}
        </div>
      )}

      {/*
        Dates get their own warning rather than a line in the list.

        They are the field where being wrong is both most likely and least visible: a CV with
        one job's end date a year out still reads perfectly, so nothing prompts a second look
        unless something does it here.
      */}
      {draft.data.experience.length > 0 ? (
        <Alert tone="info" title={copy.checkDatesTitle} className="mb-6">
          {copy.checkDatesBody}
        </Alert>
      ) : null}

      <div className="rounded-2xl border border-ink-200 bg-white p-6">
        <h3 className="text-sm font-bold tracking-wide text-ink-950 uppercase">
          {copy.contactHeading}
        </h3>
        <p className="mt-1.5 text-sm text-ink-600">{copy.contactLede}</p>

        <div className="mt-5 grid gap-4 sm:grid-cols-2">
          <Field label={copy.firstName}>
            {({ id }) => (
              <Input
                id={id}
                value={personal?.firstName ?? ''}
                onChange={(event) => patchPersonal({ firstName: event.target.value })}
              />
            )}
          </Field>
          <Field label={copy.lastName}>
            {({ id }) => (
              <Input
                id={id}
                value={personal?.lastName ?? ''}
                onChange={(event) => patchPersonal({ lastName: event.target.value })}
              />
            )}
          </Field>
          <div className="sm:col-span-2">
            <Field label={copy.jobTitle}>
              {({ id }) => (
                <Input
                  id={id}
                  value={personal?.title ?? ''}
                  onChange={(event) => patchPersonal({ title: event.target.value })}
                />
              )}
            </Field>
          </div>
          <Field label={copy.email}>
            {({ id }) => (
              <Input
                id={id}
                type="email"
                value={personal?.email ?? ''}
                onChange={(event) => patchPersonal({ email: event.target.value })}
              />
            )}
          </Field>
          <Field label={copy.phone}>
            {({ id }) => (
              <Input
                id={id}
                value={personal?.phone ?? ''}
                onChange={(event) => patchPersonal({ phone: event.target.value })}
              />
            )}
          </Field>
        </div>
      </div>

      <p className="mt-5 text-[13px] leading-relaxed text-ink-500">{copy.editAfterwards}</p>

      <div className="mt-6 flex flex-wrap gap-3">
        <Button size="lg" loading={creating} onClick={() => void create()}>
          {creating ? copy.creating : copy.create}
        </Button>
        <Button
          size="lg"
          variant="outline"
          disabled={creating}
          onClick={() => {
            setResult(null);
            setDraft(null);
            setError(null);
          }}
        >
          {copy.startOver}
        </Button>
        <ButtonLink href="/dashboard/cvs" size="lg" variant="ghost">
          {allCopy.cvs.backToMyCvs}
        </ButtonLink>
      </div>
    </div>
  );
}
