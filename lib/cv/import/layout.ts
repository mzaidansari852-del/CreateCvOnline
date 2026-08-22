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

/**
 * The narrowest vertical band that counts as a column gutter.
 *
 * Narrower than `COLUMN_GAP`, and for a different reason. That one asks "is this whitespace
 * on a line wide enough to be a tab stop rather than a space", where over-splitting costs a
 * broken sentence. This one asks "does this page have two columns", where *under*-splitting
 * costs the whole document: a sidebar CV read as one column comes out with the skills list
 * interleaved line by line through the work history.
 *
 * 28 because a real gutter on A4 is at least a few characters wide at any body size, and
 * because a page whose text is genuinely full-width has no empty stripe at all — a paragraph
 * spanning the measure covers every column, so the sweep finds nothing and nothing is split.
 * The CV that forced this had a 50pt gutter and was being read as one column at 60.
 */
const GUTTER_MIN = 28;

/**
 * Prefix for an entry title — a job, a degree — set larger than the body text.
 *
 * Section headings say where a section begins; this says where an *entry* begins, which is
 * the other thing a CV's typography encodes and the other thing the parser was guessing at.
 * On a template that sets job titles at 8.3pt against a 7.9pt body, the guess picked up the
 * trailing sentence of the previous job's description instead, and three roles in a row came
 * back named after somebody else's achievements.
 *
 * `##` because it is a heading one level down, which is what it is — and because the model
 * reads it that way too, without a line of prompt explaining it.
 */
