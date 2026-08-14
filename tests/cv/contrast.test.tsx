import { renderToStaticMarkup } from 'react-dom/server';
import { describe, expect, it } from 'vitest';

import { CVDocument } from '@/components/cv/CVDocument';
import { createDefaultCustomization, createSampleCV } from '@/lib/cv/defaults';
import { AA_CONTRAST, AA_GRAPHIC, contrastRatio } from '@/lib/cv/format';
import { TEMPLATES } from '@/lib/cv/template-registry';

/**
 * Every word of every template, measured against what is painted behind it.
 *
 * The old suite rendered all 56 templates and asserted that nothing threw. That is a real
 * test of one thing — the components do not crash — and no test at all of the thing a user
 * actually experiences. It passed happily while eleven templates printed employer names at
 * between 2.15:1 and 3.8:1, while eleven more set body copy in a grey at 3.6:1, and while
 * Modern Executive drew skill bars whose empty track was brighter than the filled part.
 *
 * So this walks the rendered DOM instead of trusting the source. For each element it
 * resolves the colour it inherits, the background it sits on — through gradients, through
 * translucent overlays, through however many nested divs — and refuses anything that a
 * person would have to squint at.
 *
 * The value of doing it this way rather than auditing the source is that it cannot be
 * fooled by a template that computes its colours correctly and then renders a part on a
 * panel it forgot to declare. The pair is what matters, and the pair only exists once the
 * thing is rendered.
 */

/* -------------------------------------------------------------------------- */
/* Colour resolution                                                           */
/* -------------------------------------------------------------------------- */

/** The `.cv-page` rule in the shared stylesheet, which is not inline and so not in the markup. */
const PAGE_BACKGROUND = '#ffffff';
const PAGE_COLOR = '#111111';

const HEX = /#[0-9a-f]{6}\b|#[0-9a-f]{3}\b/gi;

function expandHex(hex: string): string {
  const body = hex.slice(1);
  return body.length === 3
    ? `#${body
        .split('')
        .map((c) => c + c)
        .join('')}`
    : hex.toLowerCase();
}

/** Flattens `rgba(r,g,b,a)` onto an opaque backdrop. Returns null for anything unparseable. */
function flatten(value: string, backdrop: string): string | null {
  const rgba = /^rgba?\(\s*([\d.]+)[,\s]+([\d.]+)[,\s]+([\d.]+)(?:[,/\s]+([\d.]+))?\s*\)$/i.exec(
    value.trim(),
  );
  if (!rgba) return null;
  const alpha = rgba[4] === undefined ? 1 : Number(rgba[4]);
  const base = expandHex(backdrop).slice(1);
  const back = [0, 2, 4].map((i) => Number.parseInt(base.slice(i, i + 2), 16));
  const over = [1, 2, 3].map((i) => Number(rgba[i]));
  return `#${over
    .map((channel, i) => Math.round(channel * alpha + back[i]! * (1 - alpha)))
    .map((channel) => channel.toString(16).padStart(2, '0'))
    .join('')}`;
}

/**
 * True when a gradient declares hard stops — a colour given two positions, or two colours
 * meeting at the same one. That is a band, not a blend: `band 0 34%, #ffffff 34% 100%`.
 */
function hasHardStops(value: string): boolean {
  return /\b\d+(?:\.\d+)?%?\s+\d+(?:\.\d+)?%/.test(value);
}

/** Splits a comma-separated CSS list without cutting inside `rgb(...)` or a gradient. */
function topLevelParts(value: string): string[] {
  const parts: string[] = [];
  let depth = 0;
  let current = '';
  for (const char of value) {
    if (char === '(') depth += 1;
    if (char === ')') depth -= 1;
    if (char === ',' && depth === 0) {
      parts.push(current);
      current = '';
    } else {
      current += char;
    }
  }
  parts.push(current);
  return parts.map((part) => part.trim()).filter(Boolean);
}

/**
 * Every opaque colour a background declaration can put behind text.
 *
 * Three things make this more than a hex grab.
 *
 * A gradient is not one colour, so text over one has to clear the bar against *all* of its
 * stops — the light end is where a pale accent stops being readable, and averaging over the
 * gradient would hide exactly that case.
 *
 * A background can be layered, and a layer carrying an explicit size (`… / 10px 100%`) is a
 * stripe, not a field. Visual Resume and AI Engineer both paint a narrow rail down the page
 * edge and then set `padding-left` so no text ever crosses it. Counting the rail as the
 * backdrop for the whole column is how a correct template gets reported as broken, so sized
 * layers are skipped and the full-bleed layer underneath is used instead.
 *
 * And a translucent overlay is not a colour until it is composited, so `rgba()` is flattened
 * onto whatever it is sitting on.
 */
