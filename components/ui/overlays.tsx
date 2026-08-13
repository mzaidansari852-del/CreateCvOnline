'use client';

import { useEffect, useId, useRef, useState } from 'react';
import type { ReactNode } from 'react';

import { cn } from '@/lib/utils/cn';

/* -------------------------------------------------------------------------- */
/* Tooltip                                                                     */
/* -------------------------------------------------------------------------- */

/**
 * Hover/focus tooltip. The trigger keeps `aria-describedby` wired so the label is
 * announced by screen readers, and Escape dismisses it.
 */
export function Tooltip({
  content,
  children,
  side = 'top',
  className,
}: {
  content: ReactNode;
  children: ReactNode;
  side?: 'top' | 'bottom' | 'left' | 'right';
  className?: string;
}) {
  const [open, setOpen] = useState(false);
  const id = useId();

  const positions = {
    top: 'bottom-full left-1/2 -translate-x-1/2 mb-2',
    bottom: 'top-full left-1/2 -translate-x-1/2 mt-2',
    left: 'right-full top-1/2 -translate-y-1/2 mr-2',
    right: 'left-full top-1/2 -translate-y-1/2 ml-2',
  } as const;

  return (
    <span
      className={cn('relative inline-flex', className)}
      onMouseEnter={() => setOpen(true)}
      onMouseLeave={() => setOpen(false)}
      onFocus={() => setOpen(true)}
      onBlur={() => setOpen(false)}
      onKeyDown={(event) => {
        if (event.key === 'Escape') setOpen(false);
      }}
    >
      <span aria-describedby={open ? id : undefined} className="contents">
        {children}
      </span>
      {open ? (
        <span
          id={id}
          role="tooltip"
          className={cn(
            'pointer-events-none absolute z-80 w-max max-w-56 animate-[--animate-fade-in] rounded-lg bg-ink-950 px-2.5 py-1.5 text-xs leading-snug font-medium text-white shadow-pop',
            positions[side],
          )}
        >
          {content}
        </span>
      ) : null}
    </span>
  );
}

/* -------------------------------------------------------------------------- */
/* Dropdown menu                                                               */
/* -------------------------------------------------------------------------- */

export interface MenuItem {
  label: string;
  onSelect?: () => void;
  href?: string;
  icon?: ReactNode;
  tone?: 'default' | 'danger';
  disabled?: boolean;
  separatorBefore?: boolean;
}

