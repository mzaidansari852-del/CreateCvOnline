import { readdirSync, readFileSync } from 'node:fs';
import path from 'node:path';

import { describe, expect, it } from 'vitest';

import { CV_FONTS, FONT_WEIGHTS, bodyWeight, headingWeight, weightOn } from '@/lib/cv/format';
import { TEMPLATES } from '@/lib/cv/template-registry';
import type { FontKey } from '@/types/cv';

const TEMPLATE_ROOT = path.join(process.cwd(), 'components', 'cv', 'templates');

function templateSources(): { slug: string; file: string; source: string }[] {
  const out: { slug: string; file: string; source: string }[] = [];
  for (const category of readdirSync(TEMPLATE_ROOT)) {
    for (const file of readdirSync(path.join(TEMPLATE_ROOT, category))) {
      const full = path.join(TEMPLATE_ROOT, category, file);
      const source = readFileSync(full, 'utf8');
      const slug = source.match(/slug: '([^']+)'/)?.[1];
      if (slug) out.push({ slug, file: `${category}/${file}`, source });
    }
  }
  return out;
}

/** The masthead: the first `fontSize` and `fontWeight` inside the first `<h1>`. */
function masthead(source: string) {
  const open = source.indexOf('<h1');
  const close = source.indexOf('</h1>', open);
  const head = source.slice(open, close);
  return {
    em: Number(head.match(/fontSize: '([\d.]+)em'/)?.[1]),
    weight: Number(head.match(/fontWeight: headingWeight\(c, (\d{3})\)/)?.[1]),
    uppercase: /textTransform: 'uppercase'/.test(head) || /headingTransform\(c\)/.test(head),
  };
}

describe('weightOn', () => {
  it('never returns a weight the face cannot draw', () => {
    for (const font of CV_FONTS) {
      for (let desired = 100; desired <= 900; desired += 100) {
        expect(FONT_WEIGHTS[font.key], `${font.key} @ ${desired}`).toContain(
          weightOn(font.key, desired),
        );
      }
    }
  });

  it('leaves a weight the face has exactly alone', () => {
    for (const font of CV_FONTS) {
      for (const weight of FONT_WEIGHTS[font.key]) {
        expect(weightOn(font.key, weight), `${font.key} @ ${weight}`).toBe(weight);
      }
    }
  });

  it('resolves ties toward the canonical bold', () => {
    // A heading asking for 550 on a face with only 400 and 700 wanted emphasis.
    expect(weightOn('arial', 550)).toBe(700);
    // Lato is the awkward one: it has 700 and 900 and no 800. Black overshoots by more
    // than Bold undershoots, so the tie has to break downward here and upward above.
    expect(weightOn('lato', 800)).toBe(700);
    // The case this whole resolver was written for: nothing in the picker ships an 800.
    for (const font of CV_FONTS) {
      expect(FONT_WEIGHTS[font.key], font.key).toContain(weightOn(font.key, 800));
    }
  });

  it('reads the real weight list off each googleSpec', () => {
    expect(FONT_WEIGHTS.inter).toEqual([300, 400, 500, 600, 700]);
    expect(FONT_WEIGHTS.roboto).toEqual([300, 400, 500, 700]); // no 600
    expect(FONT_WEIGHTS['libre-baskerville']).toEqual([400, 700]);
    // The variable-axis spec: `Source+Serif+4:opsz,wght@8..60,300;…` — the weight is the
    // last number in each tuple, not the first, which is the optical size.
    expect(FONT_WEIGHTS['source-serif']).not.toContain(8);
    expect(FONT_WEIGHTS['source-serif']).toContain(700);
    // System faces: regular and bold are what can be relied on locally.
    for (const key of ['arial', 'georgia', 'times'] as FontKey[]) {
      expect(FONT_WEIGHTS[key]).toEqual([400, 700]);
    }
  });

  it('is what the two helpers use', () => {
    expect(headingWeight({ headingFont: 'roboto' }, 600)).toBe(weightOn('roboto', 600));
    expect(bodyWeight({ bodyFont: 'libre-baskerville' }, 800)).toBe(700);
  });
});

