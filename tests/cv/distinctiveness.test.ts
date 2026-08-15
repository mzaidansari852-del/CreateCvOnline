import { readdirSync } from 'node:fs';
import path from 'node:path';

import sharp from 'sharp';
import { beforeAll, describe, expect, it } from 'vitest';

import { TEMPLATES } from '@/lib/cv/template-registry';

/**
 * Does the catalogue actually look like 56 designs?
 *
 * Every other test in this directory checks a property of one template. This one checks
 * the property the product is sold on, which only exists between templates: if a shopper
 * sees two of these thumbnails side by side, do they read as two products?
 *
 * It measures the committed preview images — the same files the gallery serves — because
 * the question is about what is on the screen, not what is in the source. Two templates
 * with entirely different component code can render the same page, and eleven pairs did.
 *
 * Two signals, because either alone is fooled:
 *
 *  - `ink` is the downscaled greyscale page. It catches typeface, weight, density, rules
 *    and colour — everything that changes when the type changes.
 *  - `layout` is the row and column ink profile. It catches *where the blocks are*, which
 *    survives a font change, and so stops a new typeface from scoring as a new design.
 *
 * Distance is the mean of the two: 0 is identical, and the catalogue currently averages
 * 0.78 over all 1,540 pairs.
 */

const PREVIEWS = path.join(process.cwd(), 'public', 'previews');
const WIDTH = 64;
const HEIGHT = 90;

type Signature = { ink: Float64Array; layout: Float64Array };

function normalise(values: number[]): Float64Array {
  const mean = values.reduce((total, value) => total + value, 0) / values.length;
  const variance = values.reduce((total, value) => total + (value - mean) ** 2, 0) / values.length;
  const deviation = Math.sqrt(variance) + 1e-9;
  return Float64Array.from(values, (value) => (value - mean) / deviation);
}

async function signature(slug: string): Promise<Signature> {
  const raw = await sharp(path.join(PREVIEWS, `${slug}-card.webp`))
    .greyscale()
    .resize(WIDTH, HEIGHT, { fit: 'fill' })
    .raw()
    .toBuffer();

  const ink: number[] = [];
  for (const byte of raw) ink.push(1 - byte / 255); // ink = 1, paper = 0

  const rows: number[] = [];
  for (let y = 0; y < HEIGHT; y++) {
    let total = 0;
    for (let x = 0; x < WIDTH; x++) total += ink[y * WIDTH + x]!;
    rows.push(total / WIDTH);
  }
  const columns: number[] = [];
  for (let x = 0; x < WIDTH; x++) {
    let total = 0;
    for (let y = 0; y < HEIGHT; y++) total += ink[y * WIDTH + x]!;
    columns.push(total / HEIGHT);
  }

  // Rows and columns are normalised separately, then joined. Normalising the joined
  // vector would let whichever axis happens to vary more drown out the other, and for a
  // two-column page that is always the columns — which is the axis the layout signal is
  // least able to tell templates apart on.
  return {
    ink: normalise(ink),
    layout: Float64Array.from([...normalise(rows), ...normalise(columns)]),
  };
}

function dot(a: Float64Array, b: Float64Array): number {
  let total = 0;
  for (let i = 0; i < a.length; i++) total += a[i]! * b[i]!;
  return total / a.length;
}

const distance = (a: Signature, b: Signature) =>
  (1 - dot(a.ink, b.ink) + (1 - dot(a.layout, b.layout))) / 2;

describe('catalogue distinctiveness', () => {
  const slugs = TEMPLATES.map((template) => template.slug);
  let pairs: { a: string; b: string; d: number }[] = [];

  beforeAll(async () => {
    const present = new Set(
      readdirSync(PREVIEWS)
        .filter((file) => file.endsWith('-card.webp'))
        .map((file) => file.replace('-card.webp', '')),
    );
    // Every template must have a card; a missing one would silently shrink the comparison.
    expect(slugs.filter((slug) => !present.has(slug))).toEqual([]);

    const signatures = new Map<string, Signature>();
    for (const slug of slugs) signatures.set(slug, await signature(slug));

    for (let i = 0; i < slugs.length; i++) {
      for (let j = i + 1; j < slugs.length; j++) {
        const a = slugs[i]!;
        const b = slugs[j]!;
        pairs.push({ a, b, d: distance(signatures.get(a)!, signatures.get(b)!) });
      }
    }
    pairs = pairs.sort((x, y) => x.d - y.d);
  }, 120_000);

  it('compares every pair', () => {
    const n = slugs.length;
    expect(pairs).toHaveLength((n * (n - 1)) / 2);
  });

  it('has no two templates rendering effectively the same page', () => {
    const worst = pairs[0]!;
    expect(worst.d, `${worst.a} ↔ ${worst.b}`).toBeGreaterThan(0.15);
  });

  it('does not grow the cluster of near-identical pairs', () => {
    /*
     * Five pairs sit under 0.25, and they are one structural cluster: Banking, Modern
     * Corporate, Cybersecurity, Art Director and Content Creator are two-column layouts
     * whose blocks land in the same places. Type cannot fix that — it is what audit item
     * 4.4 means by "differentiate, or merge and retire", and it is still open.
     *
     * The number is pinned rather than fixed so that the open work stays visible and, more
     * to the point, so that a future change cannot quietly add a sixth. Lower it when a
     * pair is genuinely separated; never raise it.
     */
    const close = pairs.filter((pair) => pair.d < 0.25);
    expect(close.map((pair) => `${pair.a} ↔ ${pair.b}`).sort()).toHaveLength(5);
  });

  it('keeps the pairs the audit named apart', () => {
    // Section 1.1's list. Each of these was close enough to be "two products, one design";
    // the typeface and metric work in Phase 4 separated them, and this is what holds.
    const named: [string, string][] = [
      ['modern-elegant', 'elegant-serif-cv'],
      ['hr-cv', 'government-cv'],
      ['modern-ats', 'software-engineer-cv'],
      ['modern-ats', 'ats-simple-cv'],
      ['software-engineer-cv', 'ats-simple-cv'],
      ['simple-classic-cv', 'tech-minimal-cv'],
      ['tech-minimal-cv', 'entry-level-resume'],
      ['ats-cv', 'ats-resume'],
    ];
    for (const [a, b] of named) {
      const pair = pairs.find(
        (candidate) =>
          (candidate.a === a && candidate.b === b) || (candidate.a === b && candidate.b === a),
      );
      expect(pair, `${a} ↔ ${b} not found`).toBeTruthy();
      expect(pair!.d, `${a} ↔ ${b}`).toBeGreaterThan(0.45);
    }
  });

  it('is separated on average, not just at the extremes', () => {
    const mean = pairs.reduce((total, pair) => total + pair.d, 0) / pairs.length;
    expect(mean).toBeGreaterThan(0.74);
  });
});
