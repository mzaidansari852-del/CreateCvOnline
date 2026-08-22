import 'server-only';

import mammoth from 'mammoth';
import { getDocumentProxy } from 'unpdf';

import { readLayout, toMarkedText } from './layout';

/**
 * Turning an uploaded file into something we can read.
 *
 * This layer does one job and refuses to do more: bytes in, plain text out. It knows
 * nothing about CVs, sections or headings — that is `parse.ts`, and keeping the two apart
 * is what lets the parser be tested against fixed strings rather than against binary files,
 * and what lets a different parsing engine be swapped in later without touching upload,
 * validation or storage.
 *
 * ## The formats
 *
 * `application/json` is the easy one and the most valuable: it is this site's own export
 * coming home. Everything else is a best-effort read of a document that was never designed
 * to be read back.
 *
 * PDF is the format people actually have, and it is the one with no structure to offer. A
 * PDF is positioned glyphs; "this line is a job title" is not information it carries. What
 * comes out here is text in roughly reading order, and `parse.ts` has to infer the rest.
 */

/** The hard ceiling on an upload. A CV that exceeds this is not a CV. */
export const MAX_IMPORT_BYTES = 8 * 1024 * 1024;

export const ACCEPTED_IMPORT_TYPES = [
  'application/pdf',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
  'application/json',
] as const;

export type ImportKind = 'pdf' | 'docx' | 'json';

export interface ExtractedDocument {
  kind: ImportKind;
  /** Plain text in reading order. Empty for `json`. */
  text: string;
  /** Parsed JSON, for the export-coming-home path. `null` otherwise. */
  json: unknown;
  /** Page count, where the format has pages. */
  pages: number;
  /**
   * Set when the text almost certainly came out in the wrong order.
   *
   * A two-column CV has no notion of columns in the file; the extractor walks glyph runs and
   * emits them in whatever order they were written, which on a sidebar layout interleaves the
   * sidebar with the body — the same defect the ATS pages on this site warn about, arriving
   * from the other direction. We cannot fix it here, but we can say so, and the review screen
   * can tell the user why their import looks shuffled instead of letting them assume the
   * importer is simply bad.
   */
  likelyMultiColumn: boolean;
}

export class ImportError extends Error {
  constructor(
    readonly code:
      'too-large' | 'unsupported-type' | 'empty' | 'unreadable' | 'encrypted' | 'invalid-json',
    message: string,
  ) {
    super(message);
    this.name = 'ImportError';
  }
}

function kindFor(mime: string, filename: string): ImportKind {
  const lower = filename.toLowerCase();
  if (mime === 'application/pdf' || lower.endsWith('.pdf')) return 'pdf';
  if (mime.includes('wordprocessingml') || lower.endsWith('.docx')) return 'docx';
  if (mime === 'application/json' || lower.endsWith('.json')) return 'json';
  throw new ImportError(
    'unsupported-type',
    `Cannot read ${mime || 'that file type'}. Upload a PDF, a .docx or a CreateCVOnline JSON export.`,
  );
}

/**
 * Whether the extracted text looks like it came from a multi-column layout.
 *
 * The signal is short lines that alternate with long ones far more often than prose does. A
 * sidebar produces a run of two-to-four-word lines (`Skills`, `Figma`, `Sketch`) spliced
 * between full-width sentences, so the variance in line length is high and the short lines
 * are not clustered together the way a list would be.
 *
 * This is a heuristic reporting on the output of another heuristic, so it is deliberately
 * conservative: it only fires when the pattern is strong, because a false warning teaches
 * people to ignore the true ones.
 */
function detectMultiColumn(text: string): boolean {
  const lines = text
    .split('\n')
    .map((line) => line.trim())
    .filter(Boolean);
  if (lines.length < 25) return false;

  let alternations = 0;
  for (let i = 1; i < lines.length; i++) {
    const previous = lines[i - 1]!.length;
    const current = lines[i]!.length;
    // A jump between a fragment and a full line, in either direction.
    if ((previous < 20 && current > 60) || (previous > 60 && current < 20)) alternations += 1;
  }
  return alternations / lines.length > 0.18;
}

