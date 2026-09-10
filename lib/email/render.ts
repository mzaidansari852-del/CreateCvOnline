import type { Locale } from '@/lib/i18n/locales';
import type { EmailBody } from './templates';

/**
 * The shell every announcement is rendered into.
 *
 * ## The constraint this is designed against
 *
 * Mail clients are not browsers. Outlook on Windows renders through Word's HTML engine,
 * Gmail strips `<style>` blocks, several clients ignore `<head>` entirely, and most block
 * remote images until the reader asks for them. So: tables, inline styles, no flexbox, no
 * grid, no external CSS, no web fonts, and **no images at all** — including the logo, which
 * is drawn as a coloured table cell with a letter in it rather than fetched.
 *
 * That last decision is what keeps the e-mail looking finished in a client with images off,
 * which is the state most readers see it in first. An identity that depends on a downloaded
 * PNG is an identity that is missing at the only moment it had to work.
 *
 * ## Why it is laid out the way it is
 *
 * An offer e-mail has one job, and it is not to be read — it is to be *scanned*, in about a
 * second and a half, at which point the reader either taps the button or does not. So the
 * discount is a block of two figures rather than a sentence containing two figures, the
 * saving is a coloured pill, and the button is the largest interactive thing on the page.
 * The prose is there for the minority who read before deciding.
 *
 * ## The text part is not an afterthought
 *
 * Every message is `multipart/alternative` with a real plain-text alternative, generated
 * from the same `EmailBody` so it cannot drift. Spam filters weight an HTML-only message
 * against the sender, some readers are configured to text, and it is what a screen reader
 * gets a clean pass at.
 */

const BRAND = '#1f3af5';
const BRAND_DARK = '#1730c4';
const INK = '#0f1222';
const BODY_INK = '#3f4453';
const MUTED = '#8b909f';
const BORDER = '#e6e8ee';
const PANEL = '#f7f8fb';
const PAGE = '#eef0f5';
const ACCENT = '#e5401a';
const ACCENT_BG = '#fff1ec';

const FONT =
  "-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,'Helvetica Neue',Arial,sans-serif";

