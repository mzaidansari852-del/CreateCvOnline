'use client';

import { useState } from 'react';
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
import { Eye, EyeOff, GripVertical, Lock, Plus, Trash2 } from 'lucide-react';

import { useCopy } from '@/components/i18n/LocaleProvider';
import { Button } from '@/components/ui/button';
import { Field, Input } from '@/components/ui/form';
import { ConfirmDialog, Modal } from '@/components/ui/modal';
import { SECTION_META, customSectionKey, isCustomSectionId } from '@/lib/cv/sections';
import { uid } from '@/lib/utils/id';
import { cn } from '@/lib/utils/cn';
import type { BuiltInSectionId, CVData, SectionConfig } from '@/types/cv';

/**
 * Section ordering and visibility.
 *
 * Ordering lives on the document, not on the template — which is why switching template
 * keeps it. Every template reads the same `visibleSections(cv)`, so a change here is
 * reflected identically in all 56 designs.
 */

export function SectionManager({
  cv,
  onChange,
  activeSectionId,
  onSelect,
  canUseCustomSections,
  onUpgradeNeeded,
}: {
  cv: CVData;
  onChange: (recipe: (current: CVData) => CVData) => void;
  activeSectionId: string;
  onSelect: (sectionId: string) => void;
  canUseCustomSections: boolean;
  onUpgradeNeeded: () => void;
}) {
  const copy = useCopy();
  const [renaming, setRenaming] = useState<SectionConfig | null>(null);
  const [renameValue, setRenameValue] = useState('');
  const [addingCustom, setAddingCustom] = useState(false);
  const [customTitle, setCustomTitle] = useState('');
  const [removing, setRemoving] = useState<SectionConfig | null>(null);

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 6 } }),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates }),
  );

  const setSections = (sections: SectionConfig[]) =>
    onChange((current) => ({ ...current, sections }));

  const onDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    if (!over || active.id === over.id) return;
    const from = cv.sections.findIndex((section) => section.id === active.id);
    const to = cv.sections.findIndex((section) => section.id === over.id);
    if (from < 0 || to < 0) return;
    const next = [...cv.sections];
    const [moved] = next.splice(from, 1);
    if (!moved) return;
    next.splice(to, 0, moved);
    setSections(next);
  };

  const toggle = (id: string) =>
    setSections(
      cv.sections.map((section) =>
        section.id === id ? { ...section, enabled: !section.enabled } : section,
      ),
    );

  const move = (index: number, delta: number) => {
    const to = index + delta;
    if (to < 0 || to >= cv.sections.length) return;
    const next = [...cv.sections];
    const [moved] = next.splice(index, 1);
    if (!moved) return;
    next.splice(to, 0, moved);
    setSections(next);
  };

  const applyRename = () => {
    if (!renaming) return;
    const label = renameValue.trim().slice(0, 60);
    if (label) {
      onChange((current) => ({
        ...current,
        sections: current.sections.map((section) =>
          section.id === renaming.id ? { ...section, label } : section,
        ),
        customSections: isCustomSectionId(renaming.id)
          ? current.customSections.map((entry) =>
              entry.id === customSectionKey(renaming.id) ? { ...entry, title: label } : entry,
            )
          : current.customSections,
      }));
    }
    setRenaming(null);
  };

  const addCustomSection = () => {
    const title = customTitle.trim().slice(0, 60) || copy.editor.sections.defaultCustomTitle;
    const id = uid();
    onChange((current) => ({
      ...current,
      customSections: [...current.customSections, { id, title, items: [] }],
      sections: [...current.sections, { id: `custom:${id}`, label: title, enabled: true }],
    }));
    setCustomTitle('');
    setAddingCustom(false);
    onSelect(`custom:${id}`);
  };

  const removeCustomSection = (section: SectionConfig) => {
    const key = customSectionKey(section.id);
    onChange((current) => ({
      ...current,
      customSections: current.customSections.filter((entry) => entry.id !== key),
      sections: current.sections.filter((entry) => entry.id !== section.id),
    }));
    setRemoving(null);
    if (activeSectionId === section.id) onSelect('personal');
  };

  return (
    <div className="flex flex-col gap-3">
      <DndContext
        sensors={sensors}
        collisionDetection={closestCenter}
        onDragEnd={onDragEnd}
        modifiers={[restrictToVerticalAxis, restrictToParentElement]}
      >
        <SortableContext
          items={cv.sections.map((section) => section.id)}
          strategy={verticalListSortingStrategy}
        >
          <ul className="flex flex-col gap-1">
            {cv.sections.map((section, index) => (
              <SectionRow
                key={section.id}
                section={section}
                active={section.id === activeSectionId}
                isFirst={index === 0}
                isLast={index === cv.sections.length - 1}
                onSelect={() => onSelect(section.id)}
                onToggle={() => toggle(section.id)}
                onMoveUp={() => move(index, -1)}
                onMoveDown={() => move(index, 1)}
                onRename={() => {
                  setRenaming(section);
                  setRenameValue(section.label);
                }}
                onRemove={isCustomSectionId(section.id) ? () => setRemoving(section) : undefined}
              />
            ))}
          </ul>
        </SortableContext>
      </DndContext>

      <Button
        variant="outline"
        size="sm"
        fullWidth
        leadingIcon={
          canUseCustomSections ? <Plus className="size-4" /> : <Lock className="size-3.5" />
        }
        onClick={() => (canUseCustomSections ? setAddingCustom(true) : onUpgradeNeeded())}
      >
        {copy.editor.sections.addCustom}
      </Button>

      <Modal
        open={renaming !== null}
        onClose={() => setRenaming(null)}
        title={copy.editor.sections.renameTitle}
        description={copy.editor.sections.renameBody}
        size="sm"
        footer={
          <>
            <Button variant="outline" onClick={() => setRenaming(null)}>
              {copy.common.cancel}
            </Button>
            <Button onClick={applyRename}>{copy.common.save}</Button>
          </>
        }
      >
        <Field label={copy.editor.sections.heading}>
          {({ id }) => (
            <Input
              id={id}
              value={renameValue}
              data-autofocus
              maxLength={60}
              onChange={(event) => setRenameValue(event.target.value)}
              onKeyDown={(event) => {
                if (event.key === 'Enter') applyRename();
              }}
            />
          )}
        </Field>
      </Modal>

      <Modal
        open={addingCustom}
        onClose={() => setAddingCustom(false)}
        title={copy.editor.sections.newTitle}
        description={copy.editor.sections.newBody}
        size="sm"
        footer={
          <>
            <Button variant="outline" onClick={() => setAddingCustom(false)}>
              {copy.common.cancel}
            </Button>
            <Button onClick={addCustomSection}>{copy.editor.sections.addConfirm}</Button>
          </>
        }
      >
        <Field label={copy.editor.sections.sectionHeading}>
          {({ id }) => (
            <Input
              id={id}
              value={customTitle}
              data-autofocus
              maxLength={60}
              placeholder={copy.editor.sections.newPlaceholder}
              onChange={(event) => setCustomTitle(event.target.value)}
              onKeyDown={(event) => {
                if (event.key === 'Enter') addCustomSection();
              }}
            />
          )}
        </Field>
      </Modal>

      <ConfirmDialog
        open={removing !== null}
        onClose={() => setRemoving(null)}
        onConfirm={() => {
          if (removing) removeCustomSection(removing);
        }}
        title={copy.editor.sections.deleteTitle}
        description={removing ? copy.editor.sections.deleteBody(removing.label) : ''}
        confirmLabel={copy.editor.sections.deleteConfirm}
        cancelLabel={copy.common.cancel}
      />
    </div>
  );
}

