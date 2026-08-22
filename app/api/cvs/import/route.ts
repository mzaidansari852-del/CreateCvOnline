import { NextResponse } from 'next/server';

import { authedRoute, apiError } from '@/lib/api/handler';
import { aiExtractionAvailable, extractWithModel } from '@/lib/cv/import/ai';
import { completeCv } from '@/lib/cv/import/complete';
import { cvFromModel } from '@/lib/cv/import/from-model';
import { ImportError, MAX_IMPORT_BYTES, extractDocument } from '@/lib/cv/import/extract';
import { parseCvText, type ParseReport, type ParsedCv } from '@/lib/cv/import/parse';
import type { Locale } from '@/lib/i18n/locales';
import { cvDataSchema, type CVData } from '@/types/cv';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

/**
 * Reads an uploaded CV and returns a draft. Saves nothing.
 *
 * ## Why this does not create the CV
 *
 * It would be one line, and it would be the wrong line. Parsing another tool's PDF is
 * inference, and inference is wrong often enough that writing the result straight to the
 * account produces a document the user never checked — with a merged job or a wrong date in
 * it, discovered by a recruiter months later.
 *
 * So the split is deliberate: this endpoint reads, the review screen shows what it got, and
 * creation goes through the existing `POST /api/cvs` with the corrected data. That path
 * already holds the quota check, the template entitlement and the language stamping; a
 * second creation route here would have been a second copy of all three, drifting from the
 * first the moment either changed.
 *
 * ## Cost
 *
 * Nothing is persisted, so the rate limit is the only thing standing between this and a
 * cheap way to burn server CPU on 8 MB PDFs. It is deliberately tighter than the other
 * write routes: importing is a once-or-twice action, not something a real session repeats.
 */
export const POST = authedRoute(
  { scope: 'cvs-import', rateLimit: { max: 8, windowSeconds: 300 } },
  async ({ request, profile, plan }) => {
    let form: FormData;
    try {
      form = await request.formData();
    } catch {
      return apiError(400, 'invalid-request', 'Upload the file as multipart form data.');
    }

    const file = form.get('file');
    if (!(file instanceof File)) {
      return apiError(400, 'invalid-request', 'No file was uploaded.');
    }
    if (file.size > MAX_IMPORT_BYTES) {
      return apiError(413, 'too-large', 'That file is larger than 8 MB.');
    }

    const bytes = new Uint8Array(await file.arrayBuffer());
    const locale = profile.locale;

    try {
      const document = await extractDocument(bytes, file.type, file.name);

      /*
       * A CreateCVOnline export coming home.
       *
       * This is the only path that is not guesswork: the file carries our own schema, so it
       * is validated rather than inferred, and every field survives exactly. It is also the
       * case people hit when restoring a backup or moving between accounts, where losing a
       * detail would be least forgivable.
       */
      if (document.kind === 'json') {
        const drafts = draftsFromExport(document.json, profile.locale);
        if (drafts.length === 0) {
          return apiError(
            422,
            'invalid-json',
            'That JSON is not a CreateCVOnline export, or it contains no CVs.',
          );
        }
        return NextResponse.json({
          source: 'json',
          drafts,
          report: {
            found: [],
            partial: [],
            custom: [],
            contact: [],
            likelyMultiColumn: false,
          } satisfies ParseReport,
          engine: 'rules',
          upgradeAvailable: false,
        });
      }

      /*
       * Two readers, and which one runs is an entitlement question.
       *
       * The model reads a CV substantially better than the rules do — published benchmarks
       * on this task put layout-aware model extraction at 0.959 F1 against 0.817 for a
       * commercial rule-based parser — and it costs a fraction of a cent per import, so it
       * is a paid feature rather than a free one.
       *
       * The fallback is not a lesser tier so much as the floor under both. A free account
       * gets the parser; a paid one gets the parser when the key is missing, the vendor is
       * down, the request times out or the reply is malformed. An import that fails outright
       * because a third party is having an afternoon would be worse than one that reads a
       * CV imperfectly, and the review screen makes the difference visible either way.
       */
      const useModel = plan.id !== 'free' && aiExtractionAvailable();
      const fromModel = useModel ? await readWithModel(document, locale) : null;
      const read =
        fromModel ?? parseCvText(document.text, { likelyMultiColumn: document.likelyMultiColumn });
      const { data, report } = read;

      /*
       * Validated on the way out, not just on the way back in.
       *
       * The parser builds an object by hand from regex output, so it is exactly the kind of
       * code that produces a 4,000-character "summary" or a date the schema will refuse. If
       * that reaches the review screen unchecked, the user edits a draft that cannot be
       * saved and only finds out when they press Create. `safeParse` with the real schema
       * trims and coerces here, so what they review is what will save.
       */
      const parsed = cvDataSchema.safeParse(data);
      if (!parsed.success) {
        return apiError(
          422,
          'unreadable',
          'That file was read, but nothing in it matched the shape of a CV.',
        );
      }

      const complete = completeCv(parsed.data, locale);
      return NextResponse.json({
        source: document.kind,
        drafts: [{ title: titleFrom(complete, file.name), data: complete }],
        report,
        /*
         * Which reader ran, and whether a better one exists for this account.
         *
         * The review screen uses the pair to decide whether to mention the upgrade — and to
         * decide when *not* to. A paid account whose import fell back to the rules because
         * the vendor was down must not be shown an advertisement for what it already pays
         * for, and a free account is only offered the upgrade when the model path is
         * actually configured and would therefore actually do something.
         */
        engine: fromModel ? 'model' : 'rules',
        upgradeAvailable: plan.id === 'free' && aiExtractionAvailable(),
      });
    } catch (error) {
      if (error instanceof ImportError) {
        const status = error.code === 'too-large' ? 413 : 422;
        return apiError(status, error.code, error.message);
      }
      throw error;
    }
  },
);

