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
 *
 * ## Language
 *
 * Every string here was hardcoded English, which is why the French contact page could not
 * exist until now: a French page whose only interactive element is an English form is worse
 * than no French page. The words come from `COPY` and the register follows the rest of the
 * French site — `vous`, and `e-mail` rather than `courriel`, which is what people actually
 * write.
 *
 * What is *not* translated is the value each subject option submits. Those stay English on
 * purpose: they are data, they land in a support inbox and a Firestore collection that are
 * read in one language, and translating them would split every category in two the moment a
 * French visitor used the form. The label is localised; the value is stable.
 */

interface Subject {
  /** Submitted and stored. English in every language — see the note above. */
  value: string;
  label: Record<string, string>;
}

const SUBJECTS: Subject[] = [
  {
    value: 'Question about a plan or a payment',
    label: {
      en: 'Question about a plan or a payment',
      fr: 'Question sur une offre ou un paiement',
    },
  },
  {
    value: 'Refund request',
    label: { en: 'Refund request', fr: 'Demande de remboursement' },
  },
  {
    value: 'Problem downloading a PDF',
    label: { en: 'Problem downloading a PDF', fr: 'Problème de téléchargement du PDF' },
  },
  {
    value: 'Trouble signing in',
    label: { en: 'Trouble signing in', fr: 'Problème de connexion' },
  },
  {
    value: 'Bug report',
    label: { en: 'Bug report', fr: 'Signaler un dysfonctionnement' },
  },
  {
    value: 'Template or feature request',
    label: {
      en: 'Template or feature request',
      fr: 'Suggestion de modèle ou de fonctionnalité',
    },
  },
  {
    value: 'Delete my account or export my data',
    label: {
      en: 'Delete my account or export my data',
      fr: 'Supprimer mon compte ou exporter mes données',
    },
  },
  {
    value: 'Press or partnership',
    label: { en: 'Press or partnership', fr: 'Presse ou partenariat' },
  },
  { value: 'Something else', label: { en: 'Something else', fr: 'Autre sujet' } },
];

const MESSAGE_MIN = 10;
const MESSAGE_MAX = 4000;

interface ContactCopy {
  nameRequired: string;
  nameTooLong: string;
  emailRequired: string;
  emailInvalid: string;
  emailTooLong: string;
  subjectRequired: string;
  messageRequired: string;
  messageTooShort: (min: number) => string;
  messageTooLong: (max: number) => string;
  invalidValue: string;
  checkFormTitle: string;
  checkFormBody: string;
  rejectedBody: string;
  sendFailedFallback: string;
  notSentTitle: string;
  offline: string;
  sentToastTitle: string;
  sentToastBody: string;
  sentTitle: string;
  sentBodyBefore: string;
  sentBodyAfter: string;
  sendAnother: string;
  formErrorTitle: string;
  formErrorReachUs: string;
  nameLabel: string;
  namePlaceholder: string;
  emailLabel: string;
  emailHint: string;
  emailPlaceholder: string;
  subjectLabel: string;
  subjectPlaceholder: string;
  messageLabel: string;
  messageHint: string;
  messagePlaceholder: string;
  honeypotLabel: string;
  submit: string;
  submitting: string;
  characters: string;
  consentBefore: string;
  privacyLink: string;
  consentAfter: string;
  privacyPath: string;
}

