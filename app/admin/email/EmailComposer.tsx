'use client';

import { useCallback, useState } from 'react';

import { Button } from '@/components/ui/button';
import { Alert, Badge } from '@/components/ui/feedback';
import { Field, Input, Select, Textarea } from '@/components/ui/form';
import { Panel } from '@/components/ui/card';
import { useToast } from '@/components/ui/toast';
import { LOCALES, LOCALE_META, type Locale } from '@/lib/i18n/locales';
import type { AudienceSummary } from '@/lib/db/audience';

/**
 * Compose, preview and send an announcement.
 *
 * The shape of this page is an argument about sending order: **preview, then test, then
 * send**, in that order, with send last and behind a confirmation. A campaign cannot be
 * recalled, and the mistakes worth designing against are not typos — they are sending the
 * wrong template, sending in the wrong language, and sending to more people than you
 * thought.
 */

interface TemplateSummary {
  id: string;
  name: string;
  description: string;
  requiresOffer: boolean;
}

interface SendResult {
  sent: number;
  total?: number;
  failed?: { email: string; reason: string }[];
  to?: string;
  note?: string;
}

export function EmailComposer({
  templates,
  audience,
  offerActive,
  smtpConfigured,
  smtpFrom,
}: {
  templates: TemplateSummary[];
  audience: AudienceSummary | null;
  offerActive: boolean;
  smtpConfigured: boolean;
  smtpFrom: string | null;
}) {
  const toast = useToast();

  const [templateId, setTemplateId] = useState(templates[0]?.id ?? 'plain');
  const [locale, setLocale] = useState<Locale>('en');
  const [subject, setSubject] = useState('');
  const [heading, setHeading] = useState('');
  const [body, setBody] = useState('');

  const [preview, setPreview] = useState<{ subject: string; html: string } | null>(null);
  const [busy, setBusy] = useState<null | 'preview' | 'test' | 'send'>(null);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<SendResult | null>(null);
  const [confirming, setConfirming] = useState(false);

  const template = templates.find((t) => t.id === templateId) ?? null;
  const needsOffer = Boolean(template?.requiresOffer) && !offerActive;
  const writesOwnCopy = templateId === 'plain' || templateId === 'product-update';
  const total = audience?.total ?? 0;

  const call = useCallback(
    async (action: 'preview' | 'test' | 'send') => {
      setBusy(action);
      setError(null);
      if (action !== 'preview') setResult(null);

      try {
        const response = await fetch('/api/admin/email', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            action,
            templateId,
            locale,
            subject,
            heading,
            body,
            ...(action === 'send' ? { expectedRecipients: total } : {}),
          }),
        });
        const payload = (await response.json().catch(() => null)) as
          | {
              preview?: { subject: string; html: string };
              sent?: number;
              total?: number;
              failed?: { email: string; reason: string }[];
              to?: string;
              note?: string;
              error?: { message?: string };
            }
          | null;

        if (!response.ok) {
          setError(payload?.error?.message ?? 'That did not work.');
          setBusy(null);
          return;
        }

        if (action === 'preview' && payload?.preview) setPreview(payload.preview);
        if (action === 'test') {
          setResult({ sent: payload?.sent ?? 0, to: payload?.to, note: payload?.note });
          toast.success('Test sent', `Check ${payload?.to ?? 'your inbox'}.`);
        }
        if (action === 'send') {
          setResult({
            sent: payload?.sent ?? 0,
            total: payload?.total,
            failed: payload?.failed ?? [],
          });
          setConfirming(false);
          toast.success('Campaign sent', `${payload?.sent ?? 0} of ${payload?.total ?? 0} delivered.`);
        }
      } catch {
        setError('We could not reach the server.');
      }
      setBusy(null);
    },
    [templateId, locale, subject, heading, body, total, toast],
  );

  /**
   * Changing what would be sent invalidates both the preview and any pending confirmation.
   *
   * Done here rather than in an effect: this is a consequence of the user's action, not a
   * synchronisation with anything outside React, and an effect would re-render twice to
   * reach the same place. It also matters that a half-confirmed send is cancelled by
   * switching template — otherwise "Yes, send to 143" could carry over to a template the
   * admin only meant to glance at.
   */
  const choose = useCallback((next: { templateId?: string; locale?: Locale }) => {
    if (next.templateId !== undefined) setTemplateId(next.templateId);
    if (next.locale !== undefined) setLocale(next.locale);
    setPreview(null);
    setConfirming(false);
  }, []);

  return (
    <div className="space-y-6">
      {!smtpConfigured ? (
        <Alert tone="danger" title="No mail transport configured">
          Set <code>SMTP_HOST</code>, <code>SMTP_USER</code> and <code>SMTP_PASSWORD</code>.
          You can still preview; nothing can be sent.
        </Alert>
      ) : null}

      <Panel title="Audience">
        {audience ? (
          <>
            <p className="text-sm leading-relaxed text-ink-700">
              <strong className="font-semibold">{total.toLocaleString('en')}</strong> people have
              opted in to product e-mail. That is the whole audience — there is no option to
              send to users who did not opt in.
            </p>
            <div className="mt-3 flex flex-wrap gap-2">
              {LOCALES.map((code) => (
                <Badge key={code} tone={audience.byLocale[code] ? 'brand' : 'neutral'}>
                  {LOCALE_META[code].label}: {audience.byLocale[code]}
                </Badge>
              ))}
            </div>
            {audience.skipped > 0 ? (
              <p className="mt-3 text-xs text-ink-500">
                {audience.skipped} opted-in{' '}
                {audience.skipped === 1 ? 'profile has' : 'profiles have'} no usable address and{' '}
                {audience.skipped === 1 ? 'is' : 'are'} excluded.
              </p>
            ) : null}
            <p className="mt-3 text-xs leading-relaxed text-ink-500">
              Each person is written to in their own language. Sending takes roughly{' '}
              {Math.ceil((total * 1.2) / 60)} minute{Math.ceil((total * 1.2) / 60) === 1 ? '' : 's'}{' '}
              — messages go one at a time so the mailbox is not rate-limited.
            </p>
          </>
        ) : (
          <p className="text-sm text-ink-600">The audience could not be read.</p>
        )}
      </Panel>

      <Panel title="Message">
        {error ? (
          <Alert tone="danger" className="mb-4">
            {error}
          </Alert>
        ) : null}

        <div className="grid gap-4 sm:grid-cols-2">
          <Field label="Template" hint={template?.description}>
            {({ id, describedBy }) => (
              <Select
                id={id}
                aria-describedby={describedBy}
                value={templateId}
                onChange={(event) => choose({ templateId: event.target.value })}
              >
                {templates.map((t) => (
                  <option key={t.id} value={t.id}>
                    {t.name}
                  </option>
                ))}
              </Select>
            )}
          </Field>

          <Field
            label="Preview language"
            hint="Preview only. A real send uses each recipient's own language."
          >
            {({ id, describedBy }) => (
              <Select
                id={id}
                aria-describedby={describedBy}
                value={locale}
                onChange={(event) => choose({ locale: event.target.value as Locale })}
              >
                {LOCALES.map((code) => (
                  <option key={code} value={code}>
                    {LOCALE_META[code].label}
                  </option>
                ))}
              </Select>
            )}
          </Field>
        </div>

        {needsOffer ? (
          <Alert tone="warning" className="mt-4">
            This template quotes the offer price and no offer is running. Switch one on under
            Offers, or choose another template.
          </Alert>
        ) : null}

        {writesOwnCopy ? (
          <div className="mt-4 space-y-4">
            <Field label="Subject">
              {({ id }) => (
                <Input
                  id={id}
                  value={subject}
                  maxLength={200}
                  placeholder="Six new templates this week"
                  onChange={(event) => setSubject(event.target.value)}
                />
              )}
            </Field>
            <Field label="Heading">
              {({ id }) => (
                <Input
                  id={id}
                  value={heading}
                  maxLength={200}
                  placeholder="Six new templates"
                  onChange={(event) => setHeading(event.target.value)}
                />
              )}
            </Field>
            <Field
              label="Body"
              hint="A blank line starts a new paragraph. Written once and sent as-is — this part is not translated per recipient."
            >
              {({ id, describedBy }) => (
                <Textarea
                  id={id}
                  aria-describedby={describedBy}
                  value={body}
                  rows={7}
                  maxLength={5000}
                  onChange={(event) => setBody(event.target.value)}
                />
              )}
            </Field>
          </div>
        ) : (
          <p className="mt-4 text-sm leading-relaxed text-ink-600">
            This template writes itself from the running offer — the plan, the price, the
            saving and the seat count — in each recipient&apos;s language. There is nothing to
            fill in. Preview it to see the wording.
          </p>
        )}

        <div className="mt-6 flex flex-wrap items-center gap-3">
          <Button variant="outline" onClick={() => void call('preview')} loading={busy === 'preview'}>
            Preview
          </Button>
          <Button
            variant="outline"
            onClick={() => void call('test')}
            loading={busy === 'test'}
            disabled={!smtpConfigured || needsOffer}
          >
            Send a test to myself
          </Button>
        </div>
      </Panel>

      {preview ? (
        <Panel title="Preview" description={`Subject: ${preview.subject}`}>
          {/*
            An iframe, not dangerouslySetInnerHTML. The e-mail carries its own document with
            its own styles, and injecting that into the admin page would let it restyle the
            console around it — and would make the preview a lie, since the layout would
            inherit from this page rather than standing alone the way it will in a client.
            `sandbox` with nothing enabled means it cannot script or navigate.
          */}
          <iframe
            title="Email preview"
            sandbox=""
            srcDoc={preview.html}
            className="h-[560px] w-full rounded-lg border border-ink-200 bg-white"
          />
        </Panel>
      ) : null}

      <Panel title="Send">
        {result && result.total !== undefined ? (
          <Alert tone={result.failed?.length ? 'warning' : 'success'} className="mb-4">
            <strong className="font-semibold">
              {result.sent} of {result.total} delivered.
            </strong>
            {result.failed?.length ? (
              <ul className="mt-2 space-y-1 text-xs">
                {result.failed.slice(0, 10).map((failure) => (
                  <li key={failure.email}>
                    {failure.email} — {failure.reason}
                  </li>
                ))}
              </ul>
            ) : null}
          </Alert>
        ) : null}

        {result && result.to ? (
          <Alert tone="success" className="mb-4">
            Test sent to {result.to}. {result.note}
          </Alert>
        ) : null}

        {confirming ? (
          <Alert tone="warning" title={`Send to ${total} people?`}>
            <p className="text-sm leading-relaxed">
              This cannot be undone or recalled. Each person gets it in their own language.
              Send a test to yourself first if you have not.
            </p>
            <div className="mt-4 flex flex-wrap gap-3">
              <Button onClick={() => void call('send')} loading={busy === 'send'}>
                Yes — send to {total}
              </Button>
              <Button variant="ghost" onClick={() => setConfirming(false)} disabled={busy === 'send'}>
                Cancel
              </Button>
            </div>
          </Alert>
        ) : (
          <>
            <p className="text-sm leading-relaxed text-ink-700">
              Sends from{' '}
              <strong className="font-semibold">{smtpFrom ?? 'no address configured'}</strong> to
              all {total} opted-in members, each in their own language.
            </p>
            <Button
              className="mt-4"
              onClick={() => setConfirming(true)}
              disabled={!smtpConfigured || needsOffer || total === 0}
            >
              Send to everyone
            </Button>
          </>
        )}

        <p className="mt-5 border-t border-ink-100 pt-4 text-xs leading-relaxed text-ink-500">
          Every message carries an unsubscribe link and the one-click unsubscribe header mail
          clients use. Someone who unsubscribes is removed from the audience immediately and
          stays out of every later send — but still receives e-mail about payments, passwords
          and their account.
        </p>
      </Panel>
    </div>
  );
}
