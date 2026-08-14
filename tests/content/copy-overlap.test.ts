import { describe, expect, it } from 'vitest';

import {
  atsNarrative,
  customisationItems,
  exampleUseCases,
  templateFaq,
  ledeSentence,
} from '@/app/(marketing)/templates/template-copy';
import { TEMPLATES } from '@/lib/cv/template-registry';

/**
 * How much two template pages have in common.
 *
 * The copy is generated from pools, and a pool of two options shared by ten siblings means
 * five pairs of pages saying the same thing. Measured on the built HTML, Modern Professional
 * and Modern Clean once shared 64% of their six-word phrases — same category, same column
 * count, same ATS band, and the id hash agreed with itself on nearly every slot.
 *
 * This is the source-level version of that measurement, so a pool narrowed in a future
 * change fails here rather than three deploys later in Search Console.
 */

function copyFor(template: (typeof TEMPLATES)[number]): string {
  return [
    ledeSentence(template),
    [
      atsNarrative(template).verdict,
      atsNarrative(template).mechanics,
      atsNarrative(template).caveat ?? '',
    ].join(' '),
    exampleUseCases(template)
      .map((useCase) => `${useCase.title} ${useCase.body}`)
      .join(' '),
    customisationItems(template)
      .map((item) => `${item.title} ${item.description}`)
      .join(' '),
    templateFaq(template)
      .map((entry) => `${entry.question} ${entry.answer}`)
      .join(' '),
  ].join(' ');
}

function overlap(a: string, b: string): number {
  const grams = (text: string) => {
    const words = text.toLowerCase().match(/[a-z][a-z'’-]+/g) ?? [];
    return new Set(
      Array.from({ length: Math.max(0, words.length - 5) }, (_, i) =>
        words.slice(i, i + 6).join(' '),
      ),
    );
  };
  const x = grams(a);
  const y = grams(b);
  const shared = [...x].filter((gram) => y.has(gram)).length;
  return shared / new Set([...x, ...y]).size;
}

describe('generated copy', () => {
  const pairs = TEMPLATES.flatMap((a, i) =>
    TEMPLATES.slice(i + 1)
      .filter((b) => b.category === a.category)
      .map((b) => ({ a, b, score: overlap(copyFor(a), copyFor(b)) })),
  );

  /*
   * A ratchet, not a target.
   *
   * The worst sibling pair was 77% when this test was written and is 67% now. 67% is still
   * too high, and it is worth being clear about why widening pools further will not fix it:
   * a pool of length L shared by a cohort of N templates cannot separate every pair better
   * than roughly one-in-L, whatever the picking strategy, and writing ten variants of every
   * sentence is neither realistic nor good writing.
   *
   * What does have no floor is generating from the per-template metadata — `features`,
   * `bestFor`, `description` — which is hand-written and unique. Two blocks now do that
   * and they are what moved this number. The way to keep moving it is more of those, not
   * bigger pools.
   *
   * The threshold sits just above the current worst so a regression fails; lower it as the
   * number comes down.
   */
  it('never lets two siblings say almost the same thing', () => {
    const worst = pairs.sort((x, y) => y.score - x.score)[0]!;
    expect(
      worst.score,
      `${worst.a.slug} and ${worst.b.slug} share ${(worst.score * 100).toFixed(0)}% of their six-word phrases`,
    ).toBeLessThan(0.7);
  });

  it('keeps the typical sibling pair well apart', () => {
    const scores = pairs.map((pair) => pair.score).sort((x, y) => x - y);
    const median = scores[Math.floor(scores.length / 2)]!;
    expect(median, `median sibling overlap is ${(median * 100).toFixed(0)}%`).toBeLessThan(0.4);
  });
});