describe('no faux weights', () => {
  it('no template hardcodes a numeric fontWeight', () => {
    // The defect this replaced: 29 uses of `fontWeight: 800` across 26 templates, on faces
    // where 800 does not exist. The browser synthesised it by smearing the 700 outline,
    // which is why 700 and 800 were indistinguishable on the page. A literal here means
    // somebody has gone back to asking for a weight without checking it can be drawn.
    const offenders = templateSources()
      .filter(({ source }) => /fontWeight: \d{3}\b/.test(source))
      .map(({ file }) => file);
    expect(offenders).toEqual([]);
  });

  it('nor do the shared parts', () => {
    const parts = readFileSync(path.join(process.cwd(), 'components', 'cv', 'parts.tsx'), 'utf8');
    const literals = parts.match(/fontWeight: \d{3}\b/g) ?? [];
    expect(literals).toEqual([]);
  });
});

describe('name treatment', () => {
  const sheets = templateSources().map(({ slug, source }) => ({ slug, ...masthead(source) }));

  it('reads a size and a resolved weight off every masthead', () => {
    for (const sheet of sheets) {
      expect(Number.isFinite(sheet.em), `${sheet.slug} size`).toBe(true);
      expect(Number.isFinite(sheet.weight), `${sheet.slug} weight`).toBe(true);
    }
    expect(sheets).toHaveLength(56);
  });

  it('is not the same masthead on half the catalogue', () => {
    // The audit measured 34 of 56 sitting between 1.9em and 2.35em and 34 of 56 at weight
    // 700 — "the same masthead on more than half the catalogue". Both are the assertion.
    const inBand = sheets.filter((sheet) => sheet.em >= 1.9 && sheet.em <= 2.35);
    const at700 = sheets.filter((sheet) => sheet.weight === 700);
    expect(inBand.length).toBeLessThanOrEqual(24);
    expect(at700.length).toBeLessThanOrEqual(24);
  });

  it('uses the full range a masthead can occupy', () => {
    const ems = sheets.map((sheet) => sheet.em);
    expect(Math.min(...ems)).toBeLessThanOrEqual(1.8);
    expect(Math.max(...ems)).toBeGreaterThanOrEqual(3.2);
    expect(new Set(ems).size).toBeGreaterThanOrEqual(20);
    expect(new Set(sheets.map((sheet) => sheet.weight)).size).toBeGreaterThanOrEqual(4);
  });

  it('sets the name smaller as the weight goes up, not heavier', () => {
    // Optical sizing: a face wants less weight as it gets bigger. The values were derived
    // from that rule, so it should still be visible in them.
    const byWeight = new Map<number, number[]>();
    for (const sheet of sheets) {
      byWeight.set(sheet.weight, [...(byWeight.get(sheet.weight) ?? []), sheet.em]);
    }
    const mean = (xs: number[]) => xs.reduce((total, x) => total + x, 0) / xs.length;
    const weights = [...byWeight.keys()].sort((a, b) => a - b);
    for (let i = 1; i < weights.length; i++) {
      expect(
        mean(byWeight.get(weights[i]!)!),
        `mean size at weight ${weights[i]} vs ${weights[i - 1]}`,
      ).toBeLessThan(mean(byWeight.get(weights[i - 1]!)!));
    }
  });

  it('scales the masthead to the kind of face it is set in', () => {
    // A display serif was cut to be set large; Arial at 3.4em is a shout, not a design.
    const kindOf = new Map(CV_FONTS.map((font) => [font.key, font.kind]));
    const DISPLAY: FontKey[] = ['playfair', 'garamond', 'libre-baskerville'];
    const bySlug = new Map(sheets.map((sheet) => [sheet.slug, sheet]));
    const mean = (xs: number[]) => xs.reduce((total, x) => total + x, 0) / xs.length;

    const display = TEMPLATES.filter((template) => DISPLAY.includes(template.fonts.heading));
    const system = TEMPLATES.filter(
      (template) =>
        (['arial', 'georgia', 'times'] as FontKey[]).includes(template.fonts.heading) &&
        kindOf.get(template.fonts.heading),
    );

    expect(display.length).toBeGreaterThan(0);
    expect(system.length).toBeGreaterThan(0);
    expect(mean(display.map((template) => bySlug.get(template.slug)!.em))).toBeGreaterThan(
      mean(system.map((template) => bySlug.get(template.slug)!.em)),
    );
  });
});
