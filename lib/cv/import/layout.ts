import 'server-only';

import type { PDFDocumentProxy } from 'unpdf/pdfjs';

/**
 * Reading a PDF the way a person reads it, instead of the way the file happens to store it.
 *
 * ## Why this exists
 *
 * `extractText` returns glyph runs in the order the *file* lists them, which pdf.js documents
 * plainly and which is not reading order. On a two-column CV the sidebar interleaves with the
 * body; on any CV, a heading is just another line. Everything the parser then does — deciding
 * that an all-caps line is a section, that a short line is a job title, that an indented line
 * continues the one above — is an attempt to recover information the PDF already contained
 * and the extraction threw away.
 *
 * It is worth being concrete about the cost of that. On one real CV, the guess "an all-caps
 * line on its own is a heading" matched the city `CASABLANCA` printed under a date, which
 * discarded four of the five jobs beneath it. The same document carries the answer in plain
 * sight: its six section headings are the only text set at 12pt, and the city is 11pt like
 * every other body line. One comparison, no guessing, no lost jobs.
 *
 * ## What comes out
 *
 * Lines, in reading order, each carrying the two facts worth keeping: how large the text was,
 * and how far from the left margin it started. Size identifies headings; x identifies bullets,
 * indentation and which column a line belongs to. `parse.ts` then reads *measurements* where
 * it used to read tea leaves.
 *
 * ## What this does not do
 *
 * It does not attempt full document-layout analysis — no region segmentation, no OCR of
 * embedded images. Those matter for scanned CVs, which this codebase rejects with a specific
 * message rather than half-reading. What is here handles the common case: digitally generated
 * CVs, one or two columns, which is what people actually upload.
 */

export interface LayoutLine {
  text: string;
  /** Font size in PDF units. The largest sizes are the name; the next band is headings. */
  size: number;
  /** Distance from the left edge of the page, in PDF units. */
  x: number;
  /** Distance from the top of the page. Only meaningful within one page. */
  y: number;
  /** 1-based. */
  page: number;
  /** 0 for a single-column page, else which column the line sits in, left to right. */
  column: number;
}

export interface LayoutDocument {
  lines: LayoutLine[];
  pages: number;
  /** True when any page was split into columns — the review screen says so. */
  multiColumn: boolean;
  /** The body text size, used by callers to judge what counts as "larger than normal". */
  bodySize: number;
}

/** Two text runs belong to the same line when their baselines are within this many units. */
const SAME_LINE_TOLERANCE = 3;

/**
 * The gap that separates two columns rather than two words.
 *
 * Generous on purpose. A narrow threshold splits a line at every tab stop — a right-aligned
 * date is a large gap on a single-column page — and a spurious column boundary reorders a
 * document that was fine. Real column gutters on A4 are wide; tab stops are not.
 */
const COLUMN_GAP = 60;

/** Prefix for a right-aligned annotation: a date or place set beside the line above it. */
export const ANNOTATION_MARK = '	';

interface Run {
  text: string;
  x: number;
  endX: number;
  y: number;
  size: number;
}

/**
 * Pulls positioned text runs out of a PDF and rebuilds lines from their coordinates.
 *
 * The transform matrix on each item is `[a, b, c, d, e, f]`, where `a` is the horizontal
 * scale — the font size, for unrotated text — and `e`/`f` are x and y. y counts up from the
 * bottom of the page in PDF space, so it is flipped here; every consumer thinks in reading
 * order and should not have to remember which way is up.
 */
export async function readLayout(pdf: PDFDocumentProxy): Promise<LayoutDocument> {
  const lines: LayoutLine[] = [];
  let multiColumn = false;
  const sizeCounts = new Map<number, number>();

  for (let pageNumber = 1; pageNumber <= pdf.numPages; pageNumber++) {
    const page = await pdf.getPage(pageNumber);
    const content = await page.getTextContent();
    const height = page.getViewport({ scale: 1 }).height;

    const runs: Run[] = [];
    for (const item of content.items) {
      // Whitespace-only runs are kept. pdf.js emits the spaces between words as their own
      // items, and dropping them was what produced `Chefdeprojettransverse`.
      if (!('str' in item) || item.str === '') continue;
      const transform = item.transform as number[];
      const size = Math.abs(transform[0] ?? 0);
      const x = transform[4] ?? 0;
      const y = height - (transform[5] ?? 0);
      runs.push({ text: item.str, x, endX: x + (item.width ?? 0), y, size });
      sizeCounts.set(Math.round(size), (sizeCounts.get(Math.round(size)) ?? 0) + 1);
    }
    if (runs.length === 0) continue;

    const columns = detectColumns(runs);
    if (columns.length > 1) multiColumn = true;

    /*
     * Columns are emitted one after another, each read top to bottom.
     *
     * This is the whole point: a sidebar CV stored as alternating left/right runs becomes
     * the left column entire, then the right column entire — which is how it is read, and
     * how it must be shaped before anything tries to find a section in it.
     */
    for (const [index, bounds] of columns.entries()) {
      const inColumn = runs.filter((run) => run.x >= bounds.from && run.x < bounds.to);
      for (const line of groupIntoLines(inColumn)) {
        lines.push({ ...line, page: pageNumber, column: columns.length > 1 ? index + 1 : 0 });
      }
    }
  }

  return { lines, pages: pdf.numPages, multiColumn, bodySize: modeSize(sizeCounts) };
}

