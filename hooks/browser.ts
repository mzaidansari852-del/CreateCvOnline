'use client';

import { useCallback, useSyncExternalStore } from 'react';

/**
 * Browser-state hooks built on `useSyncExternalStore`.
 *
 * Reading `window` or `localStorage` inside `useEffect` and calling `setState` works, but
 * it costs a second render on every mount and React's own lint rules (correctly) flag it.
 * `useSyncExternalStore` is the supported way to read an external, mutable source: it
 * gives a stable server snapshot for SSR and subscribes for changes afterwards.
 */

const noopSubscribe = () => () => {};

/** `false` during SSR and the hydration pass, `true` afterwards. */
export function useHydrated(): boolean {
  return useSyncExternalStore(
    noopSubscribe,
    () => true,
    () => false,
  );
}

function subscribeToScroll(onChange: () => void): () => void {
  window.addEventListener('scroll', onChange, { passive: true });
  return () => window.removeEventListener('scroll', onChange);
}

/** True once the page has scrolled past `threshold` pixels. */
export function useScrolledPast(threshold = 8): boolean {
  return useSyncExternalStore(
    subscribeToScroll,
    () => window.scrollY > threshold,
    () => false,
  );
}

const STORAGE_EVENT = 'createcvonline:storage';

function subscribeToStorage(onChange: () => void): () => void {
  window.addEventListener('storage', onChange);
  window.addEventListener(STORAGE_EVENT, onChange);
  return () => {
    window.removeEventListener('storage', onChange);
    window.removeEventListener(STORAGE_EVENT, onChange);
  };
}

/**
 * Reads a JSON value out of `localStorage`, re-reading when it changes in this tab or
 * another one. Returns `serverValue` during SSR so markup never diverges on hydration.
 *
 * The parsed object is memoised by its raw string so the hook returns a referentially
 * stable value — `useSyncExternalStore` re-renders forever if the snapshot is a fresh
 * object each call.
 */
export function useStoredJson<T>(key: string, serverValue: T): T {
  const cache = getCache<T>();

  const getSnapshot = useCallback((): T => {
    let raw: string | null = null;
    try {
      raw = window.localStorage.getItem(key);
    } catch {
      return serverValue;
    }
    if (raw === null) return serverValue;

    const entry = cache.get(key);
    if (entry && entry.raw === raw) return entry.value as T;

    try {
      const value = JSON.parse(raw) as T;
      cache.set(key, { raw, value });
      return value;
    } catch {
      return serverValue;
    }
  }, [key, serverValue, cache]);

  return useSyncExternalStore(subscribeToStorage, getSnapshot, () => serverValue);
}

interface CacheEntry {
  raw: string;
  value: unknown;
}

const globalCacheKey = Symbol.for('createcvonline.storageCache');

function getCache<T>(): Map<string, CacheEntry> {
  const holder = globalThis as unknown as Record<symbol, Map<string, CacheEntry> | undefined>;
  const existing = holder[globalCacheKey];
  if (existing) return existing;
  const created = new Map<string, CacheEntry>();
  holder[globalCacheKey] = created;
  return created as Map<string, CacheEntry> & { __brand?: T };
}

/** Writes a value and notifies every `useStoredJson` in this tab. Returns false if blocked. */
export function writeStoredJson(key: string, value: unknown): boolean {
  try {
    window.localStorage.setItem(key, JSON.stringify(value));
    window.dispatchEvent(new Event(STORAGE_EVENT));
    return true;
  } catch {
    // Private browsing, quota exceeded, or storage disabled. The caller decides what to
    // tell the user — this never throws into a render.
    return false;
  }
}
