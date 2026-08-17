import { readFileSync } from 'node:fs';
import { join } from 'node:path';

import { describe, expect, it } from 'vitest';

/**
 * Content must not start on the pixel where a full-bleed colour band ends.
 *
 * `CascadeSidebar` lays its page out as a two-column grid: a coloured band bleeding to the
 * page edges, and a white column beside it. The white column was padded
 * `pageMargin pageMargin pageMargin 0` — zero on the left, on the reasoning that the band's
 * own right padding already separated them.
 *
 * It did not. That padding sits *inside* the blue, so it holds the band's own text off the
 * boundary and does nothing for the column next to it. Measured in a real browser against
 * the built page, the gap between the band's right edge and the name in the content column
 * was **0px** — the heading began on the exact pixel the colour ended, and every section
 * heading and paragraph below it did the same. It reads as a printing error.
 *
 * This is asserted on the source rather than by rendering because the value is an inline
 * style computed from `pageMargin`: a DOM assertion would need a browser and a page size to
 * mean anything, while the defect itself is visible in one shorthand — a `0` in the
 * left slot of a padding that has a coloured band to its left.
 */

const source = readFileSync(
  join(process.cwd(), 'components/cv/templates/modern/CascadeSidebar.tsx'),
  'utf8',
);

/** Source with comments stripped — the explanation above quotes the old value verbatim. */
const code = source.replace(/\/\*[\s\S]*?\*\//g, '').replace(/(^|[^:])\/\/.*$/gm, '$1');

describe('CascadeSidebar — the band gutter', () => {
  it('is the file this test thinks it is', () => {
    // A renamed template would make every assertion below vacuous.
    expect(code).toContain('BAND_PERCENT');
    expect(code).toContain('<aside');
  });

  it('never pads the content column with a zero left gutter', () => {
    /*
     * Four-value `padding` shorthands in this file, checked for a `0` in the left slot.
     * `${c.pageMargin}px A B 0` is the exact shape of the bug.
     */
    const shorthands = [...code.matchAll(/padding:\s*`([^`]+)`/g)].map((match) => match[1] ?? '');
    expect(shorthands.length).toBeGreaterThan(0);

    const flush = shorthands.filter((value) => {
      const parts = value.trim().split(/\s+/);
      return parts.length === 4 && parts[3] === '0';
    });
    expect(flush, 'a content column flush against the coloured band').toEqual([]);
  });

  it('insets the content column on all four sides by the page margin', () => {
    // Uniform inset: a gutter narrower than the page margin reads as a mistake.
    const uniform = new RegExp(
      String.raw`padding:\s*` +
        '`' +
        String.raw`\$\{c\.pageMargin\}px\s+\$\{c\.pageMargin\}px\s+\$\{c\.pageMargin\}px\s+\$\{c\.pageMargin\}px` +
        '`',
    );
    expect(uniform.test(code)).toBe(true);
  });

  it('still lets the band itself bleed to the page edges', () => {
    /*
     * The counterweight. The fix must not turn into "inset the blue too" — the full-bleed
     * band is the template's entire visual idea, and `pageBackground` paints it as a
     * gradient across the whole page so the colour survives a page break.
     */
    expect(code).toContain('linear-gradient(to right,');
    expect(code).toMatch(/gridTemplateColumns:\s*`\$\{BAND_PERCENT\}%\s+1fr`/);
  });
});