const COPY: Record<string, ContactCopy> = {
  en: {
    nameRequired: 'Tell us who you are so we know how to reply.',
    nameTooLong: 'Please keep your name under 120 characters.',
    emailRequired: 'We need an e-mail address to reply to.',
    emailInvalid: 'That does not look like an e-mail address.',
    emailTooLong: 'That e-mail address is too long.',
    subjectRequired: 'Pick the topic that fits best.',
    messageRequired: 'Please describe what you need help with.',
    messageTooShort: (min) => `A few more words would help — at least ${min} characters.`,
    messageTooLong: (max) => `Please keep it under ${max} characters.`,
    invalidValue: 'This value is not valid.',
    checkFormTitle: 'Check the form',
    checkFormBody: 'A couple of fields still need your attention.',
    rejectedBody: 'Some values were rejected.',
    sendFailedFallback: 'We could not send that message. Please try again in a moment.',
    notSentTitle: 'Message not sent',
    offline:
      'We could not reach the server. Check your connection and try again, or e-mail us directly.',
    sentToastTitle: 'Message sent',
    sentToastBody: 'We reply to everything within two working days.',
    sentTitle: 'Message sent',
    sentBodyBefore:
      'Thank you — it is in our inbox. We answer every message within two working days, and usually much faster. The reply will come from',
    sentBodyAfter:
      ', so add that address to your contacts if your provider is aggressive about spam.',
    sendAnother: 'Send another message',
    formErrorTitle: 'We could not send that',
    formErrorReachUs: 'You can always reach us directly at',
    nameLabel: 'Your name',
    namePlaceholder: 'Amina Chraibi',
    emailLabel: 'E-mail address',
    emailHint: 'We only use it to reply to you.',
    emailPlaceholder: 'you@example.com',
    subjectLabel: 'What is this about?',
    subjectPlaceholder: 'Choose a topic…',
    messageLabel: 'Message',
    messageHint:
      'If something went wrong, tell us which page you were on and what you expected to happen — it saves a round trip.',
    messagePlaceholder: 'Describe what you need…',
    honeypotLabel: 'Company (leave this field empty)',
    submit: 'Send message',
    submitting: 'Sending…',
    characters: 'characters',
    consentBefore:
      'By sending this form you agree that we may store your message and reply to it. We do not add you to a mailing list. See the',
    privacyLink: 'privacy policy',
    consentAfter: 'for how long we keep it.',
    privacyPath: '/privacy',
  },
  fr: {
    nameRequired: 'Dites-nous qui vous êtes, pour savoir à qui répondre.',
    nameTooLong: 'Merci de limiter le nom à 120 caractères.',
    emailRequired: 'Il nous faut une adresse e-mail pour vous répondre.',
    emailInvalid: 'Cela ne ressemble pas à une adresse e-mail.',
    emailTooLong: 'Cette adresse e-mail est trop longue.',
    subjectRequired: 'Choisissez le sujet qui correspond le mieux.',
    messageRequired: 'Décrivez ce sur quoi vous avez besoin d’aide.',
    messageTooShort: (min) => `Quelques mots de plus aideraient — au moins ${min} caractères.`,
    messageTooLong: (max) => `Merci de rester sous ${max} caractères.`,
    invalidValue: 'Cette valeur n’est pas valide.',
    checkFormTitle: 'Vérifiez le formulaire',
    checkFormBody: 'Quelques champs demandent encore votre attention.',
    rejectedBody: 'Certaines valeurs ont été refusées.',
    sendFailedFallback:
      'Nous n’avons pas pu envoyer ce message. Réessayez dans un instant.',
    notSentTitle: 'Message non envoyé',
    offline:
      'Nous n’avons pas pu joindre le serveur. Vérifiez votre connexion et réessayez, ou écrivez-nous directement.',
    sentToastTitle: 'Message envoyé',
    sentToastBody: 'Nous répondons à tout sous deux jours ouvrés.',
    sentTitle: 'Message envoyé',
    sentBodyBefore:
      'Merci — il est dans notre boîte. Nous répondons à chaque message sous deux jours ouvrés, et le plus souvent bien plus vite. La réponse viendra de',
    sentBodyAfter:
      ' : ajoutez cette adresse à vos contacts si votre fournisseur filtre agressivement les indésirables.',
    sendAnother: 'Envoyer un autre message',
    formErrorTitle: 'L’envoi a échoué',
    formErrorReachUs: 'Vous pouvez toujours nous écrire directement à',
    nameLabel: 'Votre nom',
    namePlaceholder: 'Amina Chraibi',
    emailLabel: 'Adresse e-mail',
    emailHint: 'Elle sert uniquement à vous répondre.',
    emailPlaceholder: 'vous@exemple.fr',
    subjectLabel: 'De quoi s’agit-il ?',
    subjectPlaceholder: 'Choisissez un sujet…',
    messageLabel: 'Message',
    messageHint:
      'Si quelque chose n’a pas fonctionné, indiquez la page où vous étiez et ce que vous attendiez — cela évite un aller-retour.',
    messagePlaceholder: 'Décrivez votre demande…',
    honeypotLabel: 'Société (laissez ce champ vide)',
    submit: 'Envoyer le message',
    submitting: 'Envoi…',
    characters: 'caractères',
    consentBefore:
      'En envoyant ce formulaire, vous acceptez que nous conservions votre message et y répondions. Vous n’êtes inscrit à aucune liste de diffusion. Consultez la',
    privacyLink: 'politique de confidentialité',
    consentAfter: 'pour savoir combien de temps nous le gardons.',
    privacyPath: '/fr/confidentialite',
  },
};

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

function validate(values: FormValues, copy: ContactCopy): FieldErrors {
  const errors: FieldErrors = {};

  if (!values.name.trim()) errors.name = copy.nameRequired;
  else if (values.name.trim().length > 120) errors.name = copy.nameTooLong;

  if (!values.email.trim()) errors.email = copy.emailRequired;
  else if (!EMAIL_PATTERN.test(values.email.trim())) errors.email = copy.emailInvalid;
  else if (values.email.trim().length > 200) errors.email = copy.emailTooLong;

  if (!values.subject) errors.subject = copy.subjectRequired;

  const message = values.message.trim();
  if (!message) errors.message = copy.messageRequired;
  else if (message.length < MESSAGE_MIN) errors.message = copy.messageTooShort(MESSAGE_MIN);
  else if (message.length > MESSAGE_MAX) errors.message = copy.messageTooLong(MESSAGE_MAX);

  return errors;
}

