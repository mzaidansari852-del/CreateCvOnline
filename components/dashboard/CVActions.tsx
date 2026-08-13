'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import {
  Copy,
  Download,
  Eye,
  Link2,
  MoreHorizontal,
  Pencil,
  Share2,
  Trash2,
} from 'lucide-react';

import { Button, ButtonLink, Spinner } from '@/components/ui/button';
import { Alert } from '@/components/ui/feedback';
import { Field, Input, Switch } from '@/components/ui/form';
import { ConfirmDialog, Modal } from '@/components/ui/modal';
import { DropdownMenu, type MenuItem } from '@/components/ui/overlays';
import { useToast } from '@/components/ui/toast';
import { apiRequest, copyToClipboard, downloadCVPdf, useApiErrorToast } from './api';
import { trackEvent } from '@/lib/analytics/events';
import { absoluteUrl } from '@/lib/site';
import { cn } from '@/lib/utils/cn';

/**
 * Everything you can do to a saved CV, in one place.
 *
 * The list page and the detail page share this component so an action never exists on
 * one screen and not the other. Every call goes through the REST API — the server is
 * what enforces quotas, so a refused action surfaces the server's own message rather
 * than a guess made in the browser.
 */

export interface CVActionTarget {
  id: string;
  title: string;
  isPublic: boolean;
  shareId: string | null;
}