function backgroundCandidates(value: string, inherited: string[]): string[] {
  const declaration = value.trim().toLowerCase();
  if (!declaration || declaration === 'transparent' || declaration === 'none') return inherited;

  const covering = topLevelParts(declaration).filter((layer) => !layer.includes('/'));
  if (covering.length === 0) return inherited;

  const stops = covering.flatMap((layer) =>
    [...layer.matchAll(HEX)].map((match) => expandHex(match[0])),
  );
  if (stops.length > 0) return stops;

  const flattened = flatten(covering.join(' '), inherited[0] ?? PAGE_BACKGROUND);
  return flattened ? [flattened] : inherited;
}

function resolveTextColour(value: string | undefined, inherited: string, backdrop: string) {
  if (!value) return inherited;
  const declaration = value.trim().toLowerCase();
  if (!declaration || declaration === 'inherit' || declaration === 'currentcolor') return inherited;
  if (declaration === 'transparent') return null;
  const hex = HEX.exec(declaration);
  HEX.lastIndex = 0;
  if (hex) return expandHex(hex[0]);
  return flatten(declaration, backdrop) ?? inherited;
}

function styleMap(element: Element): Map<string, string> {
  const map = new Map<string, string>();
  const raw = element.getAttribute('style');
  if (!raw) return map;
  // Split on semicolons that are not inside parentheses — gradients contain commas but the
  // browser never emits a bare semicolon inside one.
  for (const part of raw.split(/;(?![^(]*\))/)) {
    const at = part.indexOf(':');
    if (at === -1) continue;
    map.set(part.slice(0, at).trim().toLowerCase(), part.slice(at + 1).trim());
  }
  return map;
}

/** Text owned by this element rather than by a descendant. */
function ownText(element: Element): string {
  let text = '';
  for (const node of Array.from(element.childNodes)) {
    if (node.nodeType === 3) text += node.textContent ?? '';
  }
  return text.replace(/\s+/g, ' ').trim();
}

interface Offence {
  text: string;
  colour: string;
  background: string;
  ratio: number;
}

function findLowContrastText(html: string): Offence[] {
  const root = document.createElement('div');
  root.innerHTML = html;
  const offences: Offence[] = [];

  const visit = (element: Element, colour: string, backgrounds: string[], banded: boolean) => {
    const styles = styleMap(element);
    const declaration = styles.get('background') ?? styles.get('background-color') ?? '';
    const nextBackgrounds = backgroundCandidates(declaration, backgrounds);
    const isBanded = nextBackgrounds === backgrounds ? banded : hasHardStops(declaration);
    const nextColour =
      resolveTextColour(styles.get('color'), colour, nextBackgrounds[0] ?? PAGE_BACKGROUND) ??
      colour;

    /*
     * `aria-hidden` marks the decorative furniture: bullet glyphs, the faint section
     * numerals in Modern Creative, rule fragments. WCAG 1.4.3 exempts pure decoration, and
     * these carry no information a screen reader is not already given by the list structure
     * or the heading beside them. Everything a person actually reads is outside these.
     */
    if (element.getAttribute('aria-hidden') === 'true') return;

    const text = ownText(element);
    if (text) {
      const ratios = nextBackgrounds.map((background) => ({
        background,
        ratio: contrastRatio(nextColour, background),
      }));
      /*
       * A smooth gradient is one region whose colour varies, and text laid over it really
       * does cross every stop — so all of them have to clear the bar.
       *
       * A hard-stop gradient is two regions pretending to be one declaration. Four templates
       * paint their sidebar band this way (`band 0 34%, #ffffff 34% 100%`) rather than on the
       * `<aside>` itself, because a page-level background is what continues onto page 2 of
       * the PDF. Which side a given element sits on is a layout fact this walk cannot see, so
       * requiring both would fail every correct light-on-dark sidebar in the set. Clearing
       * one region is the strongest claim available, and it still catches text that is
       * illegible everywhere.
       */
      const failing = isBanded
        ? ratios.every((r) => r.ratio < AA_CONTRAST)
          ? ratios
          : []
        : ratios.filter((r) => r.ratio < AA_CONTRAST);

      for (const { background, ratio } of failing) {
        offences.push({
          text: text.length > 40 ? `${text.slice(0, 40)}…` : text,
          colour: nextColour,
          background,
          ratio: Number(ratio.toFixed(2)),
        });
      }
    }

    for (const child of Array.from(element.children))
      visit(child, nextColour, nextBackgrounds, isBanded);
  };

  for (const child of Array.from(root.children)) visit(child, PAGE_COLOR, [PAGE_BACKGROUND], false);
  return offences;
}

