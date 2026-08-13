import { describe, expect, it } from 'vitest';

import {
  createDefaultCustomization,
  createEmptyCV,
  createMinimalCV,
  createSampleCV,
} from '@/lib/cv/defaults';
import {
  BUILT_IN_SECTION_IDS,
  cvCustomizationSchema,
  cvDataSchema,
  partialDateSchema,
} from '@/types/cv';
import {
  completenessScore,
  defaultSectionConfigs,
  sectionHasContent,
  splitSections,
  visibleSections,
} from '@/lib/cv/sections';
import {
  formatDateRange,
  formatDuration,
  formatPartialDate,
  prettyUrl,
  readableOn,
  shade,
  tint,
} from '@/lib/cv/format';

describe('CV schema', () => {
  it('accepts an empty document', () => {
    expect(() => cvDataSchema.parse(createEmptyCV())).not.toThrow();
  });

  it('accepts the worked example', () => {
    expect(() => cvDataSchema.parse(createSampleCV())).not.toThrow();
  });

  it('starts a new CV with every built-in section available', () => {
    const configs = defaultSectionConfigs();
    expect(configs).toHaveLength(BUILT_IN_SECTION_IDS.length);
    expect(configs.filter((section) => section.enabled).length).toBeGreaterThan(3);
  });

  it('rejects an unknown section id', () => {
    const cv = createEmptyCV();
    expect(() =>
      cvDataSchema.parse({ ...cv, sections: [{ id: 'nonsense', label: 'X', enabled: true }] }),
    ).toThrow();
  });

  it('accepts a custom section id', () => {
    const cv = createEmptyCV();
    expect(() =>
      cvDataSchema.parse({
        ...cv,
        sections: [{ id: 'custom:abc', label: 'Patents', enabled: true }],
      }),
    ).not.toThrow();
  });

  it('enforces the array caps that keep a document a document', () => {
    const cv = createEmptyCV();
    const tooMany = Array.from({ length: 41 }, (_, index) => ({
      id: `x${index}`,
      role: 'Role',
      company: 'Company',
      location: '',
      startDate: '',
      endDate: '',
      current: false,
      description: '',
      achievements: [],
      tags: [],
    }));
    expect(() => cvDataSchema.parse({ ...cv, experience: tooMany })).toThrow();
  });
});

describe('partial dates', () => {
  it.each(['', '2024', '2024-01', '2024-12', '2024-06-15'])('accepts %s', (value) => {
    expect(() => partialDateSchema.parse(value)).not.toThrow();
  });

  it.each(['2024-13', '24-01', 'January 2024', '2024/01'])('rejects %s', (value) => {
    expect(() => partialDateSchema.parse(value)).toThrow();
  });
});

describe('date formatting', () => {
  it('formats month and year', () => {
    expect(formatPartialDate('2024-03', 'month-year-short')).toBe('Mar 2024');
    expect(formatPartialDate('2024-03', 'month-year-long')).toBe('March 2024');
    expect(formatPartialDate('2024-03', 'numeric')).toBe('03/2024');
    expect(formatPartialDate('2024-03', 'year-only')).toBe('2024');
  });

  it('degrades gracefully for a year-only value', () => {
    expect(formatPartialDate('2024', 'month-year-long')).toBe('2024');
  });

  it('returns an empty string for empty input, so templates can decide', () => {
    expect(formatPartialDate('')).toBe('');
  });

  it('renders an ongoing role as Present', () => {
    expect(formatDateRange('2021-03', '', true)).toBe('Mar 2021 – Present');
  });

  it('renders a closed range', () => {
    expect(formatDateRange('2018-06', '2021-02', false)).toBe('Jun 2018 – Feb 2021');
  });

  it('renders a single-sided range without a dangling separator', () => {
    expect(formatDateRange('2018-06', '', false)).toBe('Jun 2018');
    expect(formatDateRange('', '2021-02', false)).toBe('Feb 2021');
    expect(formatDateRange('', '', false)).toBe('');
  });

  it('computes an inclusive duration', () => {
    expect(formatDuration('2020-01', '2020-12', false)).toBe('1 yr');
    expect(formatDuration('2020-01', '2020-03', false)).toBe('3 mos');
    expect(formatDuration('2020-01', '2021-06', false)).toBe('1 yr 6 mos');
  });

  it('returns nothing for a reversed or unparseable range', () => {
    expect(formatDuration('2022-01', '2020-01', false)).toBe('');
    expect(formatDuration('', '2020-01', false)).toBe('');
  });
});

