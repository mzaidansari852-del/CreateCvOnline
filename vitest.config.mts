import { fileURLToPath } from 'node:url';

import { defineConfig } from 'vitest/config';

/**
 * Vitest configuration.
 *
 * `server-only` is aliased away: it is a build-time guard that throws when a module is
 * imported from a client bundle, which is exactly the wrong behaviour inside a test
 * runner that has no such distinction.
 *
 * No React plugin is needed: `tsconfig.json` sets `jsx: "react-jsx"`, so Vite's esbuild
 * transform already uses the automatic runtime, and Fast Refresh is irrelevant in a test
 * run. Adding the plugin also pulls in a second copy of Vite's types, which conflicts.
 */
export default defineConfig({
  resolve: {
    alias: [
      { find: /^@\/(.*)$/, replacement: `${fileURLToPath(new URL('.', import.meta.url))}$1` },
      { find: /^server-only$/, replacement: fileURLToPath(new URL('./tests/stubs/empty.ts', import.meta.url)) },
    ],
  },
  test: {
    environment: 'jsdom',
    globals: true,
    setupFiles: ['./tests/setup.ts'],
    include: ['tests/**/*.test.{ts,tsx}'],
    css: false,
    testTimeout: 30_000,
    coverage: {
      reporter: ['text', 'html'],
      include: ['lib/**/*.ts', 'components/**/*.tsx'],
    },
  },
});
