'use client';

import type { EditorSnapshot } from './useEditorDocument';

/**
 * A local copy of work the server has refused.
 *
 * ## Why this exists
 *
 * A user filled in an entire CV — every section, a photo, three roles — while the autosave
 * failed on every attempt. The editor showed "Non enregistré — réessayer", the server held
 * an empty document, and the only copy of an hour's work was the React state of one browser
 * tab. Closing that tab would have destroyed it, and nothing on screen said so.
 *
 * The save bug that caused it is a bug and will be fixed. This is the part that should have
 * been true anyway: **a failed save must not be the only thing standing between someone and
 * their work.** Whatever the cause — a lapsed session, a rejected field, a network drop, a
 * deploy mid-edit — the snapshot goes to `localStorage` the moment the server says no, and
 * comes back when the editor next opens.
 *
 * ## What it is not
 *
 * It is not a sync layer and not a source of truth. The server is. This holds at most one
 * snapshot per CV, only while that snapshot is unsaved, and is deleted the instant a save
 * succeeds — so a stale draft cannot resurrect old content over newer server state. On
 * reopening, the user is *asked*; nothing is restored silently, because silently replacing
 * a document someone edited on another device with a draft from this one is a worse failure
 * than the one being prevented.
 */

const PREFIX = 'cvo.draft.';
/** Older drafts are noise: if a week has passed, the server copy is the real one. */
const MAX_AGE_MS = 7 * 24 * 60 * 60 * 1000;

export interface StoredDraft {
  snapshot: EditorSnapshot;
  /** When the save failed, so the editor can say how old the draft is. */
  savedAt: number;
  /** The `updatedAt` the server reported when this tab loaded the document. */
  baseUpdatedAt: string | null;
  /** Why the server refused it — shown when offering the restore. */
  reason: string | null;
}

function key(cvId: string): string {
  return `${PREFIX}${cvId}`;
}

/**
 * Every entry point is wrapped, because `localStorage` throws rather than degrades: it is
 * absent in some embedded webviews, disabled by some privacy settings, and full in Safari
 * private browsing. An editor that crashed while trying to back up a CV would be a fine
 * irony and a real outage.
 */
function safely<T>(operation: () => T, fallback: T): T {
  try {
    return operation();
  } catch {
    return fallback;
  }
}

export function writeDraft(
  cvId: string,
  snapshot: EditorSnapshot,
  baseUpdatedAt: string | null,
  reason: string | null,
): void {
  safely(() => {
    const draft: StoredDraft = { snapshot, savedAt: Date.now(), baseUpdatedAt, reason };
    window.localStorage.setItem(key(cvId), JSON.stringify(draft));
  }, undefined);
}

export function clearDraft(cvId: string): void {
  safely(() => window.localStorage.removeItem(key(cvId)), undefined);
}

/** The stored draft for this CV, if there is a usable one. */
export function readDraft(cvId: string): StoredDraft | null {
  return safely<StoredDraft | null>(() => {
    const raw = window.localStorage.getItem(key(cvId));
    if (!raw) return null;

    const parsed = JSON.parse(raw) as Partial<StoredDraft>;
    /*
     * Shape-checked rather than trusted. This value survives deploys, so it can have been
     * written by an older build with a different snapshot shape — and a malformed draft
     * must read as "no draft", never as a crash on the editor's first render.
     */
    if (
      !parsed ||
      typeof parsed.savedAt !== 'number' ||
      !parsed.snapshot ||
      typeof parsed.snapshot !== 'object' ||
      typeof parsed.snapshot.title !== 'string' ||
      !parsed.snapshot.data ||
      !parsed.snapshot.customization
    ) {
      clearDraft(cvId);
      return null;
    }

    if (Date.now() - parsed.savedAt > MAX_AGE_MS) {
      clearDraft(cvId);
      return null;
    }

    return {
      snapshot: parsed.snapshot as EditorSnapshot,
      savedAt: parsed.savedAt,
      baseUpdatedAt: parsed.baseUpdatedAt ?? null,
      reason: parsed.reason ?? null,
    };
  }, null);
}

/**
 * Whether a draft is worth offering, given what the server currently holds.
 *
 * Two cases are *not* worth offering, and both would be annoying rather than helpful:
 * a draft written against the document the server already has (the save eventually
 * succeeded from another tab), and a draft older than the server's own copy (someone
 * edited elsewhere since, so this one is stale by definition).
 */
export function draftIsUsable(draft: StoredDraft | null, serverUpdatedAt: string | null): boolean {
  if (!draft) return false;
  if (!draft.baseUpdatedAt || !serverUpdatedAt) return true;
  return draft.baseUpdatedAt >= serverUpdatedAt;
}
