'use client';

import { useId, useState } from 'react';
import type { ReactNode } from 'react';
import {
  DndContext,
  KeyboardSensor,
  PointerSensor,
  closestCenter,
  useSensor,
  useSensors,
  type DragEndEvent,
} from '@dnd-kit/core';
import { restrictToParentElement, restrictToVerticalAxis } from '@dnd-kit/modifiers';
import {
  SortableContext,
  sortableKeyboardCoordinates,
  useSortable,
  verticalListSortingStrategy,
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { ChevronDown, GripVertical, Plus, Trash2 } from 'lucide-react';

import { useCopy } from '@/components/i18n/LocaleProvider';
import { Button } from '@/components/ui/button';
import { ConfirmDialog } from '@/components/ui/modal';
import { cn } from '@/lib/utils/cn';

/**
 * The repeatable-entry pattern used by every list section of the editor
 * (experience, education, skills, projects …).
 *
 * One implementation means drag-to-reorder, keyboard reordering, add, delete-with-
 * confirmation, collapse and the empty state all behave identically in nine places, and
 * a fix to any of them lands everywhere at once.
 *
 * Reordering is operable without a pointer: `@dnd-kit`'s keyboard sensor moves the
 * focused handle with the arrow keys, and explicit up/down buttons are always present as
 * a plain, discoverable alternative.
 */

export interface RepeatableItem {
  id: string;
}

export interface RepeatableListProps<T extends RepeatableItem> {
  items: T[];
  onChange: (next: T[]) => void;
  /** Builds a new, empty entry. */
  createItem: () => T;
  /** Heading shown on the collapsed row. */
  summary: (item: T, index: number) => { title: string; subtitle?: string };
  children: (item: T, update: (patch: Partial<T>) => void, index: number) => ReactNode;
  addLabel: string;
  emptyTitle: string;
  emptyDescription: string;
  /**
   * Delete confirmation heading, e.g. "Delete this role?".
   *
   * A whole sentence rather than the bare noun it used to be: French and German need the
   * demonstrative to agree with the noun's gender, so `Delete this ${noun}?` cannot be
   * assembled from parts without going wrong in one language or the other.
   */
  deleteTitle: string;
  /** Stands in for the entry's own name until one is typed, e.g. "Untitled role". */
  untitledLabel: string;
  max?: number;
}

export function RepeatableList<T extends RepeatableItem>({
  items,
  onChange,
  createItem,
  summary,
  children,
  addLabel,
  emptyTitle,
  emptyDescription,
  deleteTitle,
  untitledLabel,
  max = 40,
}: RepeatableListProps<T>) {
  const copy = useCopy();
  const listId = useId();
  const [openId, setOpenId] = useState<string | null>(items[0]?.id ?? null);
  const [pendingDelete, setPendingDelete] = useState<T | null>(null);

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 6 } }),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates }),
  );

  const move = (from: number, to: number) => {
    if (to < 0 || to >= items.length || from === to) return;
    const next = [...items];
    const [moved] = next.splice(from, 1);
    if (!moved) return;
    next.splice(to, 0, moved);
    onChange(next);
  };

  const onDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    if (!over || active.id === over.id) return;
    move(
      items.findIndex((item) => item.id === active.id),
      items.findIndex((item) => item.id === over.id),
    );
  };

  const add = () => {
    if (items.length >= max) return;
    const item = createItem();
    onChange([...items, item]);
    setOpenId(item.id);
  };

  const remove = (item: T) => {
    onChange(items.filter((entry) => entry.id !== item.id));
    setPendingDelete(null);
  };

  const updateItem = (id: string, patch: Partial<T>) => {
    onChange(items.map((item) => (item.id === id ? { ...item, ...patch } : item)));
  };

  if (items.length === 0) {
    return (
      <div className="rounded-xl border border-dashed border-ink-300 bg-ink-50/60 p-6 text-center">
        <p className="text-sm font-semibold text-ink-900">{emptyTitle}</p>
        <p className="mx-auto mt-1 max-w-sm text-[13px] leading-relaxed text-ink-600">
          {emptyDescription}
        </p>
        <Button className="mt-4" size="sm" onClick={add} leadingIcon={<Plus className="size-4" />}>
          {addLabel}
        </Button>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-3">
      <DndContext
        sensors={sensors}
        collisionDetection={closestCenter}
        onDragEnd={onDragEnd}
        modifiers={[restrictToVerticalAxis, restrictToParentElement]}
      >
        <SortableContext
          items={items.map((item) => item.id)}
          strategy={verticalListSortingStrategy}
        >
          <ul className="flex flex-col gap-3">
            {items.map((item, index) => {
              const meta = summary(item, index);
              return (
                <SortableRow
                  key={item.id}
                  id={item.id}
                  open={openId === item.id}
                  title={meta.title}
                  subtitle={meta.subtitle}
                  panelId={`${listId}-${item.id}`}
                  isFirst={index === 0}
                  isLast={index === items.length - 1}
                  onToggle={() => setOpenId(openId === item.id ? null : item.id)}
                  onMoveUp={() => move(index, index - 1)}
                  onMoveDown={() => move(index, index + 1)}
                  onDelete={() => setPendingDelete(item)}
                  untitledLabel={untitledLabel}
                >
                  {children(item, (patch) => updateItem(item.id, patch), index)}
                </SortableRow>
              );
            })}
          </ul>
        </SortableContext>
      </DndContext>

      <div>
        <Button
          variant="outline"
          size="sm"
          onClick={add}
          disabled={items.length >= max}
          leadingIcon={<Plus className="size-4" />}
        >
          {addLabel}
        </Button>
        {items.length >= max ? (
          <p className="mt-2 text-xs text-ink-500">{copy.editor.list.maxEntries(max)}</p>
        ) : null}
      </div>

      <ConfirmDialog
        open={pendingDelete !== null}
        onClose={() => setPendingDelete(null)}
        onConfirm={() => {
          if (pendingDelete) remove(pendingDelete);
        }}
        title={deleteTitle}
        description={
          pendingDelete
            ? copy.editor.list.deleteBody(summary(pendingDelete, 0).title || untitledLabel)
            : ''
        }
        confirmLabel={copy.common.delete}
        cancelLabel={copy.common.cancel}
      />
    </div>
  );
}

