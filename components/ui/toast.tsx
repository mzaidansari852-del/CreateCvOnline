'use client';

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
} from 'react';
import type { ReactNode } from 'react';

import { useActiveLocale } from '@/components/i18n/LocaleProvider';
import { appCopy } from '@/lib/i18n/app-copy';
import { cn } from '@/lib/utils/cn';

export type ToastTone = 'info' | 'success' | 'warning' | 'danger';

export interface Toast {
  id: string;
  title: string;
  description?: string;
  tone: ToastTone;
  durationMs: number;
  action?: { label: string; onClick: () => void };
}

interface ToastContextValue {
  toasts: Toast[];
  push: (
    toast: Omit<Toast, 'id' | 'tone' | 'durationMs'> & Partial<Pick<Toast, 'tone' | 'durationMs'>>,
  ) => string;
  dismiss: (id: string) => void;
  success: (title: string, description?: string) => string;
  error: (title: string, description?: string) => string;
  info: (title: string, description?: string) => string;
  warning: (title: string, description?: string) => string;
}

const ToastContext = createContext<ToastContextValue | null>(null);

let counter = 0;

export function ToastProvider({ children }: { children: ReactNode }) {
  const [toasts, setToasts] = useState<Toast[]>([]);
  const timers = useRef(new Map<string, ReturnType<typeof setTimeout>>());

  const dismiss = useCallback((id: string) => {
    setToasts((current) => current.filter((toast) => toast.id !== id));
    const timer = timers.current.get(id);
    if (timer) {
      clearTimeout(timer);
      timers.current.delete(id);
    }
  }, []);

  const push = useCallback<ToastContextValue['push']>(
    (input) => {
      counter += 1;
      const id = `toast-${counter}`;
      const toast: Toast = {
        id,
        tone: input.tone ?? 'info',
        durationMs: input.durationMs ?? (input.tone === 'danger' ? 8000 : 4500),
        title: input.title,
        description: input.description,
        action: input.action,
      };

      setToasts((current) => [...current.slice(-3), toast]);

      if (toast.durationMs > 0) {
        timers.current.set(
          id,
          setTimeout(() => dismiss(id), toast.durationMs),
        );
      }
      return id;
    },
    [dismiss],
  );

  useEffect(() => {
    const map = timers.current;
    return () => {
      map.forEach((timer) => clearTimeout(timer));
      map.clear();
    };
  }, []);

  const value = useMemo<ToastContextValue>(
    () => ({
      toasts,
      push,
      dismiss,
      success: (title, description) => push({ title, description, tone: 'success' }),
      error: (title, description) => push({ title, description, tone: 'danger' }),
      info: (title, description) => push({ title, description, tone: 'info' }),
      warning: (title, description) => push({ title, description, tone: 'warning' }),
    }),
    [toasts, push, dismiss],
  );

  return (
    <ToastContext.Provider value={value}>
      {children}
      <ToastViewport toasts={toasts} onDismiss={dismiss} />
    </ToastContext.Provider>
  );
}

export function useToast(): ToastContextValue {
  const context = useContext(ToastContext);
  if (!context) {
    throw new Error(
      'useToast must be used inside <ToastProvider>. It is mounted in app/layout.tsx.',
    );
  }
  return context;
}

const toneStyles: Record<ToastTone, { bar: string; icon: ReactNode }> = {
  info: {
    bar: 'bg-brand-600',
    icon: (
      <>
        <circle cx="12" cy="12" r="9" />
        <path d="M12 11v5M12 8v.3" strokeLinecap="round" />
      </>
    ),
  },
  success: {
    bar: 'bg-success-500',
    icon: (
      <>
        <circle cx="12" cy="12" r="9" />
        <path d="m8.5 12.3 2.4 2.4 4.6-4.9" strokeLinecap="round" strokeLinejoin="round" />
      </>
    ),
  },
  warning: {
    bar: 'bg-warning-500',
    icon: (
      <>
        <path d="M10.3 3.9 2.4 17.5A2 2 0 0 0 4.1 20.5h15.8a2 2 0 0 0 1.7-3L13.7 3.9a2 2 0 0 0-3.4 0Z" />
        <path d="M12 9.5v4M12 16.7v.3" strokeLinecap="round" />
      </>
    ),
  },
  danger: {
    bar: 'bg-danger-600',
    icon: (
      <>
        <circle cx="12" cy="12" r="9" />
        <path d="m15 9-6 6M9 9l6 6" strokeLinecap="round" />
      </>
    ),
  },
};

function ToastViewport({
  toasts,
  onDismiss,
}: {
  toasts: Toast[];
  onDismiss: (id: string) => void;
}) {
  /*
   * Read through the external store rather than `useCopy()`. This component is mounted by
   * `ToastProvider` in the root layout, which is *above* every `LocaleProvider` — the hook
   * would compile, render, and silently return English in French and German.
   */
  const copy = appCopy(useActiveLocale());

  return (
    <div
      className="pointer-events-none fixed inset-x-0 bottom-0 z-100 flex flex-col items-center gap-2 p-4 sm:inset-x-auto sm:right-0 sm:bottom-0 sm:items-end"
      role="region"
      aria-label={copy.common.notifications}
    >
      {toasts.map((toast) => {
        const tone = toneStyles[toast.tone];
        return (
          <div
            key={toast.id}
            role={toast.tone === 'danger' ? 'alert' : 'status'}
            aria-live={toast.tone === 'danger' ? 'assertive' : 'polite'}
            className="pointer-events-auto flex w-full max-w-sm animate-[--animate-toast-in] overflow-hidden rounded-xl border border-ink-200 bg-white shadow-pop"
          >
            <span className={cn('w-1 shrink-0', tone.bar)} aria-hidden />
            <div className="flex flex-1 items-start gap-3 p-3.5">
              <svg
                className="mt-px size-[18px] shrink-0 text-ink-500"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.8"
                aria-hidden
              >
                {tone.icon}
              </svg>
              <div className="min-w-0 flex-1">
                <p className="text-sm font-semibold text-ink-950">{toast.title}</p>
                {toast.description ? (
                  <p className="mt-0.5 text-[13px] leading-relaxed text-ink-600">
                    {toast.description}
                  </p>
                ) : null}
                {toast.action ? (
                  <button
                    type="button"
                    onClick={() => {
                      toast.action?.onClick();
                      onDismiss(toast.id);
                    }}
                    className="mt-2 cursor-pointer text-[13px] font-semibold text-brand-700 underline underline-offset-2 hover:text-brand-800"
                  >
                    {toast.action.label}
                  </button>
                ) : null}
              </div>
              <button
                type="button"
                onClick={() => onDismiss(toast.id)}
                aria-label={copy.common.dismissNotification}
                className="-mt-1 -mr-1 cursor-pointer rounded-md p-1 text-ink-400 transition-colors hover:bg-ink-100 hover:text-ink-700"
              >
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" aria-hidden>
                  <path
                    d="m6 6 12 12M18 6 6 18"
                    stroke="currentColor"
                    strokeWidth="2.2"
                    strokeLinecap="round"
                  />
                </svg>
              </button>
            </div>
          </div>
        );
      })}
    </div>
  );
}
