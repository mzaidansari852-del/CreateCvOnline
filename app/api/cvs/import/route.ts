import { NextResponse } from 'next/server';

import { authedRoute, apiError } from '@/lib/api/handler';
import { completeCv } from '@/lib/cv/import/complete';
import { ImportError, MAX_IMPORT_BYTES, extractDocument } from '@/lib/cv/import/extract';
import { parseCvText, type ParseReport } from '@/lib/cv/import/parse';
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
  async ({ request, profile }) => {
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
            contact: [],
            likelyMultiColumn: false,
          } satisfies ParseReport,
        });
      }

      const { data, report } = parseCvText(document.text, {
        likelyMultiColumn: document.likelyMultiColumn,
      });

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

      const complete = completeCv(parsed.data, profile.locale);
      return NextResponse.json({
        source: document.kind,
        drafts: [{ title: titleFrom(complete, file.name), data: complete }],
        report,
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
