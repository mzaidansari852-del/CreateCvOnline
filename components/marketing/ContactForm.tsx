'use client';

import { useState } from 'react';
import Link from 'next/link';

import { Button } from '@/components/ui/button';
import { Alert } from '@/components/ui/feedback';
import { Field, Input, Select, Textarea } from '@/components/ui/form';
import { useToast } from '@/components/ui/toast';
import { site } from '@/lib/site';

/**
 * The contact form.
 *
 * Posts to `/api/contact`, which writes the message to Firestore. Validation is
 * duplicated deliberately: the client copy exists so the user gets an inline error
 * without a round trip, and the server copy is the one that actually decides. When the
 * server rejects a field we have not caught, its `issues` are mapped straight back onto
 * the matching inputs rather than shown as one opaque banner.
 */

const SUBJECTS = [
  'Question about a plan or a payment',
  'Refund request',
  'Problem downloading a PDF',
  'Trouble signing in',
  'Bug report',
  'Template or feature request',
  'Delete my account or export my data',
  'Press or partnership',
  'Something else',
] as const;

const MESSAGE_MIN = 10;
const MESSAGE_MAX = 4000;

interface FormValues {
  name: string;
  email: string;
  subject: string;
  message: string;
  /** Honeypot. Always submitted, and always empty for a human. */
  company: string;
}

type FieldName = Exclude<keyof FormValues, 'company'>;
type FieldErrors = Partial<Record<FieldName, string>>;

const EMPTY: FormValues = { name: '', email: '', subject: '', message: '', company: '' };

/** Deliberately permissive — the server and the mailbox are the real authorities. */
const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;

function validate(values: FormValues): FieldErrors {
  const errors: FieldErrors = {};

  if (!values.name.trim()) errors.name = 'Tell us who you are so we know how to reply.';
  else if (values.name.trim().length > 120) errors.name = 'Please keep your name under 120 characters.';

  if (!values.email.trim()) errors.email = 'We need an e-mail address to reply to.';
  else if (!EMAIL_PATTERN.test(values.email.trim()))
    errors.email = 'That does not look like an e-mail address.';
  else if (values.email.trim().length > 200) errors.email = 'That e-mail address is too long.';

  if (!values.subject) errors.subject = 'Pick the topic that fits best.';

  const message = values.message.trim();
  if (!message) errors.message = 'Please describe what you need help with.';
  else if (message.length < MESSAGE_MIN)
    errors.message = `A few more words would help — at least ${MESSAGE_MIN} characters.`;
  else if (message.length > MESSAGE_MAX)
    errors.message = `Please keep it under ${MESSAGE_MAX} characters.`;

  return errors;
}

interface ApiErrorBody {
  error?: {
    code?: string;
    message?: string;
    details?: { issues?: { path?: string; message?: string }[] };
  };
}