/**
 * Finds column boundaries by looking for a vertical band no text crosses.
 *
 * A gutter is the defining feature of a column layout and the one thing a single-column page
 * never has: text starts at many x positions, but on a two-column page there is a stripe,
 * tens of units wide, running the height of the page that nothing occupies. Sweeping for that
 * stripe is cheap and, unlike clustering the x values, does not invent a split on a page whose
 * text merely happens to be indented in two places.
 */
function detectColumns(runs: Run[]): { from: number; to: number }[] {
  const left = Math.min(...runs.map((run) => run.x));
  const right = Math.max(...runs.map((run) => run.endX));
  if (right - left < COLUMN_GAP * 2) return [{ from: -Infinity, to: Infinity }];

  // Mark every unit of horizontal space that any run covers.
  const covered = new Uint8Array(Math.ceil(right - left) + 1);
  for (const run of runs) {
    const from = Math.max(0, Math.floor(run.x - left));
    const to = Math.min(covered.length - 1, Math.ceil(run.endX - left));
    covered.fill(1, from, to + 1);
  }

  const gutters: number[] = [];
  let runStart = -1;
  for (let i = 0; i < covered.length; i++) {
    if (covered[i] === 0) {
      if (runStart < 0) runStart = i;
    } else {
      if (runStart >= 0 && i - runStart >= COLUMN_GAP) gutters.push(left + (runStart + i) / 2);
      runStart = -1;
    }
  }

  if (gutters.length === 0) return [{ from: -Infinity, to: Infinity }];

  /*
   * More than two gutters means the sweep found whitespace, not structure — a sparse page of
   * short centred lines produces them. Splitting such a page into four columns would scramble
   * a document that read correctly, so an implausible answer is discarded rather than used.
   */
  if (gutters.length > 2) return [{ from: -Infinity, to: Infinity }];

  const edges = [-Infinity, ...gutters, Infinity];
  return edges.slice(0, -1).map((from, index) => ({ from, to: edges[index + 1]! }));
}

/** Groups runs sharing a baseline into one line, left to right. */
function groupIntoLines(runs: Run[]): Omit<LayoutLine, 'page' | 'column'>[] {
  const sorted = [...runs].sort((a, b) => a.y - b.y || a.x - b.x);
  const lines: Omit<LayoutLine, 'page' | 'column'>[] = [];

  let current: Run[] = [];
  const flush = () => {
    if (current.length === 0) return;
    const ordered = [...current].sort((a, b) => a.x - b.x);
    /*
     * Runs are joined with a space only where the PDF left a real gap.
     *
     * Word processors split a single word across runs for kerning, so joining everything with
     * a space produces "trans verse"; joining with nothing produces "Cheddeprojet". The gap
     * between one run's right edge and the next one's left edge is what distinguishes them,
     * and a quarter of the font size is comfortably below a space and above kerning.
     */
    /*
     * A run of text, then a wide gap, then more text is not one line.
     *
     * It is a right-aligned annotation — the date, or the city — set against a title or a
     * bullet. Read as a single line it welds `CASABLANCA` onto the end of an achievement and
     * buries the date inside a sentence. Emitted as separate lines, in left-to-right order,
     * it becomes exactly the title-then-date shape the parser already reads correctly.
     */
    const segments: Run[][] = [[]];
    for (const run of ordered) {
      const previous = segments[segments.length - 1]!.at(-1);
      if (previous && run.x - previous.endX > COLUMN_GAP) segments.push([]);
      segments[segments.length - 1]!.push(run);
    }

    for (const [index, segment] of segments.entries()) {
      const body = segment
        .map((run) => run.text)
        .join('')
        .replace(/\s+/g, ' ')
        .trim();
      if (!body) continue;
      /*
       * Everything after the first segment is an annotation, and is marked with a tab.
       *
       * These are the right-aligned dates and cities that sit beside a title. They are their
       * own lines — welding them back on puts a city inside an achievement — but they are not
       * *entry* lines either, and a parser that cannot tell the difference reads the city
       * above a date as the qualification that date belongs to. That happened: `Casablanca`
       * became a degree awarded by `Licence Génie Logiciel Web et Mobiles`.
       *
       * A tab because it is what the layout means — indented, subordinate to the line above —
       * and because it survives into the model prompt as exactly that, needing no explanation.
       */
      const text = index === 0 ? body : `${ANNOTATION_MARK}${body}`;
      lines.push({
        text,
        // The largest run in the segment: a heading stays a heading when a stray small glyph
        // — a bullet, a trademark sign — shares its baseline.
        size: Math.max(...segment.map((run) => run.size)),
        x: segment[0]!.x,
        y: segment[0]!.y,
      });
    }
    current = [];
  };

  for (const run of sorted) {
    if (current.length > 0 && Math.abs(run.y - current[0]!.y) > SAME_LINE_TOLERANCE) flush();
    current.push(run);
  }
  flush();

  return lines.filter((line) => line.text.length > 0);
}

