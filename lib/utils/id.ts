/**
 * Identifier helpers.
 *
 * `crypto.randomUUID` exists in every runtime this app targets (Node 20+, modern
 * browsers, the Edge runtime), so no dependency is required. The fallback keeps
 * non-secure contexts (rare, but e.g. plain-HTTP LAN testing) working.
 */

function randomHex(bytes: number): string {
  const array = new Uint8Array(bytes);
  globalThis.crypto.getRandomValues(array);
  return Array.from(array, (byte) => byte.toString(16).padStart(2, '0')).join('');
}

export function uid(): string {
  if (typeof globalThis.crypto?.randomUUID === 'function') {
    return globalThis.crypto.randomUUID();
  }
  return `${randomHex(8)}-${randomHex(4)}-${randomHex(4)}-${randomHex(4)}-${randomHex(12)}`;
}

/** Short, URL-safe, unguessable id used for public share links. */
export function shareId(): string {
  return randomHex(12);
}

/** Deterministic, URL-safe slug. */
export function slugify(input: string): string {
  return input
    .normalize('NFKD')
    .replace(/[̀-ͯ]/g, '')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 80);
}
