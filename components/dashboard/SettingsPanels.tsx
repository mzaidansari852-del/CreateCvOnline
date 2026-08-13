'use client';

import { useState } from 'react';
import { Download, Save, TriangleAlert } from 'lucide-react';

import { Button, ButtonLink, Spinner } from '@/components/ui/button';
import { Alert } from '@/components/ui/feedback';
import { Field, Input, SegmentedControl, Select } from '@/components/ui/form';
import { Modal } from '@/components/ui/modal';
import { useToast } from '@/components/ui/toast';
import { useHydrated } from '@/hooks/browser';
import { apiRequest, useApiErrorToast } from './api';
import {
  usePreferences,
  writePreferences,
  type DashboardPreferences,
} from './preferences';
import { site } from '@/lib/site';
import type { CVDocument, CVSummary, PaperSize } from '@/types/cv';

/* -------------------------------------------------------------------------- */
/* New-CV defaults                                                             */
/* -------------------------------------------------------------------------- */

export interface TemplateChoice {
  id: string;
  name: string;
  categoryLabel: string;
  premium: boolean;
}

/**
 * Defaults applied to every CV created from this browser.
 *
 * Stored in `localStorage` because there is no preferences endpoint. That is stated
 * plainly in the UI rather than implied, so nobody expects these to follow them to
 * another device.
 */
export function NewCVDefaultsForm({
  templates,
  defaultTemplateName,
  canUsePremium,
}: {
  templates: TemplateChoice[];
  /** Name of the template used when no explicit default is chosen. */
  defaultTemplateName: string;
  canUsePremium: boolean;
}) {
  const toast = useToast();
  const loaded = useHydrated();
  const [saving, setSaving] = useState(false);

  // Seed the form from the stored value, then let the user edit freely. Syncing during
  // render (not in an effect) means the inputs never flash the defaults first.
  const stored = usePreferences();
  const [draft, setDraft] = useState<{ value: DashboardPreferences; from: DashboardPreferences }>({
    value: stored,
    from: stored,
  });
  if (draft.from !== stored) setDraft({ value: stored, from: stored });
  const preferences = draft.value;
  const setPreferences = (
    next: DashboardPreferences | ((current: DashboardPreferences) => DashboardPreferences),
  ) =>
    setDraft((current) => ({
      ...current,
      value: typeof next === 'function' ? next(current.value) : next,
    }));

  const selectable = templates.filter((template) => !template.premium || canUsePremium);

  function save() {
    setSaving(true);
    const stored = writePreferences(preferences);
    setSaving(false);
    if (stored) {
      toast.success('Defaults saved', 'They apply to the next CV you create in this browser.');
    } else {
      toast.error(
        'Could not save on this device',
        'Your browser is blocking local storage — private browsing usually does.',
      );
    }
  }

  if (!loaded) {
    return (
      <p className="flex items-center gap-2 text-sm text-ink-600">
        <Spinner size={14} /> Reading your saved defaults…
      </p>
    );
  }

  return (
    <div className="flex flex-col gap-5">
      <div className="flex flex-col gap-1.5">
        <span className="text-sm font-medium text-ink-800">Default paper size</span>
        <SegmentedControl<PaperSize>
          label="Default paper size"
          value={preferences.paperSize}
          onChange={(paperSize) => setPreferences((current) => ({ ...current, paperSize }))}
          options={[
            { value: 'a4', label: 'A4', title: '210 × 297 mm — standard outside North America' },
            { value: 'letter', label: 'US Letter', title: '8.5 × 11 in — standard in the US and Canada' },
          ]}
          className="self-start"
        />
        <p className="text-xs leading-relaxed text-ink-500">
          Applied when a CV is created. You can still change it per CV in the editor.
        </p>
      </div>

      <Field
        label="Default template for new CVs"
        hint={
          canUsePremium
            ? 'Pre-selected in the new-CV flow.'
            : 'Only free templates can be a default while you are on the Free plan.'
        }
        className="max-w-md"
      >
        {({ id, describedBy }) => (
          <Select
            id={id}
            aria-describedby={describedBy}
            value={preferences.templateId}
            onChange={(event) =>
              setPreferences((current) => ({ ...current, templateId: event.target.value }))
            }
          >
            <option value="">Use the app default ({defaultTemplateName})</option>
            {selectable.map((template) => (
              <option key={template.id} value={template.id}>
                {template.name} — {template.categoryLabel}
              </option>
            ))}
          </Select>
        )}
      </Field>

      <div className="flex flex-wrap items-center gap-3">
        <Button
          size="sm"
          loading={saving}
          leadingIcon={<Save size={15} aria-hidden />}
          onClick={save}
        >
          Save defaults
        </Button>
        <p className="text-xs text-ink-500">
          Saved in this browser only — {site.name} has no endpoint for syncing preferences
          across devices yet.
        </p>
      </div>
    </div>
  );
}

/* -------------------------------------------------------------------------- */
/* Data export                                                                 */
/* -------------------------------------------------------------------------- */

