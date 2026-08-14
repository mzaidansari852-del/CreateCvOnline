import '@testing-library/jest-dom/vitest';
import { cleanup } from '@testing-library/react';
import { afterEach, beforeAll, vi } from 'vitest';

/**
 * Test environment.
 *
 * The public env vars are set here rather than in a `.env.test` so the suite is
 * self-contained and cannot accidentally pick up a developer's real project.
 */
beforeAll(() => {
  process.env.NEXT_PUBLIC_SITE_URL ??= 'https://createcvonline.com';
  process.env.NEXT_PUBLIC_SITE_NAME ??= 'CreateCVOnline';
  process.env.NEXT_PUBLIC_PAYPAL_CURRENCY ??= 'USD';
  process.env.PDF_RENDER_SECRET ??= 'test-secret-not-used-in-production';

  // A few files opt into `@vitest-environment node` — anything asserting on code that
  // branches on `typeof window`, which would otherwise never take the server path under
  // jsdom and pass for the wrong reason. There is no DOM to shim in those.
  if (typeof window === 'undefined') return;

  // jsdom implements neither of these, and the editor's preview relies on both.
  if (!globalThis.ResizeObserver) {
    globalThis.ResizeObserver = class {
      observe() {}
      unobserve() {}
      disconnect() {}
    } as unknown as typeof ResizeObserver;
  }
  if (!window.matchMedia) {
    window.matchMedia = vi.fn().mockImplementation((query: string) => ({
      matches: false,
      media: query,
      onchange: null,
      addEventListener: vi.fn(),
      removeEventListener: vi.fn(),
      dispatchEvent: vi.fn(),
      addListener: vi.fn(),
      removeListener: vi.fn(),
    }));
  }
});

afterEach(() => {
  cleanup();
});
