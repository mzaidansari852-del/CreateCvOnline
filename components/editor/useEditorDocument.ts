'use client';

import { useCallback, useEffect, useRef, useState } from 'react';

import { apiRequest, ApiRequestError } from '@/components/dashboard/api';
import { useCopy } from '@/components/i18n/LocaleProvider';
import { clearDraft, draftIsUsable, readDraft, writeDraft, type StoredDraft } from './draftBackup';
import type { CVCustomization, CVData, CVDocument } from '@/types/cv';

/**
 * The editor's document state: history, autosave and save status in one place.
 *
 * Three properties this has to guarantee, because losing someone's CV is unforgivable:
 *
 *  1. **Every edit is eventually persisted.** Changes are debounced, but a pending save
 *     is always flushed on unmount, on tab hide, and before the page unloads.
 *  2. **No lost update.** Saves are serialised — a second save never starts while one is
 *     in flight; it queues the newest snapshot instead. The last write always wins with
 *     the newest local state, not with whichever response happened to land last.
 *  3. **Undo is safe.** History snapshots are immutable copies, so undoing never mutates
 *     the live document.
 */

export type SaveStatus = 'idle' | 'dirty' | 'saving' | 'saved' | 'error';

export interface EditorSnapshot {
  title: string;
  data: CVData;
  customization: CVCustomization;
}

const AUTOSAVE_DELAY_MS = 1200;
const HISTORY_LIMIT = 60;

export interface EditorDocument {
  title: string;
  data: CVData;
  customization: CVCustomization;
  /** Applies a change and pushes a history entry. */
  update: (recipe: (draft: EditorSnapshot) => EditorSnapshot, options?: { label?: string }) => void;
  setData: (next: CVData | ((current: CVData) => CVData)) => void;
  setCustomization: (
    next: CVCustomization | ((current: CVCustomization) => CVCustomization),
  ) => void;
  setTitle: (next: string) => void;
  undo: () => void;
  redo: () => void;
  canUndo: boolean;
  canRedo: boolean;
  status: SaveStatus;
  lastSavedAt: string | null;
  errorMessage: string | null;
  /** Forces an immediate save and resolves once the server has acknowledged it. */
  saveNow: () => Promise<void>;
  dirty: boolean;
  /**
   * Work this browser saved locally because the server refused it, found on load.
   *
   * `null` once it has been restored or dismissed. It exists because the alternative —
   * a tab holding the only copy of an hour's work with nothing on screen saying so — cost
   * a real user a complete CV.
   */
  recoveredDraft: StoredDraft | null;
  restoreDraft: () => void;
  discardDraft: () => void;
}

interface History {
  past: EditorSnapshot[];
  present: EditorSnapshot;
  future: EditorSnapshot[];
}

function snapshotOf(document: CVDocument): EditorSnapshot {
  return {
    title: document.title,
    data: document.data,
    customization: document.customization,
  };
}

