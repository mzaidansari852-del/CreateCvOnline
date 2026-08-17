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
  Mail,
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
import {
  ApiRequestError,
  apiRequest,
  downloadCVPdf,
  useApiErrorToast,
} from '@/components/dashboard/api';
import { useCopy } from '@/components/i18n/LocaleProvider';
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
import { describeIssues } from './describeIssues';

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
  const copy = useCopy();

  const onEntitlementError = useCallback(
    (error: ApiRequestError) => {
      // The autosave path surfaces plan limits through the same toast as everything else.
      showApiError(error, copy.editor.toast.couldNotSave);
    },
    [copy, showApiError],
  );

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

  /*
   * Resolved against the *current* document, so a section the author renamed is named the
   * way they named it, and a field they have since corrected stops being listed.
   */
  const issueLines = useMemo(
    () =>
      describeIssues(editor.saveIssues, editor.data, {
        entry: copy.editor.issueEntry,
        dateFormat: copy.editor.issueDateFormat,
        tooLong: copy.editor.issueTooLong,
      }),
    [editor.saveIssues, editor.data, copy],
  );

  const orderedSectionIds = useMemo(
    () => ['personal', ...editor.data.sections.map((section) => section.id), 'cover-letter'],
    [editor.data.sections],
  );
  const activeIndex = orderedSectionIds.indexOf(activeSectionId);

  const activeLabel =
    activeSectionId === 'personal'
      ? copy.editor.personalDetails
      : activeSectionId === 'cover-letter'
        ? copy.editor.letterTab
        : (editor.data.sections.find((section) => section.id === activeSectionId)?.label ??
          copy.editor.personalDetails);

  const upgradePrompt = useCallback(
    (reason: string) => {
      trackEvent('upgrade_prompt_shown', { reason: 'editor' });
      toast.push({
        title: copy.editor.pro.title,
        description: copy.editor.pro.body(reason),
        tone: 'warning',
        durationMs: 9000,
        action: { label: copy.editor.pro.seePlans, onClick: () => router.push('/pricing') },
      });
    },
    [copy, toast, router],
  );

  const downloadPdf = async () => {
    setBusy('pdf');
    try {
      await editor.saveNow();
      await downloadCVPdf(initialDocument.id, editor.title);
      trackEvent('cv_downloaded', { template: editor.customization.templateId, format: 'pdf' });
      toast.success(copy.editor.toast.pdfReady, copy.editor.toast.pdfReadyBody);
    } catch (error) {
      showApiError(error, copy.editor.toast.pdfFailed);
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
      toast.success(copy.editor.toast.duplicated, copy.editor.toast.duplicatedBody);
      router.push(`/dashboard/cvs/${response.cv.id}/edit`);
    } catch (error) {
      showApiError(error, copy.editor.toast.duplicateFailed);
    } finally {
      setBusy(null);
    }
  };

  const toggleShare = async () => {
    if (!permissions.canShare && !shareUrl) {
      upgradePrompt(copy.editor.pro.share);
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
        toast.success(copy.editor.toast.shareOn, copy.editor.toast.shareOnBody);
      } else {
        toast.info(copy.editor.toast.shareOff, copy.editor.toast.shareOffBody);
      }
    } catch (error) {
      showApiError(error, copy.editor.toast.shareFailed);
    } finally {
      setBusy(null);
    }
  };

  const remove = async () => {
    setBusy('delete');
    try {
      await apiRequest(`/api/cvs/${initialDocument.id}`, { method: 'DELETE' });
      trackEvent('cv_deleted');
      toast.success(copy.editor.toast.deleted);
      router.push('/dashboard/cvs');
      router.refresh();
    } catch (error) {
      showApiError(error, copy.editor.toast.deleteFailed);
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
          <span className="hidden sm:inline">{copy.nav.myCvs}</span>
        </Link>

        <button
          type="button"
          onClick={() => {
            setTitleDraft(editor.title);
            setRenaming(true);
          }}
          className="min-w-0 flex-1 cursor-pointer truncate rounded-lg px-2 py-1.5 text-left text-sm font-semibold text-ink-950 transition-colors hover:bg-ink-100"
          title={copy.editor.renameCvTooltip}
        >
          {editor.title}
        </button>

        <SaveIndicator
          status={editor.status}
          errorMessage={editor.errorMessage}
          onRetry={() => void editor.saveNow()}
        />

        <div className="hidden items-center sm:flex">
          <ToolbarIcon label={copy.editor.undo} onClick={editor.undo} disabled={!editor.canUndo}>
            <Undo2 className="size-4" />
          </ToolbarIcon>
          <ToolbarIcon label={copy.editor.redo} onClick={editor.redo} disabled={!editor.canRedo}>
            <Redo2 className="size-4" />
          </ToolbarIcon>
        </div>

        <Button
          size="sm"
          onClick={() => void downloadPdf()}
          loading={busy === 'pdf'}
          leadingIcon={<Download className="size-4" />}
        >
          <span className="hidden sm:inline">{copy.editor.downloadPdf}</span>
          <span className="sm:hidden">{copy.editor.downloadPdfShort}</span>
        </Button>

        <DropdownMenu
          ariaLabel={copy.editor.moreActions}
          trigger={() => (
            <span className="grid size-9 place-items-center rounded-lg text-ink-600 transition-colors hover:bg-ink-100 hover:text-ink-900">
              <MoreHorizontal className="size-4" />
            </span>
          )}
          items={[
            {
              label: copy.editor.printAction,
              icon: <Printer className="size-4" />,
              onSelect: () => void print(),
            },
            {
              label: shareUrl ? copy.editor.turnOffSharing : copy.editor.createShareLink,
              icon: <Share2 className="size-4" />,
              onSelect: () => void toggleShare(),
            },
            {
              label: copy.common.duplicate,
              icon: <Copy className="size-4" />,
              onSelect: () => void duplicate(),
            },
            {
              label: copy.editor.previewPage,
              icon: <Eye className="size-4" />,
              href: `/dashboard/cvs/${initialDocument.id}`,
            },
            {
              label: copy.editor.deleteCvAction,
              icon: <Trash2 className="size-4" />,
              tone: 'danger',
              separatorBefore: true,
              onSelect: () => setConfirmDelete(true),
            },
          ]}
        />
      </header>

      {/*
        Two banners that must be impossible to miss, mounted directly under the toolbar.

        Both exist because of one incident: a user completed an entire CV while every
        autosave failed, and the only signal was a small "Not saved — retry" badge whose
        explanation lived in a `title` tooltip. The server had named the problem on every
        attempt and the browser never showed it; closing that tab would have destroyed the
        work with no warning that it was the only copy.
      */}
      {editor.recoveredDraft ? (
        <div className="flex shrink-0 flex-wrap items-center gap-x-3 gap-y-2 border-b border-warning-200 bg-warning-50 px-4 py-2.5 text-[13px] text-warning-900">
          <span className="font-semibold">{copy.editor.draftFoundHeading}</span>
          <span className="min-w-0 flex-1">{copy.editor.draftFoundBody}</span>
          <Button size="sm" onClick={editor.restoreDraft}>
            {copy.editor.draftRestore}
          </Button>
          <button
            type="button"
            onClick={editor.discardDraft}
            className="cursor-pointer font-semibold underline underline-offset-2"
          >
            {copy.editor.draftDiscard}
          </button>
        </div>
      ) : null}

      {editor.status === 'error' ? (
        <div
          role="alert"
          className="flex shrink-0 flex-col gap-1 border-b border-danger-200 bg-danger-50 px-4 py-2.5 text-[13px] text-danger-900"
        >
          <div className="flex flex-wrap items-center gap-x-2 gap-y-1">
            <CloudOff className="size-3.5 shrink-0" aria-hidden />
            <span className="font-semibold">{copy.editor.saveFailedHeading}</span>
            {/*
              The server's own sentence, shown rather than hidden. It is the only thing that
              names *which* rule was broken — a generic "could not save" sends someone
              hunting through fifteen sections for a fault the server already identified.
            */}
            {editor.errorMessage ? <span className="min-w-0">{editor.errorMessage}</span> : null}
            <button
              type="button"
              onClick={() => void editor.saveNow()}
              className="cursor-pointer font-semibold underline underline-offset-2"
            >
              {copy.common.retry}
            </button>
          </div>
          {/*
            The fields, named. This is what turns an unfixable error into a two-minute fix:
            the server has always sent the paths, and the screen never showed them.
          */}
          {issueLines.length > 0 ? (
            <div className="mt-0.5">
              <p className="font-semibold">{copy.editor.invalidFieldsHeading}</p>
              <ul className="mt-1 list-disc pl-5">
                {issueLines.map((line) => (
                  <li key={line}>{line}</li>
                ))}
              </ul>
            </div>
          ) : null}
          <p className="text-danger-800">{copy.editor.saveFailedKept}</p>
        </div>
      ) : null}

      {shareUrl ? (
        <div className="flex shrink-0 flex-wrap items-center gap-2 border-b border-brand-200 bg-brand-50 px-4 py-2 text-[13px] text-brand-900">
          <Share2 className="size-3.5 shrink-0" aria-hidden />
          <span className="font-medium">{copy.editor.publicNotice}</span>
          <code className="truncate rounded bg-white/70 px-1.5 py-0.5 font-mono text-xs">
            {shareUrl}
          </code>
          <button
            type="button"
            className="cursor-pointer font-semibold underline underline-offset-2"
            onClick={() => {
              void navigator.clipboard?.writeText(shareUrl);
              toast.success(copy.editor.linkCopied);
            }}
          >
            {copy.editor.copyLink}
          </button>
        </div>
      ) : null}

      {/* ------------------------------------------------------------ mobile tabs */}
      <div
        role="tablist"
        aria-label={copy.editor.editorView}
        className="flex shrink-0 border-b border-ink-200 lg:hidden"
      >
        {(
          [
            {
              id: 'content',
              label: copy.editor.contentTab,
              icon: <UserRound className="size-4" />,
            },
            { id: 'design', label: copy.editor.designTab, icon: <Palette className="size-4" /> },
            { id: 'preview', label: copy.common.preview, icon: <Eye className="size-4" /> },
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
              label={copy.editor.completeness}
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
            {copy.editor.personalDetails}
          </button>

          <button
            type="button"
            onClick={() => setActiveSectionId('cover-letter')}
            className={cn(
              'mb-2 flex w-full cursor-pointer items-center gap-2 rounded-lg px-2 py-2 text-left text-[13px] font-medium transition-colors',
              activeSectionId === 'cover-letter'
                ? 'bg-brand-50 text-brand-800'
                : 'text-ink-800 hover:bg-ink-50',
            )}
          >
            <Mail className="size-3.5 shrink-0 text-ink-400" aria-hidden />
            {copy.editor.letterTab}
            {editor.data.coverLetter.enabled ? (
              <span className="ml-auto size-1.5 rounded-full bg-success-500" aria-hidden />
            ) : null}
          </button>

          <p className="mt-4 mb-2 px-2 text-xs font-bold tracking-[0.1em] text-ink-500 uppercase">
            {copy.editor.sectionsTab}
          </p>
          <SectionManager
            cv={editor.data}
            onChange={editor.setData}
            activeSectionId={activeSectionId}
            onSelect={setActiveSectionId}
            canUseCustomSections={permissions.canUseCustomSections}
            onUpgradeNeeded={() => upgradePrompt(copy.editor.pro.customSections)}
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
                <Field label={copy.editor.sectionField}>
                  {({ id }) => (
                    <select
                      id={id}
                      value={activeSectionId}
                      onChange={(event) => setActiveSectionId(event.target.value)}
                      className="h-11 w-full cursor-pointer rounded-lg border border-ink-200 bg-white px-3 text-sm font-medium text-ink-900 focus:border-brand-500 focus:ring-4 focus:ring-brand-500/12 focus:outline-none"
                    >
                      <option value="personal">{copy.editor.personalDetails}</option>
                      <option value="cover-letter">{copy.editor.letterTab}</option>
                      {editor.data.sections.map((section) => (
                        <option key={section.id} value={section.id}>
                          {section.label}
                          {section.enabled ? '' : copy.editor.hiddenSuffix}
                        </option>
                      ))}
                    </select>
                  )}
                </Field>
                <p className="mt-2 text-xs text-ink-500">
                  {copy.editor.stepOf(activeIndex + 1, orderedSectionIds.length)}
                </p>
              </div>

              <div className="mb-4 hidden items-center justify-between gap-3 lg:flex">
                <h2 className="text-lg font-bold text-ink-950">{activeLabel}</h2>
                {activeSectionId !== 'personal' &&
                editor.data.sections.find((section) => section.id === activeSectionId)?.enabled ===
                  false ? (
                  <Badge tone="neutral">{copy.editor.hiddenFromCv}</Badge>
                ) : null}
              </div>

              <SectionForm sectionId={activeSectionId} cv={editor.data} onChange={editor.setData} />

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
                  {copy.editor.previousSection}
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
                  {copy.editor.nextSection}
                </Button>
              </div>

              {/* Section management on mobile lives at the bottom of the content pane. */}
              <div className="mt-8 border-t border-ink-100 pt-5 lg:hidden">
                <h2 className="mb-3 text-sm font-bold text-ink-950">
                  {copy.editor.reorderAndHide}
                </h2>
                <SectionManager
                  cv={editor.data}
                  onChange={editor.setData}
                  activeSectionId={activeSectionId}
                  onSelect={setActiveSectionId}
                  canUseCustomSections={permissions.canUseCustomSections}
                  onUpgradeNeeded={() => upgradePrompt(copy.editor.pro.customSections)}
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
        title={copy.editor.renameCvTitle}
        description={copy.editor.renameCvBody}
        size="sm"
        footer={
          <>
            <Button variant="outline" onClick={() => setRenaming(false)}>
              {copy.common.cancel}
            </Button>
            <Button onClick={applyTitle}>{copy.common.save}</Button>
          </>
        }
      >
        <Field label={copy.editor.cvName}>
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
        title={copy.editor.deleteCvTitle}
        description={copy.editor.deleteCvBody(editor.title)}
        confirmLabel={copy.editor.deleteCvConfirm}
        cancelLabel={copy.common.cancel}
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
  const copy = useCopy();

  if (status === 'error') {
    return (
      <button
        type="button"
        onClick={onRetry}
        title={errorMessage ?? copy.common.retry}
        className="flex shrink-0 cursor-pointer items-center gap-1.5 rounded-lg bg-danger-50 px-2 py-1 text-xs font-semibold text-danger-700 transition-colors hover:bg-danger-100"
      >
        <CloudOff className="size-3.5" aria-hidden />
        <span className="hidden sm:inline">{copy.editor.notSaved}</span>
      </button>
    );
  }

  const config = {
    saving: { icon: <Loader2 className="size-3.5 animate-spin" />, label: copy.common.saving },
    dirty: { icon: <TriangleAlert className="size-3.5" />, label: copy.editor.unsaved },
    saved: { icon: <Check className="size-3.5" />, label: copy.common.saved },
    idle: { icon: <Check className="size-3.5" />, label: copy.common.saved },
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
