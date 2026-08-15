'use client';

import { useCallback, useEffect, useId, useRef } from 'react';
import type { ReactNode } from 'react';
import { createPortal } from 'react-dom';

import { Button } from './button';
import { useCopy } from '@/components/i18n/LocaleProvider';
import { useHydrated } from '@/hooks/browser';
import { cn } from '@/lib/utils/cn';

const FOCUSABLE =
  'a[href],button:not([disabled]),textarea:not([disabled]),input:not([disabled]),select:not([disabled]),[tabindex]:not([tabindex="-1"])';

export interface ModalProps {
  open: boolean;
  onClose: () => void;
  title: string;
  description?: string;
  children?: ReactNode;
  footer?: ReactNode;
  size?: 'sm' | 'md' | 'lg' | 'xl';
  /** Set false for destructive flows where a stray click should not dismiss. */
  dismissOnBackdrop?: boolean;
  className?: string;
}

/**
 * Accessible dialog: focus trap, restore focus on close, Escape to dismiss,
 * scroll lock, and `aria-modal` labelling. Rendered in a portal on `document.body`.
 */
export function Modal({
  open,
  onClose,
  title,
  description,
  children,
  footer,
  size = 'md',
  dismissOnBackdrop = true,
  className,
}: ModalProps) {
  // `createPortal` needs a DOM; `useHydrated` is false on the server and during the
  // hydration pass, so the first client render matches the server exactly.
  const mounted = useHydrated();
  const copy = useCopy();
  const panelRef = useRef<HTMLDivElement>(null);
  const previouslyFocused = useRef<HTMLElement | null>(null);
  const titleId = useId();
  const descriptionId = useId();

  const handleKeyDown = useCallback(
    (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        event.stopPropagation();
        onClose();
        return;
      }
      if (event.key !== 'Tab' || !panelRef.current) return;

      const focusable = Array.from(
        panelRef.current.querySelectorAll<HTMLElement>(FOCUSABLE),
      ).filter((element) => element.offsetParent !== null);
      if (focusable.length === 0) {
        event.preventDefault();
        return;
      }

      const first = focusable[0]!;
      const last = focusable[focusable.length - 1]!;
      if (event.shiftKey && document.activeElement === first) {
        event.preventDefault();
        last.focus();
      } else if (!event.shiftKey && document.activeElement === last) {
        event.preventDefault();
        first.focus();
      }
    },
    [onClose],
  );

  useEffect(() => {
    if (!open) return;

    previouslyFocused.current = document.activeElement as HTMLElement | null;
    const { overflow, paddingRight } = document.body.style;
    const scrollbar = window.innerWidth - document.documentElement.clientWidth;
    document.body.style.overflow = 'hidden';
    if (scrollbar > 0) document.body.style.paddingRight = `${scrollbar}px`;

    document.addEventListener('keydown', handleKeyDown, true);

    const focusTimer = setTimeout(() => {
      const target =
        panelRef.current?.querySelector<HTMLElement>('[data-autofocus]') ??
        panelRef.current?.querySelector<HTMLElement>(FOCUSABLE) ??
        panelRef.current;
      target?.focus();
    }, 20);

    return () => {
      clearTimeout(focusTimer);
      document.removeEventListener('keydown', handleKeyDown, true);
      document.body.style.overflow = overflow;
      document.body.style.paddingRight = paddingRight;
      previouslyFocused.current?.focus?.();
    };
  }, [open, handleKeyDown]);

  if (!mounted || !open) return null;

  const widths = {
    sm: 'max-w-sm',
    md: 'max-w-lg',
    lg: 'max-w-2xl',
    xl: 'max-w-4xl',
  } as const;

  return createPortal(
    <div className="fixed inset-0 z-90 flex items-end justify-center p-0 sm:items-center sm:p-6">
      <div
        className="absolute inset-0 animate-[--animate-fade-in] bg-ink-950/45 backdrop-blur-[2px]"
        onClick={dismissOnBackdrop ? onClose : undefined}
        aria-hidden
      />
      <div
        ref={panelRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby={titleId}
        aria-describedby={description ? descriptionId : undefined}
        tabIndex={-1}
        className={cn(
          'relative flex max-h-[92vh] w-full flex-col animate-[--animate-slide-up] rounded-t-2xl bg-white shadow-pop sm:rounded-2xl',
          widths[size],
          className,
        )}
      >
        <div className="flex items-start justify-between gap-4 border-b border-ink-100 p-5">
          <div className="min-w-0">
            <h2 id={titleId} className="text-lg font-semibold text-ink-950">
              {title}
            </h2>
            {description ? (
              <p id={descriptionId} className="mt-1 text-sm leading-relaxed text-ink-600">
                {description}
              </p>
            ) : null}
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label={copy.common.closeDialog}
            className="-m-1.5 shrink-0 cursor-pointer rounded-lg p-1.5 text-ink-500 transition-colors hover:bg-ink-100 hover:text-ink-900"
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" aria-hidden>
              <path
                d="m6 6 12 12M18 6 6 18"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
              />
            </svg>
          </button>
        </div>

        {children ? (
          <div className="scroll-thin min-h-0 flex-1 overflow-y-auto p-5">{children}</div>
        ) : null}

        {footer ? (
          <div className="flex flex-wrap items-center justify-end gap-3 border-t border-ink-100 p-5">
            {footer}
          </div>
        ) : null}
      </div>
    </div>,
    document.body,
  );
}

/** Confirmation dialog used for every destructive action in the app. */
export function ConfirmDialog({
  open,
  onClose,
  onConfirm,
  title,
  description,
  confirmLabel,
  cancelLabel,
  tone = 'danger',
  loading = false,
}: {
  open: boolean;
  onClose: () => void;
  onConfirm: () => void | Promise<void>;
  title: string;
  description: string;
  /** Defaults to the translated "Confirm"; pass one when the action deserves a verb. */
  confirmLabel?: string;
  cancelLabel?: string;
  tone?: 'danger' | 'primary';
  loading?: boolean;
}) {
  const copy = useCopy();
  return (
    <Modal
      open={open}
      onClose={onClose}
      title={title}
      description={description}
      size="sm"
      dismissOnBackdrop={!loading}
      footer={
        <>
          <Button variant="outline" onClick={onClose} disabled={loading}>
            {cancelLabel ?? copy.common.cancel}
          </Button>
          <Button
            variant={tone === 'danger' ? 'danger' : 'primary'}
            onClick={() => void onConfirm()}
            loading={loading}
            data-autofocus
          >
            {confirmLabel ?? copy.common.confirm}
          </Button>
        </>
      }
    />
  );
}