export function ContactForm() {
  const toast = useToast();
  const [values, setValues] = useState<FormValues>(EMPTY);
  const [errors, setErrors] = useState<FieldErrors>({});
  const [submitting, setSubmitting] = useState(false);
  const [sent, setSent] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);

  const update = (field: keyof FormValues, value: string) => {
    setValues((current) => ({ ...current, [field]: value }));
    if (field !== 'company' && errors[field]) {
      setErrors((current) => ({ ...current, [field]: undefined }));
    }
  };

  const onSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setFormError(null);

    const nextErrors = validate(values);
    if (Object.keys(nextErrors).length > 0) {
      setErrors(nextErrors);
      toast.error('Check the form', 'A couple of fields still need your attention.');
      return;
    }

    setSubmitting(true);
    try {
      const response = await fetch('/api/contact', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: values.name.trim(),
          email: values.email.trim(),
          subject: values.subject,
          message: values.message.trim(),
          company: values.company,
        }),
      });

      const payload = (await response.json().catch(() => null)) as ApiErrorBody | null;

      if (!response.ok) {
        const issues = payload?.error?.details?.issues ?? [];
        const mapped: FieldErrors = {};
        for (const issue of issues) {
          const path = issue.path ?? '';
          if (path === 'name' || path === 'email' || path === 'subject' || path === 'message') {
            mapped[path] = issue.message ?? 'This value is not valid.';
          }
        }

        if (Object.keys(mapped).length > 0) {
          setErrors(mapped);
          toast.error('Check the form', 'Some values were rejected.');
          return;
        }

        const message =
          payload?.error?.message ??
          'We could not send that message. Please try again in a moment.';
        setFormError(message);
        toast.error('Message not sent', message);
        return;
      }

      setSent(true);
      setValues(EMPTY);
      setErrors({});
      toast.success('Message sent', 'We reply to everything within two working days.');
    } catch {
      const message =
        'We could not reach the server. Check your connection and try again, or e-mail us directly.';
      setFormError(message);
      toast.error('Message not sent', message);
    } finally {
      setSubmitting(false);
    }
  };

  if (sent) {
    return (
      <div className="rounded-2xl border border-success-500/25 bg-success-50 p-6 sm:p-8">
        <div className="flex items-start gap-3">
          <svg
            className="mt-0.5 size-6 shrink-0 text-success-600"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.8"
            aria-hidden
          >
            <circle cx="12" cy="12" r="9" />
            <path d="m8.5 12.3 2.4 2.4 4.6-4.9" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
          <div>
            <h3 className="text-lg font-bold text-success-700">Message sent</h3>
            <p className="mt-2 text-sm leading-relaxed text-ink-700">
              Thank you — it is in our inbox. We answer every message within two working days,
              and usually much faster. The reply will come from{' '}
              <a
                href={`mailto:${site.supportEmail}`}
                className="font-medium text-brand-700 underline underline-offset-2"
              >
                {site.supportEmail}
              </a>
              , so add that address to your contacts if your provider is aggressive about spam.
            </p>
            <Button
              variant="outline"
              className="mt-5"
              onClick={() => {
                setSent(false);
                setFormError(null);
              }}
            >
              Send another message
            </Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <form onSubmit={onSubmit} noValidate className="relative flex flex-col gap-5">
      {formError ? (
        <Alert tone="danger" title="We could not send that">
          {formError} You can always reach us directly at{' '}
          <a href={`mailto:${site.supportEmail}`} className="font-medium underline underline-offset-2">
            {site.supportEmail}
          </a>
          .
        </Alert>
      ) : null}

      <div className="grid gap-5 sm:grid-cols-2">
        <Field label="Your name" required error={errors.name}>
          {({ id, describedBy, invalid }) => (
            <Input
              id={id}
              name="name"
              autoComplete="name"
              maxLength={120}
              placeholder="Amina Chraibi"
              value={values.name}
              invalid={invalid}
              aria-describedby={describedBy}
              onChange={(event) => update('name', event.target.value)}
            />
          )}
        </Field>

        <Field
          label="E-mail address"
          required
          error={errors.email}
          hint="We only use it to reply to you."
        >
          {({ id, describedBy, invalid }) => (
            <Input
              id={id}
              name="email"
              type="email"
              inputMode="email"
              autoComplete="email"
              maxLength={200}
              placeholder="you@example.com"
              value={values.email}
              invalid={invalid}
              aria-describedby={describedBy}
              onChange={(event) => update('email', event.target.value)}
            />
          )}
        </Field>
      </div>

      <Field label="What is this about?" required error={errors.subject}>
        {({ id, describedBy, invalid }) => (
          <Select
            id={id}
            name="subject"
            value={values.subject}
            invalid={invalid}
            aria-describedby={describedBy}
            onChange={(event) => update('subject', event.target.value)}
          >
            <option value="">Choose a topic…</option>
            {SUBJECTS.map((subject) => (
              <option key={subject} value={subject}>
                {subject}
              </option>
            ))}
          </Select>
        )}
      </Field>

      <Field
        label="Message"
        required
        error={errors.message}
        hint="If something went wrong, tell us which page you were on and what you expected to happen — it saves a round trip."
      >
        {({ id, describedBy, invalid }) => (
          <Textarea
            id={id}
            name="message"
            rows={7}
            maxLength={MESSAGE_MAX}
            placeholder="Describe what you need…"
            value={values.message}
            invalid={invalid}
            aria-describedby={describedBy}
            onChange={(event) => update('message', event.target.value)}
          />
        )}
      </Field>

      {/* Honeypot. Hidden from people and from screen readers; bots fill it in. */}
      <div aria-hidden className="absolute -left-[9999px] size-0 overflow-hidden">
        <label htmlFor="contact-company">Company (leave this field empty)</label>
        <input
          id="contact-company"
          name="company"
          type="text"
          tabIndex={-1}
          autoComplete="off"
          value={values.company}
          onChange={(event) => update('company', event.target.value)}
        />
      </div>

      <div className="flex flex-wrap items-center gap-4">
        <Button type="submit" size="lg" loading={submitting}>
          {submitting ? 'Sending…' : 'Send message'}
        </Button>
        <p className="text-[13px] text-ink-500">
          {values.message.trim().length}/{MESSAGE_MAX} characters
        </p>
      </div>

      <p className="text-[13px] leading-relaxed text-ink-500">
        By sending this form you agree that we may store your message and reply to it. We do not
        add you to a mailing list. See the{' '}
        <Link href="/privacy" className="font-medium text-brand-700 underline underline-offset-2">
          privacy policy
        </Link>{' '}
        for how long we keep it.
      </p>
    </form>
  );
}