/** `&` and `<` in user-supplied prose must not become markup. */
function escapeHtml(value: string): string {
  return value
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

/**
 * A blank line in the form becomes a paragraph break, a single newline a `<br>`.
 *
 * Whoever writes an announcement types into a textarea and presses Enter. Rendering that as
 * one run-on paragraph is the difference between an e-mail that looks written and one that
 * looks generated.
 */
function paragraphHtml(text: string): string {
  return escapeHtml(text.trim()).replace(/\n/g, '<br />');
}

export interface UnsubscribeCopy {
  reason: string;
  link: string;
  /** "Sent by CreateCVOnline" — the line that makes the sender identifiable at a glance. */
  sentBy: string;
}

const FOOTER: Record<Locale, (site: string) => UnsubscribeCopy> = {
  en: (site) => ({
    reason: `You are getting this because you asked for product e-mail from ${site}.`,
    link: 'Unsubscribe',
    sentBy: `Sent by ${site}`,
  }),
  fr: (site) => ({
    reason: `Vous recevez ce message parce que vous avez accepté les e-mails de ${site}.`,
    link: 'Se désabonner',
    sentBy: `Envoyé par ${site}`,
  }),
  de: (site) => ({
    reason: `Sie erhalten diese E-Mail, weil Sie Produkt-E-Mails von ${site} abonniert haben.`,
    link: 'Abmelden',
    sentBy: `Gesendet von ${site}`,
  }),
  nl: (site) => ({
    reason: `Je krijgt deze e-mail omdat je product-e-mail van ${site} hebt aangevraagd.`,
    link: 'Afmelden',
    sentBy: `Verzonden door ${site}`,
  }),
};

export interface RenderedEmail {
  subject: string;
  html: string;
  text: string;
}

/** The logo lockup: a rounded brand square with the initial, then the wordmark. */
function logo(siteName: string, siteUrl: string): string {
  const initial = escapeHtml(siteName.slice(0, 1).toUpperCase());
  return `<table role="presentation" cellpadding="0" cellspacing="0" border="0">
  <tr>
    <td width="30" height="30" align="center" valign="middle" style="width:30px;height:30px;background:${BRAND};border-radius:8px;font-family:${FONT};font-size:16px;font-weight:800;color:#ffffff;line-height:30px;">${initial}</td>
    <td style="padding-left:10px;font-family:${FONT};font-size:15.5px;font-weight:800;letter-spacing:-0.2px;color:${INK};">
      <a href="${siteUrl}" style="color:${INK};text-decoration:none;">${escapeHtml(siteName)}</a>
    </td>
  </tr>
</table>`;
}

/** The two figures, side by side, in a bordered panel. The part that gets scanned. */
function priceBlock(price: NonNullable<EmailBody['price']>): string {
  return `<table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="background:${PANEL};border:1px solid ${BORDER};border-radius:12px;">
  <tr>
    <td align="center" style="padding:22px 20px 20px;">
      <table role="presentation" cellpadding="0" cellspacing="0" border="0">
        <tr>
          <td valign="bottom" style="padding-right:12px;font-family:${FONT};font-size:20px;font-weight:600;color:${MUTED};text-decoration:line-through;">${escapeHtml(price.was)}</td>
          <td valign="bottom" style="font-family:${FONT};font-size:40px;line-height:1;font-weight:800;letter-spacing:-1.2px;color:${INK};">${escapeHtml(price.now)}</td>
        </tr>
      </table>
      <div style="margin-top:12px;">
        <span style="display:inline-block;padding:5px 12px;background:${ACCENT_BG};border-radius:999px;font-family:${FONT};font-size:12.5px;font-weight:700;color:${ACCENT};">${escapeHtml(price.saveLabel)}</span>
      </div>
    </td>
  </tr>
</table>`;
}

/** Ticked lines. The tick is a character, not an icon — nothing here loads. */
function bulletList(bullets: string[]): string {
  const rows = bullets
    .map(
      (bullet) => `<tr>
      <td valign="top" width="20" style="width:20px;padding:0 0 9px;font-family:${FONT};font-size:14px;font-weight:800;color:${BRAND};line-height:1.5;">&#10003;</td>
      <td valign="top" style="padding:0 0 9px;font-family:${FONT};font-size:14.5px;line-height:1.5;color:${BODY_INK};">${escapeHtml(bullet)}</td>
    </tr>`,
    )
    .join('');
  return `<table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0">${rows}</table>`;
}

export function renderEmail(input: {
  body: EmailBody;
  locale: Locale;
  siteName: string;
  siteUrl: string;
  ctaUrl: string;
  unsubscribeUrl: string;
}): RenderedEmail {
  const { body, locale, siteName, siteUrl, ctaUrl, unsubscribeUrl } = input;
  const footer = FOOTER[locale](siteName);

  const paragraphs = body.paragraphs
    .map(
      (text) =>
        `<p style="margin:0 0 15px;font-family:${FONT};font-size:15.5px;line-height:1.65;color:${BODY_INK};">${paragraphHtml(text)}</p>`,
    )
    .join('');

  const html = `<!doctype html>
<html lang="${locale}">
<head>
<meta charset="utf-8" />
<meta name="viewport" content="width=device-width,initial-scale=1" />
<meta name="color-scheme" content="light only" />
<meta name="supported-color-schemes" content="light only" />
<title>${escapeHtml(body.subject)}</title>
</head>
<body style="margin:0;padding:0;background:${PAGE};-webkit-font-smoothing:antialiased;">
<!--
  The preheader: the grey line a client shows beside the subject in the inbox list. Left
  empty, clients scrape the first text they find — usually the greeting — so every message
  in the list reads "Hi [name],". Hidden in the body, shown in the list.
-->
<div style="display:none;max-height:0;overflow:hidden;opacity:0;mso-hide:all;">${escapeHtml(
    body.paragraphs[1] ?? body.heading,
  )}</div>

<table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="background:${PAGE};">
  <tr>
    <td align="center" style="padding:34px 14px;">
      <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="max-width:580px;background:#ffffff;border:1px solid ${BORDER};border-radius:16px;">

        <tr>
          <td style="padding:24px 30px 0;">${logo(siteName, siteUrl)}</td>
        </tr>

        <tr>
          <td style="padding:22px 30px 0;">
            ${
              body.badge
                ? `<div style="margin:0 0 12px;"><span style="display:inline-block;padding:5px 11px;background:${ACCENT};border-radius:999px;font-family:${FONT};font-size:11.5px;font-weight:800;letter-spacing:0.4px;text-transform:uppercase;color:#ffffff;">${escapeHtml(body.badge)}</span></div>`
                : ''
            }
            <h1 style="margin:0 0 18px;font-family:${FONT};font-size:27px;line-height:1.25;font-weight:800;letter-spacing:-0.6px;color:${INK};">${escapeHtml(body.heading)}</h1>
            ${paragraphs}
          </td>
        </tr>

        ${body.price ? `<tr><td style="padding:6px 30px 0;">${priceBlock(body.price)}</td></tr>` : ''}
        ${
          body.bullets?.length
            ? `<tr><td style="padding:22px 30px 0;">${bulletList(body.bullets)}</td></tr>`
            : ''
        }

        <tr>
          <td style="padding:24px 30px 0;">
            <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0">
              <tr>
                <td align="center" style="background:${BRAND};border-bottom:2px solid ${BRAND_DARK};border-radius:10px;">
                  <a href="${ctaUrl}" style="display:block;padding:15px 24px;font-family:${FONT};font-size:15.5px;font-weight:700;color:#ffffff;text-decoration:none;">${escapeHtml(body.cta)}</a>
                </td>
              </tr>
            </table>
          </td>
        </tr>

        ${
          body.footnote
            ? `<tr><td style="padding:14px 30px 0;"><p style="margin:0;font-family:${FONT};font-size:12.5px;line-height:1.6;color:${MUTED};text-align:center;">${escapeHtml(body.footnote)}</p></td></tr>`
            : ''
        }

        <tr>
          <td style="padding:28px 30px 26px;">
            <div style="border-top:1px solid ${BORDER};padding-top:18px;">
              <p style="margin:0 0 7px;font-family:${FONT};font-size:12px;line-height:1.6;font-weight:600;color:${BODY_INK};">${escapeHtml(footer.sentBy)}</p>
              <p style="margin:0 0 5px;font-family:${FONT};font-size:11.5px;line-height:1.6;color:${MUTED};">${escapeHtml(footer.reason)}</p>
              <p style="margin:0;font-family:${FONT};font-size:11.5px;line-height:1.6;">
                <a href="${unsubscribeUrl}" style="color:${MUTED};text-decoration:underline;">${escapeHtml(footer.link)}</a>
              </p>
            </div>
          </td>
        </tr>

      </table>
    </td>
  </tr>
</table>
</body>
</html>`;

  const text = [
    body.badge ? `${body.badge.toUpperCase()}\n` : '',
    body.heading,
    '',
    ...body.paragraphs.map((paragraph) => paragraph.trim()),
    // The price block, stated in words rather than laid out — a text part should read, not
    // attempt a table in spaces.
    ...(body.price ? ['', `${body.price.was} → ${body.price.now} (${body.price.saveLabel})`] : []),
    ...(body.bullets?.length ? ['', ...body.bullets.map((bullet) => `- ${bullet}`)] : []),
    '',
    `${body.cta}: ${ctaUrl}`,
    ...(body.footnote ? ['', body.footnote] : []),
    '',
    '---',
    footer.sentBy,
    footer.reason,
    `${footer.link}: ${unsubscribeUrl}`,
  ]
    .filter((line) => line !== '')
    .join('\n');

  return { subject: body.subject, html, text };
}