interface ApiErrorBody {
  error?: {
    code?: string;
    message?: string;
    details?: { issues?: { path?: string; message?: string }[] };
  };
}

export function ContactForm({ locale = 'en' }: { locale?: string }) {
  const copy = COPY[locale] ?? COPY.en!;
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

    const nextErrors = validate(values, copy);
    if (Object.keys(nextErrors).length > 0) {
      setErrors(nextErrors);
      toast.error(copy.checkFormTitle, copy.checkFormBody);
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
            mapped[path] = issue.message ?? copy.invalidValue;
          }
        }

        if (Object.keys(mapped).length > 0) {
          setErrors(mapped);
          toast.error(copy.checkFormTitle, copy.rejectedBody);
          return;
        }

        const message = payload?.error?.message ?? copy.sendFailedFallback;
        setFormError(message);
        toast.error(copy.notSentTitle, message);
        return;
      }

      setSent(true);
      setValues(EMPTY);
      setErrors({});
      toast.success(copy.sentToastTitle, copy.sentToastBody);
    } catch {
      setFormError(copy.offline);
      toast.error(copy.notSentTitle, copy.offline);
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
            <h3 className="text-lg font-bold text-success-700">{copy.sentTitle}</h3>
            <p className="mt-2 text-sm leading-relaxed text-ink-700">
              {copy.sentBodyBefore}{' '}
              <a
                href={`mailto:${site.supportEmail}`}
                className="font-medium text-brand-700 underline underline-offset-2"
              >
                {site.supportEmail}
              </a>
              {copy.sentBodyAfter}
            </p>
            <Button
              variant="outline"
              className="mt-5"
              onClick={() => {
                setSent(false);
                setFormError(null);
              }}
            >
              {copy.sendAnother}
            </Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <form onSubmit={onSubmit} noValidate className="relative flex flex-col gap-5">
      {formError ? (
        <Alert tone="danger" title={copy.formErrorTitle}>
          {formError} {copy.formErrorReachUs}{' '}
          <a
            href={`mailto:${site.supportEmail}`}
            className="font-medium underline underline-offset-2"
          >
            {site.supportEmail}
          </a>
          .
        </Alert>
      ) : null}

      <div className="grid gap-5 sm:grid-cols-2">
        <Field label={copy.nameLabel} required error={errors.name}>
          {({ id, describedBy, invalid }) => (
            <Input
              id={id}
              name="name"
              autoComplete="name"
              maxLength={120}
              placeholder={copy.namePlaceholder}
              value={values.name}
              invalid={invalid}
              aria-describedby={describedBy}
              onChange={(event) => update('name', event.target.value)}
            />
          )}
        </Field>

        <Field label={copy.emailLabel} required error={errors.email} hint={copy.emailHint}>
          {({ id, describedBy, invalid }) => (
            <Input
              id={id}
              name="email"
              type="email"
              inputMode="email"
              autoComplete="email"
              maxLength={200}
              placeholder={copy.emailPlaceholder}
              value={values.email}
              invalid={invalid}
              aria-describedby={describedBy}
              onChange={(event) => update('email', event.target.value)}
            />
          )}
        </Field>
      </div>

      <Field label={copy.subjectLabel} required error={errors.subject}>
        {({ id, describedBy, invalid }) => (
          <Select
            id={id}
            name="subject"
            value={values.subject}
            invalid={invalid}
            aria-describedby={describedBy}
            onChange={(event) => update('subject', event.target.value)}
          >
            <option value="">{copy.subjectPlaceholder}</option>
            {SUBJECTS.map((subject) => (
              <option key={subject.value} value={subject.value}>
                {subject.label[locale] ?? subject.label.en}
              </option>
            ))}
          </Select>
        )}
      </Field>

      <Field label={copy.messageLabel} required error={errors.message} hint={copy.messageHint}>
        {({ id, describedBy, invalid }) => (
          <Textarea
            id={id}
            name="message"
            rows={7}
            maxLength={MESSAGE_MAX}
            placeholder={copy.messagePlaceholder}
            value={values.message}
            invalid={invalid}
            aria-describedby={describedBy}
            onChange={(event) => update('message', event.target.value)}
          />
        )}
      </Field>

      {/* Honeypot. Hidden from people and from screen readers; bots fill it in. */}
      <div aria-hidden className="absolute -left-[9999px] size-0 overflow-hidden">
        <label htmlFor="contact-company">{copy.honeypotLabel}</label>
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
          {submitting ? copy.submitting : copy.submit}
        </Button>
        <p className="text-[13px] text-ink-500">
          {values.message.trim().length}/{MESSAGE_MAX} {copy.characters}
        </p>
      </div>

      <p className="text-[13px] leading-relaxed text-ink-500">
        {copy.consentBefore}{' '}
        <Link
          href={copy.privacyPath}
          className="font-medium text-brand-700 underline underline-offset-2"
        >
          {copy.privacyLink}
        </Link>{' '}
        {copy.consentAfter}
      </p>
    </form>
  );
}