/** The most common font size on the document — body text, by definition. */
function modeSize(counts: Map<number, number>): number {
  let best = 0;
  let bestCount = -1;
  for (const [size, count] of counts) {
    if (count > bestCount) {
      best = size;
      bestCount = count;
    }
  }
  return best;
}

/**
 * Marks headings with a leading `#`, so the rest of the pipeline sees them as headings.
 *
 * A single `\n`-joined string is what both consumers want — the heuristic parser and the
 * model — and this is where the layout information is spent. A line set larger than the body
 * text, or set in the same size but bold and short, is a heading; everything else is content.
 *
 * The `#` is not decoration. It survives into the model's prompt, where it does the work the
 * layout paper measured: telling the model where sections begin, rather than making it infer
 * boundaries from wording, is most of the gap between raw-text and layout-aware extraction.
 */
export function toMarkedText(document: LayoutDocument): string {
  const sizes = headingSizes(document);
  const margin = leftMargin(document);

  return document.lines
    .map((line) => {
      if (sizes.has(Math.round(line.size)) && line.text.length <= 60) return `# ${line.text}`;

      /*
       * A line sitting alone, far to the right of the margin, is an annotation too.
       *
       * The mark applied while grouping only catches an annotation that *shares* a baseline
       * with the line it belongs to. A CV that prints the city on its own line below the date
       * produces a line with nothing beside it — indistinguishable from an entry heading by
       * its text, obvious by its position. `Casablanca` at x=500, on a document whose margin
       * is x=45, was being read as the qualification that the date below it belonged to.
       *
       * Skipped on a genuinely multi-column page: there, far right means the second column,
       * which the column split has already put in the right order.
       */
      const indented = line.column === 0 && line.x > margin + COLUMN_GAP;
      if (indented && !line.text.startsWith(ANNOTATION_MARK)) {
        return `${ANNOTATION_MARK}${line.text}`;
      }
      return line.text;
    })
    .join('\n');
}

/** Where the body text starts: the most common left edge in the document. */
function leftMargin(document: LayoutDocument): number {
  const counts = new Map<number, number>();
  for (const line of document.lines) {
    const x = Math.round(line.x / 5) * 5;
    counts.set(x, (counts.get(x) ?? 0) + 1);
  }
  let best = 0;
  let bestCount = -1;
  for (const [x, count] of counts) {
    if (count > bestCount) {
      best = x;
      bestCount = count;
    }
  }
  return best;
}

/**
 * Which font sizes are section headings — as opposed to the name at the top.
 *
 * Bigger-than-body is not enough. A CV sets the person's name largest of all and their job
 * title next, and marking those as headings cost the entire contact block: the name became a
 * section, the title became a section, and the header block the contact parser reads was
 * empty. No name, no email, no phone, on a document where all three were plainly present.
 *
 * What separates the two is repetition. Section headings recur — a CV has four, six, eight of
 * them, set identically. The name appears once and the title once. So a size counts as a
 * heading size when it is larger than the body text *and* used more than once, which leaves
 * the singular large lines at the top to fall through into the header, where they belong.
 */
function headingSizes(document: LayoutDocument): Set<number> {
  const counts = new Map<number, number>();
  for (const line of document.lines) {
    const size = Math.round(line.size);
    if (size > document.bodySize) counts.set(size, (counts.get(size) ?? 0) + 1);
  }
  return new Set([...counts.entries()].filter(([, count]) => count >= 2).map(([size]) => size));
}