export function DropdownMenu({
  trigger,
  items,
  align = 'end',
  ariaLabel,
  className,
  menuClassName,
}: {
  trigger: (props: { open: boolean }) => ReactNode;
  items: MenuItem[];
  align?: 'start' | 'end';
  ariaLabel: string;
  className?: string;
  menuClassName?: string;
}) {
  const [open, setOpen] = useState(false);
  const rootRef = useRef<HTMLDivElement>(null);
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;

    const onPointerDown = (event: MouseEvent) => {
      if (!rootRef.current?.contains(event.target as Node)) setOpen(false);
    };
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        setOpen(false);
        rootRef.current?.querySelector('button')?.focus();
      }
    };

    document.addEventListener('mousedown', onPointerDown);
    document.addEventListener('keydown', onKeyDown);
    const timer = setTimeout(() => {
      menuRef.current?.querySelector<HTMLElement>('[role="menuitem"]:not([aria-disabled="true"])')?.focus();
    }, 10);

    return () => {
      document.removeEventListener('mousedown', onPointerDown);
      document.removeEventListener('keydown', onKeyDown);
      clearTimeout(timer);
    };
  }, [open]);

  const onMenuKeyDown = (event: React.KeyboardEvent) => {
    if (event.key !== 'ArrowDown' && event.key !== 'ArrowUp') return;
    event.preventDefault();
    const focusable = Array.from(
      menuRef.current?.querySelectorAll<HTMLElement>('[role="menuitem"]:not([aria-disabled="true"])') ?? [],
    );
    if (focusable.length === 0) return;
    const index = focusable.indexOf(document.activeElement as HTMLElement);
    const next =
      event.key === 'ArrowDown'
        ? (index + 1) % focusable.length
        : (index - 1 + focusable.length) % focusable.length;
    focusable[next]?.focus();
  };

  return (
    <div ref={rootRef} className={cn('relative', className)}>
      <button
        type="button"
        aria-haspopup="menu"
        aria-expanded={open}
        aria-label={ariaLabel}
        onClick={() => setOpen((current) => !current)}
        className="cursor-pointer"
      >
        {trigger({ open })}
      </button>

      {open ? (
        <div
          ref={menuRef}
          role="menu"
          aria-label={ariaLabel}
          onKeyDown={onMenuKeyDown}
          className={cn(
            'absolute z-80 mt-1.5 min-w-52 animate-[--animate-scale-in] overflow-hidden rounded-xl border border-ink-200 bg-white p-1 shadow-pop',
            align === 'end' ? 'right-0 origin-top-right' : 'left-0 origin-top-left',
            menuClassName,
          )}
        >
          {items.map((item, index) => {
            const classes = cn(
              'flex w-full cursor-pointer items-center gap-2.5 rounded-lg px-2.5 py-2 text-left text-sm transition-colors',
              item.disabled
                ? 'cursor-not-allowed text-ink-400'
                : item.tone === 'danger'
                  ? 'text-danger-700 hover:bg-danger-50 focus-visible:bg-danger-50'
                  : 'text-ink-700 hover:bg-ink-100 focus-visible:bg-ink-100',
            );

            return (
              <div key={`${item.label}-${index}`}>
                {item.separatorBefore ? <div className="my-1 h-px bg-ink-100" role="separator" /> : null}
                {item.href && !item.disabled ? (
                  <a role="menuitem" href={item.href} className={classes} onClick={() => setOpen(false)}>
                    {item.icon}
                    {item.label}
                  </a>
                ) : (
                  <button
                    type="button"
                    role="menuitem"
                    aria-disabled={item.disabled || undefined}
                    disabled={item.disabled}
                    className={classes}
                    onClick={() => {
                      if (item.disabled) return;
                      setOpen(false);
                      item.onSelect?.();
                    }}
                  >
                    {item.icon}
                    {item.label}
                  </button>
                )}
              </div>
            );
          })}
        </div>
      ) : null}
    </div>
  );
}

/* -------------------------------------------------------------------------- */
/* Accordion                                                                   */
/* -------------------------------------------------------------------------- */

export interface AccordionItem {
  question: string;
  answer: ReactNode;
}

/**
 * FAQ accordion. Uses native `<details>` semantics via buttons so it stays keyboard
 * operable and the answers remain in the DOM for crawlers.
 */
export function Accordion({
  items,
  className,
  defaultOpenIndex = -1,
}: {
  items: AccordionItem[];
  className?: string;
  defaultOpenIndex?: number;
}) {
  const [openIndex, setOpenIndex] = useState(defaultOpenIndex);
  const baseId = useId();

  return (
    <div className={cn('divide-y divide-ink-200 overflow-hidden rounded-xl border border-ink-200 bg-white', className)}>
      {items.map((item, index) => {
        const open = openIndex === index;
        return (
          <div key={item.question}>
            <h3>
              <button
                type="button"
                id={`${baseId}-trigger-${index}`}
                aria-expanded={open}
                aria-controls={`${baseId}-panel-${index}`}
                onClick={() => setOpenIndex(open ? -1 : index)}
                className="flex w-full cursor-pointer items-center justify-between gap-4 px-5 py-4 text-left transition-colors hover:bg-ink-50"
              >
                <span className="text-[15px] font-semibold text-ink-950">{item.question}</span>
                <svg
                  className={cn(
                    'size-5 shrink-0 text-ink-500 transition-transform duration-200',
                    open && 'rotate-180',
                  )}
                  viewBox="0 0 24 24"
                  fill="none"
                  aria-hidden
                >
                  <path d="m6 9 6 6 6-6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              </button>
            </h3>
            <div
              id={`${baseId}-panel-${index}`}
              role="region"
              aria-labelledby={`${baseId}-trigger-${index}`}
              hidden={!open}
              className="px-5 pb-5 text-sm leading-relaxed text-ink-600"
            >
              {item.answer}
            </div>
          </div>
        );
      })}
    </div>
  );
}