function SortableRow({
  id,
  open,
  title,
  subtitle,
  panelId,
  isFirst,
  isLast,
  onToggle,
  onMoveUp,
  onMoveDown,
  onDelete,
  untitledLabel,
  children,
}: {
  id: string;
  open: boolean;
  title: string;
  subtitle?: string;
  panelId: string;
  isFirst: boolean;
  isLast: boolean;
  onToggle: () => void;
  onMoveUp: () => void;
  onMoveDown: () => void;
  onDelete: () => void;
  untitledLabel: string;
  children: ReactNode;
}) {
  const copy = useCopy();
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({
    id,
  });

  return (
    <li
      ref={setNodeRef}
      style={{ transform: CSS.Transform.toString(transform), transition }}
      className={cn(
        'overflow-hidden rounded-xl border bg-white',
        isDragging ? 'z-10 border-brand-400 shadow-pop' : 'border-ink-200',
      )}
    >
      <div className="flex items-center gap-1 p-2">
        <button
          type="button"
          className="cursor-grab touch-none rounded-md p-1.5 text-ink-400 transition-colors hover:bg-ink-100 hover:text-ink-700 active:cursor-grabbing"
          aria-label={copy.editor.reorderHandle(title || untitledLabel)}
          {...attributes}
          {...listeners}
        >
          <GripVertical className="size-4" />
        </button>

        <button
          type="button"
          onClick={onToggle}
          aria-expanded={open}
          aria-controls={panelId}
          className="flex min-w-0 flex-1 cursor-pointer items-center gap-2 rounded-md px-1 py-1 text-left transition-colors hover:bg-ink-50"
        >
          <span className="min-w-0 flex-1">
            <span className="block truncate text-sm font-semibold text-ink-950">
              {title || <span className="text-ink-400">{untitledLabel}</span>}
            </span>
            {subtitle ? (
              <span className="block truncate text-xs text-ink-500">{subtitle}</span>
            ) : null}
          </span>
          <ChevronDown
            className={cn(
              'size-4 shrink-0 text-ink-400 transition-transform',
              open && 'rotate-180',
            )}
            aria-hidden
          />
        </button>

        <div className="flex shrink-0 items-center">
          <IconAction label={copy.editor.moveUp} onClick={onMoveUp} disabled={isFirst}>
            <path d="m6 15 6-6 6 6" />
          </IconAction>
          <IconAction label={copy.editor.moveDown} onClick={onMoveDown} disabled={isLast}>
            <path d="m6 9 6 6 6-6" />
          </IconAction>
          <button
            type="button"
            onClick={onDelete}
            aria-label={copy.editor.deleteNamed(title || untitledLabel)}
            className="cursor-pointer rounded-md p-1.5 text-ink-400 transition-colors hover:bg-danger-50 hover:text-danger-600"
          >
            <Trash2 className="size-4" />
          </button>
        </div>
      </div>

      <div id={panelId} hidden={!open} className="border-t border-ink-100 bg-ink-50/40 p-4">
        {children}
      </div>
    </li>
  );
}