export const ENTRY_MARK = '## ';

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
      sizeCounts.set(sizeKey(size), (sizeCounts.get(sizeKey(size)) ?? 0) + 1);
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
    /*
     * The column with the largest text on the page is read first.
     *
     * Not left-to-right. A CV's name is the biggest thing on it, and on a sidebar template
     * the name is in the *main* column while the sidebar sits to its left — so reading
     * left-to-right put the entire skills list, headings and all, ahead of the name. The
     * contact block is whatever precedes the first heading, so it came out empty and the
     * name was swallowed by the last section of the sidebar.
     *
     * Ordering by size restores the order a person reads in, because the thing set largest
     * is the thing meant to be read first. Columns of equal weight keep their left-to-right
     * order, which is what a two-column body wants.
     */
    const ordered = columns
      .map((bounds, index) => {
        const inColumn = runs.filter((run) => run.x >= bounds.from && run.x < bounds.to);
        const largest = inColumn.reduce((max, run) => Math.max(max, run.size), 0);
        return { index, inColumn, largest };
      })
      .sort((a, b) => b.largest - a.largest || a.index - b.index);

    for (const column of ordered) {
      for (const line of groupIntoLines(column.inColumn)) {
        lines.push({
          ...line,
          page: pageNumber,
          column: columns.length > 1 ? column.index + 1 : 0,
        });
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
  if (right - left < GUTTER_MIN * 2) return [{ from: -Infinity, to: Infinity }];

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
      if (runStart >= 0 && i - runStart >= GUTTER_MIN) gutters.push(left + (runStart + i) / 2);
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

/**
 * Font sizes, to one decimal place.
 *
 * Rounding to whole points erased the only thing that identified headings on a CV set at
 * 7.9pt with 8.3pt headings: both became `8`, so nothing was larger than the body and no
 * heading was found in the entire document. Typographic scales are not integers, and a CV
 * exported at a smaller size has correspondingly smaller steps between its levels.
 */
function sizeKey(size: number): number {
  return Math.round(size * 10) / 10;
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
export function toMarkedText(
  document: LayoutDocument,
  isKnownHeading: (text: string) => boolean = () => false,
): string {
  const sizes = headingSizes(document, isKnownHeading);
  const margins = leftMargins(document);

  return document.lines
    .map((line) => {
      /*
       * Position is decided first, and it overrules size.
       *
       * A line set far to the right of its column's margin is an annotation — the date or
       * the city printed beside an entry — whatever size it happens to be. Testing size
       * first was wrong in a way that only showed on a template setting those dates at
       * heading size: each one returned early as a section, so a CV with five jobs came back
       * with five sections named after their own dates and its history in pieces.
       *
       * The margin is measured per column, so the main column of a sidebar layout is not
       * judged against the sidebar's left edge — which would make its every line look
       * indented, and did.
       */
      if (line.text.startsWith(ANNOTATION_MARK)) return line.text;

      const indented = line.x > (margins.get(line.column) ?? 0) + COLUMN_GAP;
      if (indented) return `${ANNOTATION_MARK}${line.text}`;

      if (sizes.has(sizeKey(line.size)) && line.text.length <= 60) return `# ${line.text}`;

      /*
       * Larger than the body, but not one of the confirmed heading sizes: an entry title.
       *
       * Only where the document actually distinguishes them. Plenty of templates set job
       * titles at body size and lean on weight instead — those produce no marks here, and
       * the parser falls back to the rules it used before any of this existed.
       */
      if (line.size > document.bodySize + 0.15 && line.text.length <= 120) {
        return `${ENTRY_MARK}${line.text}`;
      }

      return line.text;
    })
    .join('\n');
}

/**
 * Where the body text starts — measured for each column separately.
 *
 * One margin for the whole page was wrong on a sidebar layout. The sidebar starts at the
 * page margin and the main column starts halfway across, so every line in the main column
 * looked indented; the rule had to be disabled on multi-column pages to avoid marking the
 * entire body as annotations, and disabling it let the right-aligned dates through as
 * ordinary lines. On this site's own export they were set at heading size, so each of them
 * became a section and the work history came back in pieces.
 *
 * Per column, both problems go away: the main column's margin is its own left edge, and a
 * date set against its right edge is as clearly indented there as it would be on a page
 * with one column.
 */
function leftMargins(document: LayoutDocument): Map<number, number> {
  const byColumn = new Map<number, Map<number, number>>();
  for (const line of document.lines) {
    const counts = byColumn.get(line.column) ?? new Map<number, number>();
    const x = Math.round(line.x / 5) * 5;
    counts.set(x, (counts.get(x) ?? 0) + 1);
    byColumn.set(line.column, counts);
  }

  const margins = new Map<number, number>();
  for (const [column, counts] of byColumn) {
    let best = 0;
    let bestCount = -1;
    for (const [x, count] of counts) {
      if (count > bestCount) {
        best = x;
        bestCount = count;
      }
    }
    margins.set(column, best);
  }
  return margins;
}

/**
 * Which font size is the section headings.
 *
 * ## Why "bigger than the body" is not the rule
 *
 * It was, and it broke on this site's own export. That template sets section headings at
 * 7.2pt against a 7.9pt body — *smaller* — in capitals with wide letter-spacing, while job
 * titles are 8.3pt. Judging by size alone found the job titles and missed every section, so
 * the document came back as one long run of entries with no sections at all.
 *
 * Both are real conventions. Some templates shout their headings by making them larger,
 * others by making them small and spaced. What almost none of them do is set an *entry
 * title* in capitals — a person's job title and their degree are written the way names are.
 * So the size only picks out candidates, and other evidence decides between them.
 */
function headingSizes(
  document: LayoutDocument,
  isKnownHeading: (text: string) => boolean,
): Set<number> {
  const bands = new Map<number, string[]>();
  for (const line of document.lines) {
    const size = sizeKey(line.size);
    if (Math.abs(size - document.bodySize) < 0.15) continue;
    if (line.text.length > 60) continue;
    /*
     * An annotation is never a heading.
     *
     * This site's own template sets the dates beside each job at the same size as the
     * section headings, so the band held `WORK EXPERIENCE`, `EDUCATION` and `Nov 2024 –
     * Present` together. Marking all of them turned every date into a section: the work
     * history came back as one entry and five empty sections named after their own dates.
     *
     * The mark already records the distinction — an annotation sits beside another line,
     * a section heading stands alone above its content. Size cannot tell them apart;
     * position already has.
     */
    if (line.text.startsWith(ANNOTATION_MARK)) continue;
    bands.set(size, [...(bands.get(size) ?? []), line.text]);
  }

  const candidates = [...bands.entries()].filter(([, lines]) => lines.length >= 2);
  if (candidates.length === 0) return new Set();

  const scored = candidates.map(([size, lines]) => ({
    size,
    known: lines.filter(isKnownHeading).length,
    caps: lines.filter(isShouted).length / lines.length,
  }));

  /*
   * Evidence first, appearance second — and every confirmed band, not just the best one.
   *
   * A band containing `Work Experience`, `Education` and `Compétences` is the headings, and
   * no argument from font size outweighs that. Two matches is the threshold because one can
   * be a coincidence — a job at a company called `Education First`.
   *
   * More than one band can qualify: a sidebar template sets its sidebar headings smaller
   * than those in the main column, because they sit in a narrower measure. Taking only the
   * strongest band found `SKILLS` and `LANGUAGES` and missed `WORK EXPERIENCE`, which is
   * worse than finding none — the whole work history lands inside the section before it.
   *
   * Once a band is confirmed, every line in it is marked, including ones the vocabulary
   * missed. That is the point of combining the two: on one CV the heading `EXPERIENCE
   * PROFESIONNELLE` was spelled with an S missing and matched nothing, but it shared a size
   * with five headings that did match, so it was marked anyway.
   */
  const confirmed = scored.filter((band) => band.known >= 2);
  if (confirmed.length > 0) return new Set(confirmed.map((band) => band.size));

  /*
   * Nothing recognised — a CV in a language this site does not speak, or one using headings
   * nobody else uses. Fall back to appearance: capitals if any band shouts, otherwise the
   * smallest band above the body text.
   */
  const byCaps = [...scored].sort((a, b) => b.caps - a.caps || b.size - a.size)[0]!;
  if (byCaps.caps >= 0.6) return new Set([byCaps.size]);

  const above = scored.filter((band) => band.size > document.bodySize).map((band) => band.size);
  return above.length > 0 ? new Set([Math.min(...above)]) : new Set();
}

/** Written in capitals, the way section headings are and job titles are not. */
function isShouted(text: string): boolean {
  if (/\p{Ll}/u.test(text)) return false;
  return (text.match(/\p{Lu}/gu) ?? []).length >= 2;
}