/** Fetches every CV in full and saves them as one JSON file. */
export function ExportDataButton() {
  const toast = useToast();
  const showError = useApiErrorToast();
  const [busy, setBusy] = useState(false);
  const [progress, setProgress] = useState<string | null>(null);

  async function exportAll() {
    setBusy(true);
    setProgress('Listing your CVs…');
    try {
      const { cvs } = await apiRequest<{ cvs: CVSummary[] }>('/api/cvs');

      if (cvs.length === 0) {
        toast.info('Nothing to export', 'You have not saved a CV yet.');
        return;
      }

      // Four at a time: the read endpoint is rate limited, and a burst of 60+ parallel
      // requests would be throttled halfway through and produce a partial file.
      const documents: CVDocument[] = [];
      const failed: string[] = [];
      const queue = [...cvs];

      async function worker() {
        for (;;) {
          const next = queue.shift();
          if (!next) return;
          setProgress(`Exporting ${documents.length + 1} of ${cvs.length}…`);
          try {
            const { cv } = await apiRequest<{ cv: CVDocument }>(`/api/cvs/${next.id}`);
            documents.push(cv);
          } catch {
            failed.push(next.title);
          }
        }
      }

      await Promise.all(Array.from({ length: Math.min(4, cvs.length) }, worker));

      const payload = {
        exportedAt: new Date().toISOString(),
        source: site.url,
        format: 'createcvonline.cv-export.v1',
        count: documents.length,
        cvs: documents,
      };

      const blob = new Blob([JSON.stringify(payload, null, 2)], { type: 'application/json' });
      const objectUrl = URL.createObjectURL(blob);
      const anchor = document.createElement('a');
      anchor.href = objectUrl;
      anchor.download = `createcvonline-export-${new Date().toISOString().slice(0, 10)}.json`;
      document.body.appendChild(anchor);
      anchor.click();
      anchor.remove();
      setTimeout(() => URL.revokeObjectURL(objectUrl), 4000);

      if (failed.length > 0) {
        toast.warning(
          `Exported ${documents.length} of ${cvs.length}`,
          `Could not read: ${failed.join(', ')}. Try again in a minute.`,
        );
      } else {
        toast.success(
          'Export ready',
          `${documents.length} CV${documents.length === 1 ? '' : 's'} saved as JSON.`,
        );
      }
    } catch (error) {
      showError(error, 'Could not export your CVs');
    } finally {
      setBusy(false);
      setProgress(null);
    }
  }

  return (
    <div className="flex flex-wrap items-center gap-3">
      <Button
        variant="outline"
        size="sm"
        loading={busy}
        leadingIcon={<Download size={15} aria-hidden />}
        onClick={() => void exportAll()}
      >
        Download all my CVs as JSON
      </Button>
      {progress ? (
        <span className="text-xs text-ink-600" role="status">
          {progress}
        </span>
      ) : null}
    </div>
  );
}

/* -------------------------------------------------------------------------- */
/* Danger zone                                                                 */
/* -------------------------------------------------------------------------- */

/**
 * Account deletion.
 *
 * There is no delete-account endpoint, so this does not pretend to delete anything: it
 * confirms intent, then hands over to a pre-filled support request. The confirmation
 * still requires the e-mail address to be typed, because the next screen is a real
 * request that a human will action.
 */
export function DeleteAccountPanel({ email }: { email: string }) {
  const [open, setOpen] = useState(false);
  const [typed, setTyped] = useState('');

  const matches = typed.trim().toLowerCase() === email.trim().toLowerCase() && email.length > 0;
  const contactHref = `/contact?subject=${encodeURIComponent('Account deletion request')}&message=${encodeURIComponent(
    `Please delete my ${site.name} account (${email}) and everything stored under it: my saved CVs, my payment history and my profile.`,
  )}`;

  return (
    <>
      <div className="flex flex-wrap items-start justify-between gap-4 rounded-xl border border-danger-500/25 bg-danger-50 p-4">
        <div className="min-w-0">
          <p className="flex items-center gap-2 text-sm font-semibold text-danger-700">
            <TriangleAlert size={16} aria-hidden />
            Delete my account
          </p>
          <p className="mt-1 max-w-xl text-[13px] leading-relaxed text-danger-700/85">
            Removes your profile, every saved CV and your payment history. There is no
            self-service deletion yet, so this opens a pre-filled request to our support
            team — we action it by hand and confirm by e-mail.
          </p>
        </div>
        <Button variant="danger" size="sm" onClick={() => setOpen(true)}>
          Delete account…
        </Button>
      </div>

      <Modal
        open={open}
        onClose={() => setOpen(false)}
        title="Delete your account"
        description="This cannot be undone. Type your e-mail address to confirm you mean it."
        size="sm"
        dismissOnBackdrop={false}
        footer={
          <>
            <Button variant="outline" onClick={() => setOpen(false)}>
              Cancel
            </Button>
            {matches ? (
              <ButtonLink href={contactHref} variant="danger">
                Continue to request
              </ButtonLink>
            ) : (
              <Button variant="danger" disabled>
                Continue to request
              </Button>
            )}
          </>
        }
      >
        <div className="flex flex-col gap-4">
          <Alert tone="warning" title="Nothing is deleted on this screen">
            {site.name} has no automated deletion endpoint. Confirming here takes you to a
            pre-filled support request; your data is removed once our team processes it.
          </Alert>

          <Field
            label={`Type ${email} to confirm`}
            error={typed.length > 0 && !matches ? 'That does not match your e-mail address.' : undefined}
          >
            {({ id, describedBy, invalid }) => (
              <Input
                id={id}
                aria-describedby={describedBy}
                invalid={invalid}
                value={typed}
                autoComplete="off"
                spellCheck={false}
                data-autofocus
                onChange={(event) => setTyped(event.target.value)}
              />
            )}
          </Field>
        </div>
      </Modal>
    </>
  );
}