async function readPdf(bytes: Uint8Array): Promise<ExtractedDocument> {
  let pages = 0;
  let text = '';
  let multiColumn = false;
  try {
    const pdf = await getDocumentProxy(bytes);
    pages = pdf.numPages;

    /*
     * Read from coordinates, not from the file's own ordering.
     *
     * `extractText` returns glyph runs in the order the PDF stores them, which is not reading
     * order — so a sidebar interleaves with the body, a right-aligned date lands inside a
     * sentence, and every heading looks like an ordinary line. `readLayout` rebuilds lines
     * from position and marks headings by font size, which turns most of what the parser used
     * to guess into something it can simply read. See `layout.ts`.
     */
    const layout = await readLayout(pdf);
    text = toMarkedText(layout);
    multiColumn = layout.multiColumn;
  } catch (error) {
    const message = error instanceof Error ? error.message : '';
    if (/password|encrypt/i.test(message)) {
      throw new ImportError(
        'encrypted',
        'That PDF is password-protected. Remove the password and upload it again.',
      );
    }
    throw new ImportError('unreadable', 'That PDF could not be read. It may be damaged.');
  }

  /*
   * A PDF that yields almost nothing is the scanned-or-image case, and it is worth its own
   * message. The file opens perfectly, looks like a CV to the person who uploaded it, and
   * contains no text at all — telling them "nothing found" without saying why invites them to
   * try the same file twice. It is also the exact failure the ATS pages describe: a CV
   * exported as an image is invisible to every parser, ours included.
   */
  if (text.trim().length < 40) {
    throw new ImportError(
      'empty',
      'No text could be read from that PDF. It is most likely a scan or an exported image — the same reason applicant tracking systems cannot read it either.',
    );
  }

  /*
   * Two sources for the same warning, and both are worth keeping.
   *
   * `readLayout` reports a gutter it actually found, which is the reliable signal. The
   * older text-shape heuristic still catches documents whose columns overlap enough that no
   * clean gutter exists — where the order is scrambled but the geometry does not say so.
   */
  return {
    kind: 'pdf',
    text,
    json: null,
    pages,
    likelyMultiColumn: multiColumn || detectMultiColumn(text),
  };
}

async function readDocx(bytes: Uint8Array): Promise<ExtractedDocument> {
  let text = '';
  try {
    // `Buffer.from` copies rather than wrapping, which matters: mammoth holds the buffer
    // beyond this call and the request body may be recycled.
    const result = await mammoth.extractRawText({ buffer: Buffer.from(bytes) });
    text = result.value ?? '';
  } catch {
    throw new ImportError(
      'unreadable',
      'That Word file could not be read. Save it as .docx or export it as a PDF and try again.',
    );
  }

  if (text.trim().length < 40) {
    throw new ImportError('empty', 'That document appears to be empty.');
  }

  return { kind: 'docx', text, json: null, pages: 0, likelyMultiColumn: detectMultiColumn(text) };
}

function readJson(bytes: Uint8Array): ExtractedDocument {
  let parsed: unknown;
  try {
    parsed = JSON.parse(new TextDecoder().decode(bytes));
  } catch {
    throw new ImportError('invalid-json', 'That file is not valid JSON.');
  }
  return { kind: 'json', text: '', json: parsed, pages: 0, likelyMultiColumn: false };
}

/** Reads an uploaded file into text or JSON. Throws `ImportError` with a code the UI maps. */
export async function extractDocument(
  bytes: Uint8Array,
  mime: string,
  filename: string,
): Promise<ExtractedDocument> {
  if (bytes.byteLength > MAX_IMPORT_BYTES) {
    throw new ImportError('too-large', 'That file is larger than 8 MB.');
  }
  if (bytes.byteLength === 0) {
    throw new ImportError('empty', 'That file is empty.');
  }

  const kind = kindFor(mime, filename);
  if (kind === 'pdf') return readPdf(bytes);
  if (kind === 'docx') return readDocx(bytes);
  return readJson(bytes);
}