function IconAction({
  label,
  onClick,
  disabled,
  children,
}: {
  label: string;
  onClick: () => void;
  disabled?: boolean;
  children: ReactNode;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      aria-label={label}
      className="cursor-pointer rounded-md p-1.5 text-ink-400 transition-colors hover:bg-ink-100 hover:text-ink-700 disabled:cursor-not-allowed disabled:opacity-35 disabled:hover:bg-transparent"
    >
      <svg
        width="16"
        height="16"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        aria-hidden
      >
        {children}
      </svg>
    </button>
  );
}

/** A simple string list (achievements, highlights) with add/remove/reorder. */
export function StringList({
  values,
  onChange,
  label,
  placeholder,
  addLabel,
  max = 20,
}: {
  values: string[];
  onChange: (next: string[]) => void;
  label: string;
  placeholder: string;
  addLabel: string;
  max?: number;
}) {
  const copy = useCopy();
  const id = useId();

  const setAt = (index: number, value: string) => {
    const next = [...values];
    next[index] = value;
    onChange(next);
  };

  const move = (from: number, to: number) => {
    if (to < 0 || to >= values.length) return;
    const next = [...values];
    const [moved] = next.splice(from, 1);
    if (moved === undefined) return;
    next.splice(to, 0, moved);
    onChange(next);
  };

  return (
    <div className="flex flex-col gap-2">
      <span className="text-sm font-medium text-ink-800" id={id}>
        {label}
      </span>
      <ul className="flex flex-col gap-2" aria-labelledby={id}>
        {values.map((value, index) => (
          <li key={index} className="flex items-start gap-1.5">
            <span aria-hidden className="mt-2.5 size-1.5 shrink-0 rounded-full bg-brand-500" />
            <textarea
              value={value}
              onChange={(event) => setAt(index, event.target.value)}
              placeholder={placeholder}
              rows={2}
              className="min-h-10 w-full resize-y rounded-lg border border-ink-200 bg-white px-3 py-2 text-sm leading-relaxed text-ink-900 placeholder:text-ink-400 focus:border-brand-500 focus:ring-4 focus:ring-brand-500/12 focus:outline-none"
              aria-label={copy.editor.list.itemNumber(label, index + 1)}
            />
            <div className="flex shrink-0 flex-col">
              <IconAction
                label={copy.editor.moveUp}
                onClick={() => move(index, index - 1)}
                disabled={index === 0}
              >
                <path d="m6 15 6-6 6 6" />
              </IconAction>
              <IconAction
                label={copy.editor.moveDown}
                onClick={() => move(index, index + 1)}
                disabled={index === values.length - 1}
              >
                <path d="m6 9 6 6 6-6" />
              </IconAction>
              <button
                type="button"
                onClick={() => onChange(values.filter((_, position) => position !== index))}
                aria-label={copy.editor.list.removeItemNumber(label, index + 1)}
                className="cursor-pointer rounded-md p-1.5 text-ink-400 transition-colors hover:bg-danger-50 hover:text-danger-600"
              >
                <Trash2 className="size-4" />
              </button>
            </div>
          </li>
        ))}
      </ul>
      <div>
        <Button
          variant="ghost"
          size="sm"
          onClick={() => onChange([...values, ''])}
          disabled={values.length >= max}
          leadingIcon={<Plus className="size-3.5" />}
        >
          {addLabel}
        </Button>
      </div>
    </div>
  );
}