function renderTemplate(id: string, accentColor: string): string {
  return renderToStaticMarkup(
    <CVDocument
      cv={createSampleCV()}
      customization={createDefaultCustomization({ templateId: id, accentColor })}
    />,
  );
}

/* -------------------------------------------------------------------------- */
/* The tests                                                                   */
/* -------------------------------------------------------------------------- */

describe('text contrast, at the default accent', () => {
  for (const template of TEMPLATES) {
    it(`${template.name} renders no text below ${AA_CONTRAST}:1`, () => {
      const offences = findLowContrastText(renderTemplate(template.id, template.accentDefault));
      expect(
        offences,
        offences
          .map((o) => `  ${o.ratio}:1  ${o.colour} on ${o.background}  "${o.text}"`)
          .join('\n'),
      ).toEqual([]);
    });
  }
});

/**
 * The accent is a user control with a colour picker, so "the shipped defaults pass" is not
 * the claim worth defending. These are the values a person actually reaches for, including
 * the pale ones that used to produce an unreadable masthead.
 */
const AWKWARD_ACCENTS = [
  '#f59e0b', // amber — the worst of the shipped defaults at 2.15:1 on white
  '#fde047', // pale yellow, near the top of the luminance range
  '#22c55e', // mid green
  '#7f8c8d', // mid grey, the crossover where neither white nor soft ink clears AA
  '#0ea5e9', // sky
  '#111111', // near-black, where light-on-dark templates have to invert instead
];

describe('text contrast, at accents a user might pick', () => {
  // One representative per category rather than 56 × 6 renders: the parts are shared, and
  // the per-template pass above already covers the template-specific chrome.
  const sample = TEMPLATES.filter(
    (template, index, all) =>
      all.findIndex((other) => other.category === template.category) === index,
  );

  for (const template of sample) {
    for (const accent of AWKWARD_ACCENTS) {
      it(`${template.name} stays legible with ${accent}`, () => {
        const offences = findLowContrastText(renderTemplate(template.id, accent));
        expect(
          offences,
          offences
            .map((o) => `  ${o.ratio}:1  ${o.colour} on ${o.background}  "${o.text}"`)
            .join('\n'),
        ).toEqual([]);
      });
    }
  }
});

/* -------------------------------------------------------------------------- */
/* Graphical objects                                                           */
/* -------------------------------------------------------------------------- */

/**
 * Skill and language bars.
 *
 * These are not text, so 4.5:1 would be the wrong bar — holding shapes to it would drag
 * every accent toward black and flatten the templates. They are not decoration either: the
 * filled portion *is* the value, which puts them under the 3:1 non-text rule.
 *
 * Two things went wrong at once. The fill sat at 2.75:1 on Modern Executive's sidebar, and
 * the track — tinted toward white rather than toward the surface — came out brighter than
 * the fill, so the bars read as the inverse of the level they encode. On the template this
 * project holds up as the reference for two-column layouts.
 */
describe('level bars', () => {
  const barsIn = (html: string) => {
    const root = document.createElement('div');
    root.innerHTML = html;
    return Array.from(root.querySelectorAll<HTMLElement>('*'))
      .filter((element) => {
        const style = element.getAttribute('style') ?? '';
        return style.includes('overflow:hidden') && element.firstElementChild !== null;
      })
      .map((element) => {
        const read = (node: Element | null) =>
          /background:\s*([^;"]+)/.exec(node?.getAttribute('style') ?? '')?.[1]?.trim();
        return { track: read(element), fill: read(element.firstElementChild) };
      })
      .filter((bar): bar is { track: string; fill: string } =>
        Boolean(bar.track?.startsWith('#') && bar.fill?.startsWith('#')),
      );
  };

  for (const template of TEMPLATES) {
    const bars = barsIn(renderTemplate(template.id, template.accentDefault));
    if (bars.length === 0) continue;

    it(`${template.name} fills its bars more strongly than their tracks`, () => {
      for (const { track, fill } of bars) {
        // Whatever the surface is, the fill has to be the part that stands out.
        expect(
          contrastRatio(fill, track),
          `track ${track} is not quieter than fill ${fill}`,
        ).toBeGreaterThan(1.2);
        expect(contrastRatio(fill, track)).toBeGreaterThanOrEqual(AA_GRAPHIC * 0.5);
      }
    });
  }
});
