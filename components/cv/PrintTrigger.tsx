'use client';

import { useEffect } from 'react';

/**
 * Opens the browser print dialog once the page and its webfonts are ready.
 *
 * Printing before `document.fonts.ready` resolves produces a PDF laid out in the
 * fallback font, which is exactly the kind of silent difference between preview and
 * output this project is trying to avoid.
 */
export function PrintTrigger({ title }: { title: string }) {
  useEffect(() => {
    let cancelled = false;
    const start = async () => {
      await document.fonts?.ready?.catch?.(() => undefined);
      // One frame so layout settles after the fonts swap in.
      await new Promise((resolve) => requestAnimationFrame(() => resolve(null)));
      if (!cancelled) window.print();
    };
    void start();
    return () => {
      cancelled = true;
    };
  }, []);

  return (
    <div className="no-print fixed top-3 right-3 z-10 flex items-center gap-2 rounded-lg border border-ink-200 bg-white px-3 py-2 text-sm shadow-pop">
      <span className="max-w-40 truncate font-medium text-ink-800">{title}</span>
      <button
        type="button"
        onClick={() => window.print()}
        className="cursor-pointer rounded-md bg-brand-600 px-2.5 py-1 text-xs font-semibold text-white transition-colors hover:bg-brand-700"
      >
        Print
      </button>
      <button
        type="button"
        onClick={() => window.close()}
        className="cursor-pointer rounded-md px-2 py-1 text-xs font-medium text-ink-600 transition-colors hover:bg-ink-100"
      >
        Close
      </button>
    </div>
  );
}
