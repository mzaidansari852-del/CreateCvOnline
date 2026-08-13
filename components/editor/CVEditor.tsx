'use client';

import { useCallback, useMemo, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import {
  ArrowLeft,
  ChevronLeft,
  ChevronRight,
  Check,
  CloudOff,
  Copy,
  Download,
  Eye,
  Loader2,
  MoreHorizontal,
  Palette,
  Printer,
  Redo2,
  Share2,
  Trash2,
  TriangleAlert,
  Undo2,
  UserRound,
} from 'lucide-react';

import { DesignPanel, type EditorTemplateChoice } from './DesignPanel';
import { PreviewPane } from './PreviewPane';
import { SectionForm } from './SectionForms';
import { SectionManager } from './SectionManager';
import { useEditorDocument } from './useEditorDocument';
import { ApiRequestError, apiRequest, downloadCVPdf, useApiErrorToast } from '@/components/dashboard/api';
import { Button } from '@/components/ui/button';
import { Badge, ProgressBar } from '@/components/ui/feedback';
import { Field, Input } from '@/components/ui/form';
import { ConfirmDialog, Modal } from '@/components/ui/modal';
import { DropdownMenu } from '@/components/ui/overlays';
import { useToast } from '@/components/ui/toast';
import { trackEvent } from '@/lib/analytics/events';
import { completenessScore } from '@/lib/cv/sections';
import { cn } from '@/lib/utils/cn';
import type { CVDocument } from '@/types/cv';

/**
 * The CV editor.
 *
 * Desktop is a two-pane workspace: a scrolling editor on the left, a live page preview on
 * the right. Mobile is deliberately *not* the same layout shrunk — an editor and a page
 * preview cannot usefully share a 375px viewport, so the small-screen build is a
 * three-tab workspace (Content, Design, Preview) with step navigation between sections.
 */

type Pane = 'content' | 'design' | 'preview';

export interface EditorPermissions {
  canUsePremiumTemplates: boolean;
  canCustomise: boolean;
  canShare: boolean;
  canUseCustomSections: boolean;
  planName: string;
}

export function CVEditor({
  document: initialDocument,
  templates,
  permissions,
}: {
  document: CVDocument;
  templates: EditorTemplateChoice[];
  permissions: EditorPermissions;
}) {
  const router = useRouter();
  const toast = useToast();
  const showApiError = useApiErrorToast();

  const onEntitlementError = useCallback((error: ApiRequestError) => {
    // The autosave path surfaces plan limits through the same toast as everything else.
    showApiError(error, 'Could not save');
  }, [showApiError]);

  const editor = useEditorDocument(initialDocument, { onEntitlementError });

  const [pane, setPane] = useState<Pane>('content');
  const [activeSectionId, setActiveSectionId] = useState('personal');
  const [renaming, setRenaming] = useState(false);
  const [titleDraft, setTitleDraft] = useState(initialDocument.title);
  const [confirmDelete, setConfirmDelete] = useState(false);
  const [busy, setBusy] = useState<null | 'pdf' | 'duplicate' | 'delete' | 'share'>(null);
  const [shareUrl, setShareUrl] = useState<string | null>(
    initialDocument.isPublic && initialDocument.shareId
      ? `${typeof window === 'undefined' ? '' : window.location.origin}/cv/${initialDocument.shareId}`
      : null,
  );

  const completeness = useMemo(() => completenessScore(editor.data), [editor.data]);

  const orderedSectionIds = useMemo(
    () => ['personal', ...editor.data.sections.map((section) => section.id)],
    [editor.data.sections],
  );
  const activeIndex = orderedSectionIds.indexOf(activeSectionId);

  const activeLabel =
    activeSectionId === 'personal'
      ? 'Personal details'
      : (editor.data.sections.find((section) => section.id === activeSectionId)?.label ??
        'Personal details');

  const upgradePrompt = useCallback(
    (reason: string) => {
      trackEvent('upgrade_prompt_shown', { reason: 'editor' });
      toast.push({
        title: 'That is a Pro feature',
        description: `${reason} Upgrade to unlock every template and the full set of design controls.`,
        tone: 'warning',
        durationMs: 9000,
        action: { label: 'See Pro plans', onClick: () => router.push('/pricing') },
      });
    },
    [toast, router],
  );

  const downloadPdf = async () => {
    setBusy('pdf');
    try {
      await editor.saveNow();
      await downloadCVPdf(initialDocument.id, editor.title);
      trackEvent('cv_downloaded', { template: editor.customization.templateId, format: 'pdf' });
      toast.success('PDF downloaded', 'Check your downloads folder.');
    } catch (error) {
      showApiError(error, 'Could not create the PDF');
    } finally {
      setBusy(null);
    }
  };

  const print = async () => {
    await editor.saveNow();
    trackEvent('cv_printed', { template: editor.customization.templateId });
    window.open(`/print/${initialDocument.id}`, '_blank', 'noopener,noreferrer');
  };

  const duplicate = async () => {
    setBusy('duplicate');
    try {
      await editor.saveNow();
      const response = await apiRequest<{ cv: CVDocument }>(
        `/api/cvs/${initialDocument.id}/duplicate`,
        { method: 'POST' },
      );
      trackEvent('cv_duplicated');
      toast.success('CV duplicated', 'Opening the copy.');
      router.push(`/dashboard/cvs/${response.cv.id}/edit`);
    } catch (error) {
      showApiError(error, 'Could not duplicate this CV');
    } finally {
      setBusy(null);
    }
  };

  const toggleShare = async () => {
    if (!permissions.canShare && !shareUrl) {
      upgradePrompt('Public share links are Pro.');
      return;
    }
    setBusy('share');
    try {
      const next = shareUrl === null;
      const response = await apiRequest<{ shareUrl: string | null }>(
        `/api/cvs/${initialDocument.id}/share`,
        { method: 'POST', body: JSON.stringify({ isPublic: next }) },
      );
      setShareUrl(response.shareUrl);
      if (response.shareUrl) {
        trackEvent('cv_shared');
        await navigator.clipboard?.writeText(response.shareUrl).catch(() => undefined);
        toast.success('Share link created', 'Copied to your clipboard.');
      } else {
        toast.info('Sharing turned off', 'The old link no longer works.');
      }
    } catch (error) {
      showApiError(error, 'Could not change sharing');
    } finally {
      setBusy(null);
    }
  };

  const remove = async () => {
    setBusy('delete');
    try {
      await apiRequest(`/api/cvs/${initialDocument.id}`, { method: 'DELETE' });
      trackEvent('cv_deleted');
      toast.success('CV deleted');
      router.push('/dashboard/cvs');
      router.refresh();
    } catch (error) {
      showApiError(error, 'Could not delete this CV');
      setBusy(null);
      setConfirmDelete(false);
    }
  };

  const applyTitle = () => {
    const next = titleDraft.trim().slice(0, 120);
    if (next && next !== editor.title) editor.setTitle(next);
    setRenaming(false);
  };

  return (
    <div className="flex h-dvh flex-col overflow-hidden bg-white">
      {/* ------------------------------------------------------------ toolbar */}
      <header className="flex shrink-0 items-center gap-2 border-b border-ink-200 px-3 py-2 sm:px-4">
        <Link
          href="/dashboard/cvs"
          className="flex shrink-0 items-center gap-1.5 rounded-lg px-2 py-1.5 text-sm font-medium text-ink-600 transition-colors hover:bg-ink-100 hover:text-ink-900"
        >
          <ArrowLeft className="size-4" />
          <span className="hidden sm:inline">My CVs</span>
        </Link>

        <button
          type="button"
          onClick={() => {
            setTitleDraft(editor.title);
            setRenaming(true);
          }}
          className="min-w-0 flex-1 cursor-pointer truncate rounded-lg px-2 py-1.5 text-left text-sm font-semibold text-ink-950 transition-colors hover:bg-ink-100"
          title="Rename this CV"
        >
          {editor.title}
        </button>

        <SaveIndicator
          status={editor.status}
          errorMessage={editor.errorMessage}
          onRetry={() => void editor.saveNow()}
        />

        <div className="hidden items-center sm:flex">
          <ToolbarIcon label="Undo (Ctrl+Z)" onClick={editor.undo} disabled={!editor.canUndo}>
            <Undo2 className="size-4" />
          </ToolbarIcon>
          <ToolbarIcon label="Redo (Ctrl+Shift+Z)" onClick={editor.redo} disabled={!editor.canRedo}>
            <Redo2 className="size-4" />
          </ToolbarIcon>
        </div>

        <Button
          size="sm"
          onClick={() => void downloadPdf()}
          loading={busy === 'pdf'}
          leadingIcon={<Download className="size-4" />}
        >
          <span className="hidden sm:inline">Download PDF</span>
          <span className="sm:hidden">PDF</span>
        </Button>

        <DropdownMenu
          ariaLabel="More actions"
          trigger={() => (
            <span className="grid size-9 place-items-center rounded-lg text-ink-600 transition-colors hover:bg-ink-100 hover:text-ink-900">
              <MoreHorizontal className="size-4" />
            </span>
          )}
          items={[
            { label: 'Print…', icon: <Printer className="size-4" />, onSelect: () => void print() },
            {
              label: shareUrl ? 'Turn off sharing' : 'Create share link',
              icon: <Share2 className="size-4" />,
              onSelect: () => void toggleShare(),
            },
            {
              label: 'Duplicate',
              icon: <Copy className="size-4" />,
              onSelect: () => void duplicate(),
            },
            {
              label: 'Preview page',
              icon: <Eye className="size-4" />,
              href: `/dashboard/cvs/${initialDocument.id}`,
            },
            {
              label: 'Delete CV',
              icon: <Trash2 className="size-4" />,
              tone: 'danger',
              separatorBefore: true,
              onSelect: () => setConfirmDelete(true),
            },
          ]}
        />
      </header>

      {shareUrl ? (
        <div className="flex shrink-0 flex-wrap items-center gap-2 border-b border-brand-200 bg-brand-50 px-4 py-2 text-[13px] text-brand-900">
          <Share2 className="size-3.5 shrink-0" aria-hidden />
          <span className="font-medium">This CV is public:</span>
          <code className="truncate rounded bg-white/70 px-1.5 py-0.5 font-mono text-xs">
            {shareUrl}
          </code>
          <button
            type="button"
            className="cursor-pointer font-semibold underline underline-offset-2"
            onClick={() => {
              void navigator.clipboard?.writeText(shareUrl);
              toast.success('Link copied');
            }}
          >
            Copy
          </button>
        </div>
      ) : null}

      {/* ------------------------------------------------------------ mobile tabs */}
      <div
        role="tablist"
        aria-label="Editor view"
        className="flex shrink-0 border-b border-ink-200 lg:hidden"
      >
        {(
          [
            { id: 'content', label: 'Content', icon: <UserRound className="size-4" /> },
            { id: 'design', label: 'Design', icon: <Palette className="size-4" /> },
            { id: 'preview', label: 'Preview', icon: <Eye className="size-4" /> },
          ] as const
        ).map((tab) => (
          <button
            key={tab.id}
            type="button"
            role="tab"
            aria-selected={pane === tab.id}
            onClick={() => setPane(tab.id)}
            className={cn(
              'flex flex-1 cursor-pointer items-center justify-center gap-1.5 border-b-2 py-2.5 text-sm font-medium transition-colors',
              pane === tab.id
                ? 'border-brand-600 text-brand-700'
                : 'border-transparent text-ink-500 hover:text-ink-800',
            )}
          >
            {tab.icon}
            {tab.label}
          </button>
        ))}
      </div>

      {/* ------------------------------------------------------------ workspace */}
      <div className="flex min-h-0 flex-1">
        {/* Section rail — desktop only */}
        <aside className="scroll-thin hidden w-60 shrink-0 overflow-y-auto border-r border-ink-200 p-3 lg:block">
          <div className="mb-4">
            <ProgressBar
              value={completeness}
              label="Completeness"
              tone={completeness >= 80 ? 'success' : completeness >= 50 ? 'brand' : 'warning'}
            />
          </div>

          <button
            type="button"
            onClick={() => setActiveSectionId('personal')}
            className={cn(
              'mb-2 flex w-full cursor-pointer items-center gap-2 rounded-lg px-2 py-2 text-left text-[13px] font-medium transition-colors',
              activeSectionId === 'personal'
                ? 'bg-brand-50 text-brand-800'
                : 'text-ink-800 hover:bg-ink-50',
            )}
          >
            <UserRound className="size-3.5 shrink-0 text-ink-400" aria-hidden />
            Personal details
          </button>

          <p className="mt-4 mb-2 px-2 text-xs font-bold tracking-[0.1em] text-ink-500 uppercase">
            Sections
          </p>
          <SectionManager
            cv={editor.data}
            onChange={editor.setData}
            activeSectionId={activeSectionId}
            onSelect={setActiveSectionId}
            canUseCustomSections={permissions.canUseCustomSections}
            onUpgradeNeeded={() => upgradePrompt('Custom sections are Pro.')}
          />
        </aside>

        {/* Editor column */}
        <div
          className={cn(
            'scroll-thin min-h-0 flex-1 overflow-y-auto lg:max-w-xl lg:border-r lg:border-ink-200',
            pane === 'preview' ? 'hidden lg:block' : 'block',
          )}
        >
          {pane === 'design' ? (
            <div className="p-4 sm:p-5">
              <DesignPanel
                customization={editor.customization}
                onChange={editor.setCustomization}
                templates={templates}
                canUsePremiumTemplates={permissions.canUsePremiumTemplates}
                canCustomise={permissions.canCustomise}
                onUpgradeNeeded={upgradePrompt}
              />
            </div>
          ) : (
            <div className="p-4 sm:p-5">
              {/* Mobile section picker + stepper */}
              <div className="mb-5 lg:hidden">
                <Field label="Section">
                  {({ id }) => (
                    <select
                      id={id}
                      value={activeSectionId}
                      onChange={(event) => setActiveSectionId(event.target.value)}
                      className="h-11 w-full cursor-pointer rounded-lg border border-ink-200 bg-white px-3 text-sm font-medium text-ink-900 focus:border-brand-500 focus:ring-4 focus:ring-brand-500/12 focus:outline-none"
                    >
                      <option value="personal">Personal details</option>
                      {editor.data.sections.map((section) => (
                        <option key={section.id} value={section.id}>
                          {section.label}
                          {section.enabled ? '' : ' (hidden)'}
                        </option>
                      ))}
                    </select>
                  )}
                </Field>
                <p className="mt-2 text-xs text-ink-500">
                  Step {activeIndex + 1} of {orderedSectionIds.length}
                </p>
              </div>

              <div className="mb-4 hidden items-center justify-between gap-3 lg:flex">
                <h2 className="text-lg font-bold text-ink-950">{activeLabel}</h2>
                {activeSectionId !== 'personal' &&
                editor.data.sections.find((section) => section.id === activeSectionId)?.enabled ===
                  false ? (
                  <Badge tone="neutral">Hidden from CV</Badge>
                ) : null}
              </div>

              <SectionForm
                sectionId={activeSectionId}
                cv={editor.data}
                onChange={editor.setData}
              />

              <div className="mt-8 flex items-center justify-between gap-3 border-t border-ink-100 pt-5">
                <Button
                  variant="outline"
                  size="sm"
                  disabled={activeIndex <= 0}
                  onClick={() => {
                    const previous = orderedSectionIds[activeIndex - 1];
                    if (previous) setActiveSectionId(previous);
                  }}
                  leadingIcon={<ChevronLeft className="size-4" />}
                >
                  Previous
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  disabled={activeIndex >= orderedSectionIds.length - 1}
                  onClick={() => {
                    const next = orderedSectionIds[activeIndex + 1];
                    if (next) setActiveSectionId(next);
                  }}
                  trailingIcon={<ChevronRight className="size-4" />}
                >
                  Next section
                </Button>
              </div>

              {/* Section management on mobile lives at the bottom of the content pane. */}
              <div className="mt-8 border-t border-ink-100 pt-5 lg:hidden">
                <h2 className="mb-3 text-sm font-bold text-ink-950">
                  Reorder and hide sections
                </h2>
                <SectionManager
                  cv={editor.data}
                  onChange={editor.setData}
                  activeSectionId={activeSectionId}
                  onSelect={setActiveSectionId}
                  canUseCustomSections={permissions.canUseCustomSections}
                  onUpgradeNeeded={() => upgradePrompt('Custom sections are Pro.')}
                />
              </div>
            </div>
          )}
        </div>

        {/* Preview column */}
        <PreviewPane
          cv={editor.data}
          customization={editor.customization}
          className={cn('flex-1', pane === 'preview' ? 'flex' : 'hidden lg:flex')}
        />
      </div>

      {/* ------------------------------------------------------------ dialogs */}
      <Modal
        open={renaming}
        onClose={() => setRenaming(false)}
        title="Rename CV"
        description="Only you see this — it is how the CV is listed in your dashboard, not a heading on the document."
        size="sm"
        footer={
          <>
            <Button variant="outline" onClick={() => setRenaming(false)}>
              Cancel
            </Button>
            <Button onClick={applyTitle}>Save</Button>
          </>
        }
      >
        <Field label="Name">
          {({ id }) => (
            <Input
              id={id}
              data-autofocus
              value={titleDraft}
              maxLength={120}
              onChange={(event) => setTitleDraft(event.target.value)}
              onKeyDown={(event) => {
                if (event.key === 'Enter') applyTitle();
              }}
            />
          )}
        </Field>
      </Modal>

      <ConfirmDialog
        open={confirmDelete}
        onClose={() => setConfirmDelete(false)}
        onConfirm={remove}
        loading={busy === 'delete'}
        title="Delete this CV?"
        description={`“${editor.title}” will be permanently deleted. This cannot be undone.`}
        confirmLabel="Delete permanently"
      />
    </div>
  );
}

function SaveIndicator({
  status,
  errorMessage,
  onRetry,
}: {
  status: ReturnType<typeof useEditorDocument>['status'];
  errorMessage: string | null;
  onRetry: () => void;
}) {
  if (status === 'error') {
    return (
      <button
        type="button"
        onClick={onRetry}
        title={errorMessage ?? 'Retry'}
        className="flex shrink-0 cursor-pointer items-center gap-1.5 rounded-lg bg-danger-50 px-2 py-1 text-xs font-semibold text-danger-700 transition-colors hover:bg-danger-100"
      >
        <CloudOff className="size-3.5" aria-hidden />
        <span className="hidden sm:inline">Not saved — retry</span>
      </button>
    );
  }

  const config = {
    saving: { icon: <Loader2 className="size-3.5 animate-spin" />, label: 'Saving…' },
    dirty: { icon: <TriangleAlert className="size-3.5" />, label: 'Unsaved' },
    saved: { icon: <Check className="size-3.5" />, label: 'Saved' },
    idle: { icon: <Check className="size-3.5" />, label: 'Saved' },
  }[status];

  return (
    <span
      className="flex shrink-0 items-center gap-1.5 px-2 text-xs font-medium text-ink-500"
      role="status"
      aria-live="polite"
    >
      {config.icon}
      <span className="hidden sm:inline">{config.label}</span>
    </span>
  );
}

function ToolbarIcon({
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
      title={label}
      className="cursor-pointer rounded-lg p-2 text-ink-600 transition-colors hover:bg-ink-100 hover:text-ink-900 disabled:cursor-not-allowed disabled:opacity-35 disabled:hover:bg-transparent"
    >
      {children}
    </button>
  );
}
