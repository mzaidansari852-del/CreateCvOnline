'use client';

import { useId, useRef, useState } from 'react';
import type { ReactNode } from 'react';

import { cn } from '@/lib/utils/cn';

export interface TabItem {
  id: string;
  label: ReactNode;
  icon?: ReactNode;
  badge?: ReactNode;
  content: ReactNode;
}

/**
 * WAI-ARIA tabs with roving focus: ←/→ move between tabs, Home/End jump to the ends.
 * Controlled via `value`/`onChange`, or uncontrolled with `defaultValue`.
 */
export function Tabs({
  items,
  defaultValue,
  value,
  onChange,
  variant = 'underline',
  className,
  panelClassName,
  ariaLabel,
}: {
  items: TabItem[];
  defaultValue?: string;
  value?: string;
  onChange?: (id: string) => void;
  variant?: 'underline' | 'pill';
  className?: string;
  panelClassName?: string;
  ariaLabel: string;
}) {
  const baseId = useId();
  const [internal, setInternal] = useState(defaultValue ?? items[0]?.id ?? '');
  const active = value ?? internal;
  const listRef = useRef<HTMLDivElement>(null);

  const select = (id: string) => {
    if (value === undefined) setInternal(id);
    onChange?.(id);
  };

  const onKeyDown = (event: React.KeyboardEvent) => {
    const index = items.findIndex((item) => item.id === active);
    let next = index;
    if (event.key === 'ArrowRight') next = (index + 1) % items.length;
    else if (event.key === 'ArrowLeft') next = (index - 1 + items.length) % items.length;
    else if (event.key === 'Home') next = 0;
    else if (event.key === 'End') next = items.length - 1;
    else return;

    event.preventDefault();
    const target = items[next];
    if (!target) return;
    select(target.id);
    listRef.current
      ?.querySelector<HTMLButtonElement>(`#${CSS.escape(`${baseId}-tab-${target.id}`)}`)
      ?.focus();
  };

  const activeItem = items.find((item) => item.id === active);

  return (
    <div className={className}>
      <div
        ref={listRef}
        role="tablist"
        aria-label={ariaLabel}
        onKeyDown={onKeyDown}
        className={cn(
          'flex gap-1 overflow-x-auto',
          variant === 'underline'
            ? 'scroll-thin border-b border-ink-200'
            : 'rounded-xl bg-ink-100 p-1',
        )}
      >
        {items.map((item) => {
          const selected = item.id === active;
          return (
            <button
              key={item.id}
              id={`${baseId}-tab-${item.id}`}
              role="tab"
              type="button"
              aria-selected={selected}
              aria-controls={`${baseId}-panel-${item.id}`}
              tabIndex={selected ? 0 : -1}
              onClick={() => select(item.id)}
              className={cn(
                'inline-flex cursor-pointer items-center gap-2 whitespace-nowrap text-sm font-medium transition-colors duration-150',
                variant === 'underline'
                  ? cn(
                      '-mb-px border-b-2 px-3.5 py-2.5',
                      selected
                        ? 'border-brand-600 text-brand-700'
                        : 'border-transparent text-ink-600 hover:border-ink-300 hover:text-ink-900',
                    )
                  : cn(
                      'flex-1 justify-center rounded-lg px-3 py-1.5',
                      selected
                        ? 'bg-white text-ink-950 shadow-sm'
                        : 'text-ink-600 hover:text-ink-900',
                    ),
              )}
            >
              {item.icon}
              {item.label}
              {item.badge}
            </button>
          );
        })}
      </div>

      {activeItem ? (
        <div
          id={`${baseId}-panel-${activeItem.id}`}
          role="tabpanel"
          aria-labelledby={`${baseId}-tab-${activeItem.id}`}
          tabIndex={0}
          className={cn('mt-5 focus-visible:outline-none', panelClassName)}
        >
          {activeItem.content}
        </div>
      ) : null}
    </div>
  );
}
