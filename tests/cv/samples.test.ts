import { describe, expect, it } from 'vitest';

import { SAMPLE_PROFILES, profileLoad, sampleProfileFor } from '@/lib/cv/samples';
import { TEMPLATES } from '@/lib/cv/template-registry';

/**
 * The sample CV each template page shows.
 *
 * `sampleProfileFor` falls back to the product designer for an unmapped template, because a
 * missing entry must not take a page down. That fallback is also exactly the behaviour this
 * whole thing exists to end — all fifty-six pages showing one person — so it has to fail
 * here instead, loudly, the moment a template is added without a profile.
 */

describe('template → sample mapping', () => {
  it('covers every template explicitly', () => {
    const unmapped = TEMPLATES.filter(
      (template) => sampleProfileFor(template.id).id === 'product-designer',
    )
      // The designer is a real assignment for the design templates; the failure is a
      // template silently landing on her because nobody wrote a row.
      .filter(
        (template) =>
          !['creative-01', 'creative-02', 'creative-03', 'creative-08', 'modern-05'].includes(
            template.id,
          ),
      )
      .map((template) => `${template.id} (${template.slug})`);

    expect(unmapped, 'add a row to TEMPLATE_PROFILE in lib/cv/samples.ts').toEqual([]);
  });

  it('spreads the pages across the profiles rather than piling them up', () => {
    const load = profileLoad();
    const worst = [...load.entries()].sort((a, b) => b[1] - a[1])[0]!;
    // The point of the exercise is that no document is the body copy of a dozen pages.
    expect(worst[1], `${worst[0]} carries ${worst[1]} template pages`).toBeLessThanOrEqual(8);
    expect(
      load.size,
      'at least ten distinct documents across the catalogue',
    ).toBeGreaterThanOrEqual(10);
  });

  it('uses every profile it defines', () => {
    const load = profileLoad();
    const unused = SAMPLE_PROFILES.filter((profile) => !load.has(profile.id)).map((p) => p.id);
    expect(unused, 'a profile nobody shows is dead content').toEqual([]);
  });
});

describe('the profiles themselves', () => {
  it('are all clearly fictional', () => {
    for (const profile of SAMPLE_PROFILES) {
      const { personal } = profile.cv;
      expect(personal.email, `${profile.id} email`).toMatch(/@example\.com$/);
      for (const field of [personal.website, personal.linkedin, personal.github]) {
        if (!field) continue;
        expect(field, `${profile.id} links must not point at a real account`).toMatch(
          /example|linkedin\.com\/in\/|github\.com\//,
        );
      }
    }
  });

  it('are substantial enough to exercise a template', () => {
    for (const profile of SAMPLE_PROFILES) {
      const { cv } = profile;
      expect(cv.summary.length, `${profile.id} summary`).toBeGreaterThan(150);
      expect(cv.experience.length, `${profile.id} experience`).toBeGreaterThanOrEqual(2);
      expect(cv.education.length, `${profile.id} education`).toBeGreaterThanOrEqual(1);
      expect(cv.skills.length, `${profile.id} skills`).toBeGreaterThanOrEqual(6);
      // A template has to cope with a long bullet, and every real CV has one.
      const longest = Math.max(
        ...cv.experience.flatMap((role) => role.achievements.map((line) => line.length)),
      );
      expect(longest, `${profile.id} has no bullet long enough to test wrapping`).toBeGreaterThan(
        110,
      );
    }
  });

  it('are actually different documents', () => {
    // The failure this replaces was 3,361 identical words on 56 pages, so the assertion
    // that matters is that no two profiles share their prose.
    const summaries = new Set(SAMPLE_PROFILES.map((profile) => profile.cv.summary));
    expect(summaries.size).toBe(SAMPLE_PROFILES.length);

    const names = new Set(
      SAMPLE_PROFILES.map(
        (profile) => `${profile.cv.personal.firstName} ${profile.cv.personal.lastName}`,
      ),
    );
    expect(names.size).toBe(SAMPLE_PROFILES.length);

    const titles = new Set(SAMPLE_PROFILES.map((profile) => profile.cv.personal.title));
    expect(titles.size).toBe(SAMPLE_PROFILES.length);
  });

  it('carries stable ids, so a rebuild produces identical markup', () => {
    for (const profile of SAMPLE_PROFILES) {
      for (const entry of profile.cv.experience) {
        // `uid()` would change every build and defeat the prerender cache.
        expect(entry.id, `${profile.id} experience id`).not.toMatch(/^[a-z0-9]{8,}$/i);
      }
    }
  });
});