describe('colour helpers', () => {
  it('tints toward white and shades toward black', () => {
    expect(tint('#000000', 1)).toBe('#ffffff');
    expect(tint('#000000', 0)).toBe('#000000');
    expect(shade('#ffffff', 1)).toBe('#000000');
  });

  it('expands three-digit hex', () => {
    expect(tint('#abc', 0)).toBe('#aabbcc');
  });

  it('picks a readable foreground', () => {
    expect(readableOn('#ffffff')).toBe('#111827');
    expect(readableOn('#0a0e18')).toBe('#ffffff');
    expect(readableOn('#f5c518')).toBe('#111827');
  });

  it('leaves an unparseable colour alone', () => {
    expect(tint('not-a-colour', 0.5)).toBe('not-a-colour');
  });
});

describe('URL display', () => {
  it('strips protocol, www and trailing slash', () => {
    expect(prettyUrl('https://www.example.com/')).toBe('example.com');
    expect(prettyUrl('http://example.com/path/')).toBe('example.com/path');
    expect(prettyUrl('example.com')).toBe('example.com');
  });
});

describe('section visibility', () => {
  it('hides a section with no content even when it is enabled', () => {
    const cv = createEmptyCV();
    const visible = visibleSections(cv);
    expect(visible).toHaveLength(0);
  });

  it('shows only enabled, non-empty sections', () => {
    const cv = createSampleCV();
    const visible = visibleSections(cv);
    expect(visible.length).toBeGreaterThan(5);
    // References is disabled in the sample.
    expect(visible.some((section) => section.id === 'references')).toBe(false);
    expect(visible.some((section) => section.id === 'experience')).toBe(true);
  });

  it('preserves the author’s order', () => {
    const cv = createSampleCV();
    cv.sections = [
      { id: 'education', label: 'Education', enabled: true },
      { id: 'experience', label: 'Experience', enabled: true },
    ];
    expect(visibleSections(cv).map((section) => section.id)).toEqual(['education', 'experience']);
  });

  it('de-duplicates a repeated section id', () => {
    const cv = createSampleCV();
    cv.sections = [
      { id: 'experience', label: 'Experience', enabled: true },
      { id: 'experience', label: 'Experience again', enabled: true },
    ];
    expect(visibleSections(cv)).toHaveLength(1);
  });

  it('detects content per section type', () => {
    const cv = createSampleCV();
    expect(sectionHasContent(cv, 'experience')).toBe(true);
    expect(sectionHasContent(cv, 'references')).toBe(true);
    expect(sectionHasContent(createEmptyCV(), 'experience')).toBe(false);
    expect(sectionHasContent(cv, 'custom:missing')).toBe(false);
  });

  it('splits sections into a sidebar and a main column', () => {
    const cv = createSampleCV();
    const { main, aside } = splitSections(visibleSections(cv), ['skills', 'languages']);
    expect(aside.map((section) => section.id).sort()).toEqual(['languages', 'skills']);
    expect(main.some((section) => section.id === 'experience')).toBe(true);
    expect(main.length + aside.length).toBe(visibleSections(cv).length);
  });
});

describe('completeness', () => {
  it('scores an empty CV at zero', () => {
    expect(completenessScore(createEmptyCV())).toBe(0);
  });

  it('scores a full CV highly', () => {
    expect(completenessScore(createSampleCV())).toBeGreaterThanOrEqual(90);
  });

  it('scores a sparse CV in between', () => {
    const score = completenessScore(createMinimalCV());
    expect(score).toBeGreaterThan(20);
    expect(score).toBeLessThan(90);
  });

  it('always returns a percentage', () => {
    for (const cv of [createEmptyCV(), createMinimalCV(), createSampleCV()]) {
      const score = completenessScore(cv);
      expect(score).toBeGreaterThanOrEqual(0);
      expect(score).toBeLessThanOrEqual(100);
    }
  });
});

describe('customization schema', () => {
  it('fills every field from an empty object', () => {
    const result = createDefaultCustomization();
    expect(result.templateId).toBeTruthy();
    expect(result.paperSize).toBe('a4');
    expect(result.fontSize).toBeGreaterThan(0);
  });

  it('rejects a malformed colour', () => {
    expect(() => cvCustomizationSchema.parse({ accentColor: 'red' })).toThrow();
    expect(() => cvCustomizationSchema.parse({ accentColor: '#1f3af5' })).not.toThrow();
    expect(() => cvCustomizationSchema.parse({ accentColor: '#abc' })).not.toThrow();
  });

  it('clamps nothing silently — out-of-range values are rejected', () => {
    expect(() => cvCustomizationSchema.parse({ fontSize: 40 })).toThrow();
    expect(() => cvCustomizationSchema.parse({ lineHeight: 5 })).toThrow();
    expect(() => cvCustomizationSchema.parse({ pageMargin: 500 })).toThrow();
  });
});