/** A name for the imported CV — the person's own, falling back to the filename. */
function titleFrom(data: CVData, filename: string): string {
  const name = `${data.personal.firstName} ${data.personal.lastName}`.trim();
  if (name) return data.personal.title ? `${name} — ${data.personal.title}` : name;
  return filename.replace(/\.[^.]+$/, '').slice(0, 120);
}

/**
 * Pulls CVs out of an export file.
 *
 * Tolerant of shape on purpose: `v1` wraps them in `{ cvs: [...] }`, and someone will
 * eventually upload a single CV object they pulled out of that file by hand. Both work.
 * What is *not* tolerated is content — every candidate goes through `cvDataSchema`, so a
 * hand-edited file cannot put an unvalidated document into an account.
 */
function draftsFromExport(
  json: unknown,
  fallbackLanguage: Locale,
): { title: string; data: CVData }[] {
  const candidates: unknown[] = [];

  if (json && typeof json === 'object') {
    const root = json as Record<string, unknown>;
    if (Array.isArray(root.cvs)) candidates.push(...root.cvs);
    else candidates.push(json);
  }

  const drafts: { title: string; data: CVData }[] = [];
  for (const candidate of candidates) {
    if (!candidate || typeof candidate !== 'object') continue;
    const record = candidate as Record<string, unknown>;
    // An export entry is a CV *document* — `{ id, title, data, … }` — but a hand-extracted
    // one may be the bare `data`. Try the nested field first, then the object itself.
    const nested = cvDataSchema.safeParse(record.data);
    const parsed = nested.success ? nested : cvDataSchema.safeParse(candidate);
    if (!parsed.success) continue;
    // A hand-extracted `data` object can be missing its section list just as a parsed PDF
    // is, so exports go through the same repair rather than being trusted for being JSON.
    // An export states its own language; only a file that lacks one falls back.
    const data = completeCv(parsed.data, parsed.data.language ?? fallbackLanguage);
    const title =
      typeof record.title === 'string' && record.title.trim() ? record.title.trim() : '';
    drafts.push({ title: title || titleFrom(data, 'Imported CV'), data });
  }
  return drafts.slice(0, 25);
}

/**
 * Reads the document with the model, or returns null so the caller falls back.
 *
 * Every failure is a null, including a reply that parsed but contained nothing — a model that
 * answers `{}` has not read the CV, and passing that on would show the user an empty review
 * screen while the rules-based parser sitting next to it would have found five jobs.
 */
async function readWithModel(
  document: { text: string; likelyMultiColumn: boolean },
  locale: Locale,
): Promise<ParsedCv | null> {
  try {
    const model = await extractWithModel(document.text, locale);
    const read = cvFromModel(model, { likelyMultiColumn: document.likelyMultiColumn });
    if (read.report.found.length === 0) return null;
    return read;
  } catch (error) {
    // Logged, never surfaced: the user gets a working import either way, and the message
    // can name the vendor's internals.
    console.error('[cv-import] model extraction failed, falling back', error);
    return null;
  }
}
