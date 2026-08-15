import { describe, expect, it } from 'vitest';

import { SAMPLE_PROFILES, profileLoad, sampleCvFor, sampleProfileFor } from '@/lib/cv/samples';
import { sectionHasContent, visibleSections } from '@/lib/cv/sections';
import { TEMPLATES } from '@/lib/cv/template-registry';
import { SECTION_META } from '@/lib/cv/sections';

/** Sections a blank CV starts with, which are allowed to be on and empty. */
const DEFAULT_ON = Object.values(SECTION_META)
  .filter((meta) => meta.defaultEnabled)
  .map((meta) => meta.id);

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
          !['creative-01', 'creative-02', 'creative-03', 'creative-11', 'modern-05'].includes(
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

  it('shows the competency block on the templates whose format needs one', () => {
    /*
     * The bug this replaces: `defaultSectionConfigs()` ships `competencies` disabled — the
     * right default for a blank CV, since nobody wants to open nine empty headings — and
     * the sample builder used it verbatim. So the Functional and Hybrid previews rendered
     * with no competency block at all, which is the single thing those two formats exist
     * for, and every other test passed because the section is *allowed* to be absent.
     */
    const COMPETENCY_FORMATS = ['functional-cv', 'hybrid-cv'];
    for (const slug of COMPETENCY_FORMATS) {
      const template = TEMPLATES.find((entry) => entry.slug === slug);
      expect(template, `${slug} is missing from the registry`).toBeTruthy();
      const cv = sampleCvFor(template!.id);

      expect(cv.competencies.length, `${slug} sample has no competencies`).toBeGreaterThanOrEqual(3);
      const config = cv.sections.find((section) => section.id === 'competencies');
      expect(config?.enabled, `${slug} sample has the competencies section switched off`).toBe(true);
      expect(
        visibleSections(cv).some((section) => section.id === 'competencies'),
        `${slug} would render without its competency block`,
      ).toBe(true);
    }
  });

  it('enables any section it wrote content for, and no others', () => {
    for (const profile of SAMPLE_PROFILES) {
      for (const section of profile.cv.sections) {
        if (!section.enabled) continue;
        // An enabled section with nothing in it is an empty heading on the preview.
        expect(
          sectionHasContent(profile.cv, section.id) ||
            DEFAULT_ON.includes(section.id as (typeof DEFAULT_ON)[number]),
          `${profile.id} enables ${section.id} with nothing in it`,
        ).toBe(true);
      }
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