export function CVActions({
  cv,
  canShare,
  layout = 'menu',
  afterDelete = 'refresh',
  className,
}: {
  cv: CVActionTarget;
  /** From `viewer.limits.shareLinks`. Free plans see the gate before they hit it. */
  canShare: boolean;
  /** `bar` adds the primary actions as buttons beside the menu. */
  layout?: 'menu' | 'bar';
  afterDelete?: 'refresh' | 'redirect';
  className?: string;
}) {
  const router = useRouter();
  const toast = useToast();
  const showError = useApiErrorToast();

  const [busy, setBusy] = useState<null | 'download' | 'duplicate' | 'rename' | 'delete' | 'share'>(
    null,
  );
  const [renameOpen, setRenameOpen] = useState(false);
  const [renameValue, setRenameValue] = useState(cv.title);
  const [renameError, setRenameError] = useState<string | undefined>(undefined);
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [shareOpen, setShareOpen] = useState(false);
  const [isPublic, setIsPublic] = useState(cv.isPublic);
  const [shareUrl, setShareUrl] = useState<string | null>(
    cv.isPublic && cv.shareId ? absoluteUrl(`/cv/${cv.shareId}`) : null,
  );

  const editHref = `/dashboard/cvs/${cv.id}/edit`;
  const previewHref = `/dashboard/cvs/${cv.id}`;

  async function handleDownload() {
    setBusy('download');
    try {
      await downloadCVPdf(cv.id, cv.title);
      trackEvent('cv_downloaded', { cv_id: cv.id });
      toast.success('PDF ready', 'Your download should start automatically.');
      // The download counter moved, so the quota meters need re-reading.
      router.refresh();
    } catch (error) {
      showError(error, 'Could not create the PDF');
    } finally {
      setBusy(null);
    }
  }

  async function handleDuplicate() {
    setBusy('duplicate');
    try {
      const { cv: copy } = await apiRequest<{ cv: { id: string; title: string } }>(
        `/api/cvs/${cv.id}/duplicate`,
        { method: 'POST' },
      );
      trackEvent('cv_duplicated', { cv_id: cv.id });
      toast.success('Copy created', `“${copy.title}” is in your list.`);
      router.refresh();
    } catch (error) {
      showError(error, 'Could not duplicate that CV');
    } finally {
      setBusy(null);
    }
  }

  async function handleRename() {
    const title = renameValue.trim();
    if (!title) {
      setRenameError('Give the CV a name so you can find it later.');
      return;
    }
    if (title.length > 120) {
      setRenameError('Keep the name to 120 characters or fewer.');
      return;
    }

    setBusy('rename');
    setRenameError(undefined);
    try {
      await apiRequest(`/api/cvs/${cv.id}`, {
        method: 'PATCH',
        body: JSON.stringify({ title }),
      });
      toast.success('Renamed', `Now called “${title}”.`);
      setRenameOpen(false);
      router.refresh();
    } catch (error) {
      showError(error, 'Could not rename that CV');
    } finally {
      setBusy(null);
    }
  }

  async function handleDelete() {
    setBusy('delete');
    try {
      await apiRequest(`/api/cvs/${cv.id}`, { method: 'DELETE' });
      trackEvent('cv_deleted', { cv_id: cv.id });
      toast.success('CV deleted', `“${cv.title}” has been removed.`);
      setDeleteOpen(false);
      if (afterDelete === 'redirect') router.replace('/dashboard/cvs');
      router.refresh();
    } catch (error) {
      showError(error, 'Could not delete that CV');
    } finally {
      setBusy(null);
    }
  }

  async function handleShareToggle(next: boolean) {
    setBusy('share');
    try {
      const result = await apiRequest<{ isPublic: boolean; shareUrl: string | null }>(
        `/api/cvs/${cv.id}/share`,
        { method: 'POST', body: JSON.stringify({ isPublic: next }) },
      );
      setIsPublic(result.isPublic);
      setShareUrl(result.shareUrl);
      if (result.isPublic) trackEvent('cv_shared', { cv_id: cv.id });
      toast.success(
        result.isPublic ? 'Share link on' : 'Share link off',
        result.isPublic
          ? 'Anyone with the link can now view this CV.'
          : 'The link no longer works.',
      );
      router.refresh();
    } catch (error) {
      showError(error, 'Could not change sharing');
    } finally {
      setBusy(null);
    }
  }

  async function handleCopy() {
    if (!shareUrl) return;
    const copied = await copyToClipboard(shareUrl);
    if (copied) toast.success('Link copied');
    else toast.error('Could not copy', 'Select the link and copy it manually.');
  }

  const items: MenuItem[] = [
    {
      label: 'Edit',
      icon: <Pencil size={16} aria-hidden />,
      onSelect: () => router.push(editHref),
    },
    {
      label: 'Preview',
      icon: <Eye size={16} aria-hidden />,
      onSelect: () => router.push(previewHref),
    },
    {
      label: busy === 'download' ? 'Preparing PDF…' : 'Download PDF',
      icon: <Download size={16} aria-hidden />,
      disabled: busy === 'download',
      onSelect: () => void handleDownload(),
    },
    {
      label: 'Duplicate',
      icon: <Copy size={16} aria-hidden />,
      disabled: busy === 'duplicate',
      onSelect: () => void handleDuplicate(),
      separatorBefore: true,
    },
    {
      label: 'Rename…',
      icon: <Pencil size={16} aria-hidden />,
      onSelect: () => {
        setRenameValue(cv.title);
        setRenameError(undefined);
        setRenameOpen(true);
      },
    },
    {
      label: isPublic ? 'Sharing…' : 'Share…',
      icon: <Share2 size={16} aria-hidden />,
      onSelect: () => setShareOpen(true),
    },
    {
      label: 'Delete…',
      icon: <Trash2 size={16} aria-hidden />,
      tone: 'danger',
      separatorBefore: true,
      onSelect: () => setDeleteOpen(true),
    },
  ];

  return (
    <div className={cn('flex items-center gap-2', className)}>
      {layout === 'bar' ? (
        <>
          <ButtonLink href={editHref} size="sm" leadingIcon={<Pencil size={15} aria-hidden />}>
            Edit
          </ButtonLink>
          <Button
            size="sm"
            variant="outline"
            loading={busy === 'download'}
            leadingIcon={<Download size={15} aria-hidden />}
            onClick={() => void handleDownload()}
          >
            Download PDF
          </Button>
          <Button
            size="sm"
            variant="outline"
            leadingIcon={<Share2 size={15} aria-hidden />}
            onClick={() => setShareOpen(true)}
            className="hidden sm:inline-flex"
          >
            Share
          </Button>
        </>
      ) : null}

      <DropdownMenu
        ariaLabel={`Actions for ${cv.title}`}
        items={items}
        trigger={({ open }) => (
          <span
            className={cn(
              'grid size-9 place-items-center rounded-lg border border-ink-200 bg-white text-ink-600 transition-colors',
              open ? 'border-ink-300 bg-ink-100 text-ink-900' : 'hover:bg-ink-100 hover:text-ink-900',
            )}
          >
            {busy && busy !== 'download' ? (
              <Spinner size={15} />
            ) : (
              <MoreHorizontal size={17} aria-hidden />
            )}
          </span>
        )}
      />

      <Modal
        open={renameOpen}
        onClose={() => setRenameOpen(false)}
        title="Rename CV"
        description="Only you see this name — it is not printed on the document."
        size="sm"
        footer={
          <>
            <Button variant="outline" onClick={() => setRenameOpen(false)} disabled={busy === 'rename'}>
              Cancel
            </Button>
            <Button loading={busy === 'rename'} onClick={() => void handleRename()}>
              Save name
            </Button>
          </>
        }
      >
        <Field label="CV name" error={renameError}>
          {({ id, describedBy, invalid }) => (
            <Input
              id={id}
              aria-describedby={describedBy}
              invalid={invalid}
              value={renameValue}
              maxLength={120}
              data-autofocus
              onChange={(event) => setRenameValue(event.target.value)}
              onKeyDown={(event) => {
                if (event.key === 'Enter') void handleRename();
              }}
            />
          )}
        </Field>
      </Modal>

      <Modal
        open={shareOpen}
        onClose={() => setShareOpen(false)}
        title="Share this CV"
        description="Publishing creates a read-only page at an unguessable address. Turn it off at any time."
        size="md"
      >
        <div className="flex flex-col gap-4">
          {canShare ? null : (
            <Alert
              tone="info"
              title="Public links are a Pro feature"
              action={
                <ButtonLink href="/pricing" size="sm">
                  See plans
                </ButtonLink>
              }
            >
              Upgrade to publish your CV at a link you can put in an e-mail or a job
              application.
            </Alert>
          )}

          <Switch
            checked={isPublic}
            disabled={busy === 'share' || (!canShare && !isPublic)}
            onCheckedChange={(next) => void handleShareToggle(next)}
            label="Anyone with the link can view this CV"
            hint={
              isPublic
                ? 'The page is live now.'
                : 'Nothing is published until you turn this on.'
            }
          />

          {busy === 'share' ? (
            <p className="flex items-center gap-2 text-sm text-ink-600">
              <Spinner size={14} /> Updating the link…
            </p>
          ) : null}

          {isPublic && shareUrl ? (
            <div className="flex flex-col gap-2">
              <p className="text-sm font-medium text-ink-800">Your public link</p>
              <div className="flex flex-col gap-2 sm:flex-row">
                <Input readOnly value={shareUrl} className="font-mono text-xs" />
                <Button
                  variant="outline"
                  leadingIcon={<Link2 size={15} aria-hidden />}
                  onClick={() => void handleCopy()}
                  className="shrink-0"
                >
                  Copy link
                </Button>
              </div>
            </div>
          ) : null}
        </div>
      </Modal>

      <ConfirmDialog
        open={deleteOpen}
        onClose={() => setDeleteOpen(false)}
        onConfirm={() => void handleDelete()}
        loading={busy === 'delete'}
        title={`Delete “${cv.title}”?`}
        description={`“${cv.title}” and everything in it will be permanently removed. This cannot be undone.`}
        confirmLabel="Delete CV"
      />
    </div>
  );
}
