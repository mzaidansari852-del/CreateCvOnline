import { beforeEach, describe, expect, it, vi } from 'vitest';

import {
  clearDraft,
  draftIsUsable,
  readDraft,
  writeDraft,
  type StoredDraft,
} from '@/components/editor/draftBackup';
import type { EditorSnapshot } from '@/components/editor/useEditorDocument';
import { cvCustomizationSchema, cvDataSchema } from '@/types/cv';

/**
 * The safety net under a failed save.
 *
 * A user completed an entire CV — every section, three roles, a photo — while the autosave
 * failed on every attempt. The server held an empty document and the only copy of that work
 * was one browser tab's memory. Nothing on screen said so; closing the tab would have
 * destroyed it.
 *
 * The save fault that caused it is its own bug. This is the property that should have held
 * regardless: *a refused save must not leave the work with nowhere to live.*
 */

const snapshot: EditorSnapshot = {
  title: 'Mon CV',
  data: cvDataSchema.parse({ personal: {}, summary: 'Profil' }),
  customization: cvCustomizationSchema.parse({}),
};

function memoryStorage(): Storage {
  const map = new Map<string, string>();
  return {
    get length() {
      return map.size;
    },
    clear: () => map.clear(),
    getItem: (k: string) => map.get(k) ?? null,
    key: (i: number) => [...map.keys()][i] ?? null,
    removeItem: (k: string) => void map.delete(k),
    setItem: (k: string, v: string) => void map.set(k, v),
  } as Storage;
}

beforeEach(() => {
  vi.stubGlobal('window', { localStorage: memoryStorage() });
});

describe('draft backup', () => {
  it('round-trips a snapshot', () => {
    writeDraft('cv1', snapshot, '2026-01-01T00:00:00.000Z', 'Some rule was broken.');
    const draft = readDraft('cv1');
    expect(draft?.snapshot.title).toBe('Mon CV');
    expect(draft?.snapshot.data.summary).toBe('Profil');
    expect(draft?.reason).toBe('Some rule was broken.');
  });

  it('keeps drafts separate per CV', () => {
    writeDraft('cv1', snapshot, null, null);
    expect(readDraft('cv2')).toBeNull();
  });

  it('is cleared once the server has the work', () => {
    // Otherwise a stale draft would offer to overwrite newer server content on every load.
    writeDraft('cv1', snapshot, null, null);
    clearDraft('cv1');
    expect(readDraft('cv1')).toBeNull();
  });

  it('never throws when storage is unavailable', () => {
    /*
     * `localStorage` throws rather than degrades — absent in some webviews, disabled by
     * privacy settings, full in Safari private browsing. An editor that crashed while
     * trying to back up a CV would be a fine irony and a real outage.
     */
    vi.stubGlobal('window', {
      get localStorage(): Storage {
        throw new Error('SecurityError: access denied');
      },
    });
    expect(() => writeDraft('cv1', snapshot, null, null)).not.toThrow();
    expect(() => clearDraft('cv1')).not.toThrow();
    expect(readDraft('cv1')).toBeNull();
  });

  it('treats a malformed or half-written draft as no draft', () => {
    // This value survives deploys, so an older build's shape must read as absent, not crash
    // the editor on its first render.
    for (const junk of ['not json', '{}', '{"savedAt":1}', '{"snapshot":{},"savedAt":1}']) {
      window.localStorage.setItem('cvo.draft.cv1', junk);
      expect(readDraft('cv1')).toBeNull();
    }
  });

  it('forgets a draft older than a week', () => {
    writeDraft('cv1', snapshot, null, null);
    const raw = JSON.parse(window.localStorage.getItem('cvo.draft.cv1') as string) as StoredDraft;
    raw.savedAt = Date.now() - 8 * 24 * 60 * 60 * 1000;
    window.localStorage.setItem('cvo.draft.cv1', JSON.stringify(raw));
    expect(readDraft('cv1')).toBeNull();
  });
});

describe('deciding whether to offer a draft', () => {
  const at = (iso: string, base: string | null = null): StoredDraft => ({
    snapshot,
    savedAt: Date.now(),
    baseUpdatedAt: base,
    reason: null,
  });

  it('offers a draft written against the version the server still has', () => {
    expect(draftIsUsable(at('x', '2026-01-02T00:00:00.000Z'), '2026-01-02T00:00:00.000Z')).toBe(
      true,
    );
  });

  it('does NOT offer a draft the server has already moved past', () => {
    /*
     * The case that makes silent restore dangerous: the CV was edited on another device
     * since this draft was written. Restoring would quietly discard that newer work, which
     * is a worse failure than the one this feature exists to prevent — so the draft is
     * dropped, and even when it is offered the user is asked rather than overridden.
     */
    expect(draftIsUsable(at('x', '2026-01-01T00:00:00.000Z'), '2026-01-05T00:00:00.000Z')).toBe(
      false,
    );
  });

  it('offers it when either timestamp is unknown', () => {
    expect(draftIsUsable(at('x', null), '2026-01-01T00:00:00.000Z')).toBe(true);
    expect(draftIsUsable(at('x', '2026-01-01T00:00:00.000Z'), null)).toBe(true);
  });

  it('offers nothing when there is no draft', () => {
    expect(draftIsUsable(null, '2026-01-01T00:00:00.000Z')).toBe(false);
  });
});
