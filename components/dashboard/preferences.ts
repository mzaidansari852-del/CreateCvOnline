'use client';

import { useMemo } from 'react';

import { useStoredJson, writeStoredJson } from '@/hooks/browser';
import type { PaperSize } from '@/types/cv';

/**
 * Dashboard preferences.
 *
 * These are genuinely local: there is no user-preferences endpoint, so they live in
 * `localStorage` on the device that set them. Everything stored here is read by the
 * new-CV flow, which is what keeps the settings page honest — nothing is written that
 * nothing reads.
 *
 * Note the absence of an import from the template registry: that module pulls all 56
 * template components with it, and none of them belong in a client bundle. An unknown
 * template id is therefore resolved against the server-supplied list at the point of
 * use, and `''` simply means "whatever the app default is".
 */

export const PREFERENCES_KEY = 'createcvonline:preferences';

export interface DashboardPreferences {
  /** Paper size applied to every CV created from this browser. */
  paperSize: PaperSize;
  /** Template pre-selected in the new-CV flow. `''` follows the app default. */
  templateId: string;
}

export const DEFAULT_PREFERENCES: DashboardPreferences = {
  paperSize: 'a4',
  templateId: '',
};

function coerce(raw: unknown): DashboardPreferences {
  if (!raw || typeof raw !== 'object') return DEFAULT_PREFERENCES;
  const value = raw as Partial<Record<keyof DashboardPreferences, unknown>>;

  return {
    paperSize: value.paperSize === 'letter' ? 'letter' : 'a4',
    templateId:
      typeof value.templateId === 'string' && /^[a-z0-9-]{1,64}$/.test(value.templateId)
        ? value.templateId
        : '',
  };
}

export function readPreferences(): DashboardPreferences {
  if (typeof window === 'undefined') return DEFAULT_PREFERENCES;
  try {
    const stored = window.localStorage.getItem(PREFERENCES_KEY);
    if (!stored) return DEFAULT_PREFERENCES;
    return coerce(JSON.parse(stored));
  } catch {
    return DEFAULT_PREFERENCES;
  }
}

/** Returns false when the browser refused to store (private mode, full quota). */
export function writePreferences(next: DashboardPreferences): boolean {
  if (typeof window === 'undefined') return false;
  return writeStoredJson(PREFERENCES_KEY, coerce(next));
}

/**
 * Subscribes to the stored preferences.
 *
 * Returns `DEFAULT_PREFERENCES` during SSR and the hydration pass, then the real value —
 * without the extra render an effect-plus-setState would cost, and without the hydration
 * mismatch a direct `localStorage` read in the render body would cause.
 */
export function usePreferences(): DashboardPreferences {
  const stored = useStoredJson<DashboardPreferences>(PREFERENCES_KEY, DEFAULT_PREFERENCES);
  // `stored` is reference-stable per underlying string, so memoising `coerce` keeps the
  // returned object stable too — consumers compare it by identity to detect a change.
  return useMemo(() => coerce(stored), [stored]);
}