function SectionRow({
  section,
  active,
  isFirst,
  isLast,
  onSelect,
  onToggle,
  onMoveUp,
  onMoveDown,
  onRename,
  onRemove,
}: {
  section: SectionConfig;
  active: boolean;
  isFirst: boolean;
  isLast: boolean;
  onSelect: () => void;
  onToggle: () => void;
  onMoveUp: () => void;
  onMoveDown: () => void;
  onRename: () => void;
  onRemove?: () => void;
}) {
  const copy = useCopy();
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({
    id: section.id,
  });

  /*
   * The translated hint wins, and `SECTION_META` is the fallback for a section that has one
   * there but no entry here yet — a new built-in section is then untranslated rather than
   * silently unexplained.
   */
  const hint = isCustomSectionId(section.id)
    ? copy.editor.sections.customHint
    : (copy.editor.sectionHints[section.id as BuiltInSectionId] ??
      SECTION_META[section.id as BuiltInSectionId]?.hint);

  return (
    <li
      ref={setNodeRef}
      style={{ transform: CSS.Transform.toString(transform), transition }}
      className={cn(
        'group flex items-center gap-0.5 rounded-lg border px-1 py-0.5 transition-colors',
        isDragging
          ? 'border-brand-400 bg-white shadow-pop'
          : active
            ? 'border-brand-200 bg-brand-50'
            : 'border-transparent hover:bg-ink-50',
      )}
    >
      <button
        type="button"
        className="cursor-grab touch-none rounded-md p-1 text-ink-400 transition-colors hover:text-ink-700 active:cursor-grabbing"
        aria-label={copy.editor.reorderHandle(section.label)}
        {...attributes}
        {...listeners}
      >
        <GripVertical className="size-3.5" />
      </button>

      <button
        type="button"
        onClick={onSelect}
        onDoubleClick={onRename}
        title={hint}
        className={cn(
          'min-w-0 flex-1 cursor-pointer truncate rounded-md px-1 py-1.5 text-left text-[13px] font-medium transition-colors',
          section.enabled ? 'text-ink-800' : 'text-ink-400 line-through decoration-ink-300',
          active && 'text-brand-800',
        )}
      >
        {section.label}
      </button>

      <div className="flex shrink-0 items-center opacity-0 transition-opacity group-hover:opacity-100 focus-within:opacity-100">
        <RowButton
          label={copy.editor.sections.moveUp(section.label)}
          onClick={onMoveUp}
          disabled={isFirst}
        >
          <path d="m6 15 6-6 6 6" />
        </RowButton>
        <RowButton
          label={copy.editor.sections.moveDown(section.label)}
          onClick={onMoveDown}
          disabled={isLast}
        >
          <path d="m6 9 6 6 6-6" />
        </RowButton>
        {onRemove ? (
          <button
            type="button"
            onClick={onRemove}
            aria-label={copy.editor.deleteNamed(section.label)}
            className="cursor-pointer rounded-md p-1 text-ink-400 transition-colors hover:bg-danger-50 hover:text-danger-600"
          >
            <Trash2 className="size-3.5" />
          </button>
        ) : null}
      </div>

      <button
        type="button"
        onClick={onToggle}
        aria-pressed={section.enabled}
        aria-label={
          section.enabled
            ? copy.editor.sections.hide(section.label)
            : copy.editor.sections.show(section.label)
        }
        title={section.enabled ? copy.editor.sections.hideTitle : copy.editor.sections.showTitle}
        className={cn(
          'shrink-0 cursor-pointer rounded-md p-1 transition-colors',
          section.enabled
            ? 'text-ink-400 hover:bg-ink-100 hover:text-ink-700'
            : 'text-ink-300 hover:bg-ink-100 hover:text-ink-600',
        )}
      >
        {section.enabled ? <Eye className="size-3.5" /> : <EyeOff className="size-3.5" />}
      </button>
    </li>
  );
}

function RowButton({
  label,
  onClick,
  disabled,
  children,
}: {
  label: string;
  onClick: () => void;
  disabled?: boolean;
  children: React.ReactNode;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      aria-label={label}
      className="cursor-pointer rounded-md p-1 text-ink-400 transition-colors hover:bg-ink-100 hover:text-ink-700 disabled:cursor-not-allowed disabled:opacity-30"
    >
      <svg
        width="14"
        height="14"
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