export function useEditorDocument(
  initial: CVDocument,
  options: { onEntitlementError?: (error: ApiRequestError) => void } = {},
): EditorDocument {
  const copy = useCopy();
  const [history, setHistory] = useState<History>({
    past: [],
    present: snapshotOf(initial),
    future: [],
  });
  const [status, setStatus] = useState<SaveStatus>('idle');
  const [lastSavedAt, setLastSavedAt] = useState<string | null>(initial.updatedAt);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  /*
   * Read once, during the first render, rather than in an effect. An effect would paint the
   * editor with the server's (older) content first and offer the recovery a frame later,
   * which is exactly long enough for someone to start retyping what they already wrote.
   */
  const [recoveredDraft, setRecoveredDraft] = useState<StoredDraft | null>(() => {
    if (typeof window === 'undefined') return null;
    const draft = readDraft(initial.id);
    return draftIsUsable(draft, initial.updatedAt) ? draft : null;
  });

  const cvId = initial.id;
  /**
   * The server's `updatedAt` at the moment this tab loaded the document.
   *
   * Stored with a failed draft so the next load can tell "my draft is newer than the
   * server" from "someone edited this on another device since" — the second must not be
   * silently overwritten by a draft this tab happens to be holding.
   */
  const baseUpdatedAt = useRef<string | null>(initial.updatedAt);
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const inFlight = useRef(false);
  /** The newest snapshot that still needs persisting. `null` when everything is saved. */
  const pending = useRef<EditorSnapshot | null>(null);
  const onEntitlementError = useRef(options.onEntitlementError);
  useEffect(() => {
    onEntitlementError.current = options.onEntitlementError;
  }, [options.onEntitlementError]);

  /**
   * Drains the pending snapshot to the server.
   *
   * A loop rather than a recursive re-schedule: edits made while a request is in flight
   * are picked up by the next iteration, so the last write always carries the newest
   * state and two saves can never overlap.
   */
  const persist = useCallback(async (): Promise<void> => {
    if (inFlight.current) return;
    inFlight.current = true;

    try {
      while (pending.current) {
        const snapshot = pending.current;
        pending.current = null;
        setStatus('saving');

        try {
          const response = await apiRequest<{ cv: CVDocument }>(`/api/cvs/${cvId}`, {
            method: 'PATCH',
            body: JSON.stringify({
              title: snapshot.title,
              data: snapshot.data,
              customization: snapshot.customization,
            }),
          });
          setLastSavedAt(response.cv.updatedAt);
          setErrorMessage(null);
          setStatus(pending.current ? 'dirty' : 'saved');
          // The server has it, so the local copy is now the stale one.
          clearDraft(cvId);
        } catch (error) {
          // Put the work back so the next attempt still carries it, then stop: retrying
          // in a tight loop against a failing server helps nobody.
          pending.current = pending.current ?? snapshot;
          setStatus('error');
          const reason = error instanceof ApiRequestError ? error.message : copy.editor.offline;
          setErrorMessage(reason);
          if (error instanceof ApiRequestError && error.isEntitlement) {
            onEntitlementError.current?.(error);
          }
          /*
           * Before anything else. The work is in memory and the server has just refused it,
           * which makes this tab the only place it exists — the exact state in which closing
           * a tab has destroyed a finished CV.
           */
          writeDraft(cvId, snapshot, baseUpdatedAt.current, reason);
          break;
        }
      }
    } finally {
      inFlight.current = false;
    }
  }, [copy, cvId]);

  /** Queues a snapshot for saving and (re)starts the debounce window. */
  const queueSave = useCallback(
    (snapshot: EditorSnapshot) => {
      pending.current = snapshot;
      setStatus('dirty');
      if (timer.current) clearTimeout(timer.current);
      timer.current = setTimeout(() => void persist(), AUTOSAVE_DELAY_MS);
    },
    [persist],
  );

  const update = useCallback<EditorDocument['update']>(
    (recipe) => {
      const next = recipe(history.present);
      if (next === history.present) return;
      setHistory({
        past: [...history.past, history.present].slice(-HISTORY_LIMIT),
        present: next,
        future: [],
      });
      queueSave(next);
    },
    [history, queueSave],
  );

  const setData = useCallback<EditorDocument['setData']>(
    (next) => {
      update((draft) => ({
        ...draft,
        data: typeof next === 'function' ? next(draft.data) : next,
      }));
    },
    [update],
  );

  const setCustomization = useCallback<EditorDocument['setCustomization']>(
    (next) => {
      update((draft) => ({
        ...draft,
        customization: typeof next === 'function' ? next(draft.customization) : next,
      }));
    },
    [update],
  );

  const setTitle = useCallback<EditorDocument['setTitle']>(
    (next) => {
      update((draft) => ({ ...draft, title: next }));
    },
    [update],
  );

  const undo = useCallback(() => {
    const previous = history.past[history.past.length - 1];
    if (!previous) return;
    setHistory({
      past: history.past.slice(0, -1),
      present: previous,
      future: [history.present, ...history.future].slice(0, HISTORY_LIMIT),
    });
    queueSave(previous);
  }, [history, queueSave]);

  const redo = useCallback(() => {
    const next = history.future[0];
    if (!next) return;
    setHistory({
      past: [...history.past, history.present].slice(-HISTORY_LIMIT),
      present: next,
      future: history.future.slice(1),
    });
    queueSave(next);
  }, [history, queueSave]);

  const saveNow = useCallback(async () => {
    if (timer.current) clearTimeout(timer.current);
    await persist();
  }, [persist]);

  // Flush on unmount, and whenever the tab is hidden — mobile browsers kill background
  // tabs without warning, and `visibilitychange` is the last reliable hook before that.
  useEffect(() => {
    const flush = () => {
      if (!pending.current) return;
      if (timer.current) clearTimeout(timer.current);
      void persist();
    };

    const onVisibility = () => {
      if (document.visibilityState === 'hidden') flush();
    };

    document.addEventListener('visibilitychange', onVisibility);
    return () => {
      document.removeEventListener('visibilitychange', onVisibility);
      flush();
    };
  }, [persist]);

  // Native "you have unsaved changes" prompt. Only armed while something is genuinely
  // unsaved, so it never fires spuriously.
  useEffect(() => {
    const onBeforeUnload = (event: BeforeUnloadEvent) => {
      if (!pending.current) return;
      event.preventDefault();
      event.returnValue = '';
    };
    window.addEventListener('beforeunload', onBeforeUnload);
    return () => window.removeEventListener('beforeunload', onBeforeUnload);
  }, []);

  useEffect(() => {
    return () => {
      if (timer.current) clearTimeout(timer.current);
    };
  }, []);

  // Ctrl/Cmd+S saves, Ctrl/Cmd+Z undoes, Ctrl/Cmd+Shift+Z (or Ctrl+Y) redoes.
  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      const meta = event.metaKey || event.ctrlKey;
      if (!meta) return;
      const key = event.key.toLowerCase();

      if (key === 's') {
        event.preventDefault();
        void saveNow();
      } else if (key === 'z' && !event.shiftKey) {
        const target = event.target as HTMLElement | null;
        // Let the browser handle undo inside a text field the user is typing in.
        if (target && /^(INPUT|TEXTAREA)$/.test(target.tagName)) return;
        event.preventDefault();
        undo();
      } else if ((key === 'z' && event.shiftKey) || key === 'y') {
        event.preventDefault();
        redo();
      }
    };

    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [saveNow, undo, redo]);

  /**
   * Adopt the recovered draft as the current document.
   *
   * Pushed through the history stack rather than swapped in underneath it, so the restore
   * is undoable: someone who restores a draft and then realises the server copy was the one
   * they wanted presses Ctrl+Z, which is the behaviour every other change in this editor
   * already has.
   */
  const restoreDraft = useCallback(() => {
    setRecoveredDraft((draft) => {
      if (!draft) return null;
      setHistory((current) => ({
        past: [...current.past, current.present].slice(-HISTORY_LIMIT),
        present: draft.snapshot,
        future: [],
      }));
      queueSave(draft.snapshot);
      return null;
    });
  }, [queueSave]);

  const discardDraft = useCallback(() => {
    clearDraft(cvId);
    setRecoveredDraft(null);
  }, [cvId]);

  return {
    title: history.present.title,
    data: history.present.data,
    customization: history.present.customization,
    update,
    setData,
    setCustomization,
    setTitle,
    undo,
    redo,
    canUndo: history.past.length > 0,
    canRedo: history.future.length > 0,
    status,
    lastSavedAt,
    errorMessage,
    recoveredDraft,
    restoreDraft,
    discardDraft,
    saveNow,
    dirty: status === 'dirty' || status === 'error',
  };
}
