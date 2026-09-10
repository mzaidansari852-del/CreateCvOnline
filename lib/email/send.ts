import 'server-only';

import nodemailer, { type Transporter } from 'nodemailer';

import { requireSmtpEnv, serverEnv } from '@/lib/env';
import type { RenderedEmail } from './render';

/**
 * The SMTP transport, and the pacing around it.
 *
 * ## Why sending is throttled
 *
 * This sends through an ordinary mailbox — Hostinger's, in this deployment — not through a
 * bulk provider. Such a mailbox has an hourly cap, and exceeding it does not merely fail
 * the excess: it gets the account rate-limited and, done repeatedly, gets the *domain*
 * treated as a spam source. The cost of that lands on password resets and payment receipts,
 * not just on marketing.
 *
 * So messages go one at a time with a gap between them, over one reused connection. For an
 * audience in the low hundreds that is a couple of minutes and entirely invisible. It is
 * the wrong architecture for tens of thousands, and the note in `docs/EMAIL_SETUP.md` says
 * so rather than letting somebody discover it at volume.
 *
 * ## Why the connection is reused
 *
 * Opening a TLS connection per message is slow and looks far more like a botnet than one
 * authenticated session sending sequentially. `pool: true` keeps it open for the run.
 */

let transporter: Transporter | null = null;

function transport(): Transporter {
  if (transporter) return transporter;
  const smtp = requireSmtpEnv();

  transporter = nodemailer.createTransport({
    host: smtp.host,
    port: smtp.port,
    secure: smtp.secure,
    auth: { user: smtp.user, pass: smtp.password },
    pool: true,
    maxConnections: 1,
    // One at a time. See above: this is a mailbox, not a sending service.
    maxMessages: 100,
  });

  return transporter;
}

/** Milliseconds between messages. Deliberately unhurried. */
const GAP_MS = 1_200;

const sleep = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

export interface Recipient {
  uid: string;
  email: string;
  /** Rendered for this recipient, in their language. */
  message: RenderedEmail;
  /** This recipient's own unsubscribe URL, for the List-Unsubscribe header. */
  unsubscribeUrl: string;
}

export interface SendReport {
  sent: number;
  failed: { email: string; reason: string }[];
}

/** Confirms the credentials actually authenticate, without sending anything. */
export async function verifyTransport(): Promise<{ ok: boolean; error: string | null }> {
  try {
    await transport().verify();
    return { ok: true, error: null };
  } catch (error) {
    return { ok: false, error: error instanceof Error ? error.message : String(error) };
  }
}

export async function sendOne(recipient: Recipient): Promise<void> {
  const smtp = requireSmtpEnv();

  await transport().sendMail({
    from: { name: smtp.fromName, address: smtp.from },
    to: recipient.email,
    replyTo: smtp.replyTo,
    subject: recipient.message.subject,
    text: recipient.message.text,
    html: recipient.message.html,
    headers: {
      /*
       * The unsubscribe header, which is what Gmail and Outlook turn into the "Unsubscribe"
       * control beside the sender name. It matters more than the link in the footer: a
       * reader who cannot find that link marks the message as spam instead, and a spam
       * complaint costs the domain's reputation where an unsubscribe costs one address.
       *
       * `One-Click` requires the URL to act on a POST without further interaction, which
       * `/api/email/unsubscribe` does.
       */
      'List-Unsubscribe': `<${recipient.unsubscribeUrl}>`,
      'List-Unsubscribe-Post': 'List-Unsubscribe=One-Click',
    },
  });
}

/**
 * Sends to everyone, slowly, and reports what happened.
 *
 * One failure does not stop the run: a single bad address among two hundred should cost
 * that address, not the campaign. Failures are collected and returned so the admin page can
 * show exactly who did not receive it.
 *
 * `onProgress` is called after each attempt so a long run can be reported rather than
 * appearing to hang.
 */
export async function sendCampaign(
  recipients: Recipient[],
  onProgress?: (done: number, total: number) => void,
): Promise<SendReport> {
  const report: SendReport = { sent: 0, failed: [] };

  for (const [index, recipient] of recipients.entries()) {
    try {
      await sendOne(recipient);
      report.sent += 1;
    } catch (error) {
      report.failed.push({
        email: recipient.email,
        reason: error instanceof Error ? error.message : String(error),
      });
    }

    onProgress?.(index + 1, recipients.length);
    if (index < recipients.length - 1) await sleep(GAP_MS);
  }

  return report;
}

/** Roughly how long a run of this size will take, for the confirmation dialog. */
export function estimateSeconds(count: number): number {
  return Math.ceil((Math.max(0, count - 1) * GAP_MS) / 1000);
}

/** True when a transport could be built at all. */
export function canSend(): boolean {
  return serverEnv().smtp !== null;
}

/** Test seam — drops the pooled connection. */
export function __resetTransport(): void {
  transporter?.close();
  transporter = null;
}
