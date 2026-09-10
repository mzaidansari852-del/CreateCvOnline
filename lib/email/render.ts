import type { Locale } from '@/lib/i18n/locales';
import type { EmailBody } from './templates';

/**
 * The shell every announcement is rendered into.
 *
 * ## Why this is written the way it is
 *
 * Mail clients are not browsers. Outlook renders through Word, Gmail strips `<style>`
 * blocks and anything resembling a modern layout, and several clients ignore `<head>`
 * entirely. So: one table, inline styles, no flexbox, no grid, no external CSS, no web
 * fonts, and no images. That is not conservatism for its own sake — a layout that collapses
 * in Outlook is one a fifth of recipients see broken, and an e-mail with a remote image is
 * one that trips image-blocking and arrives as a blank rectangle.
 *
 * The button is a table cell with a background colour rather than an `<a>` with padding,
 * for the same reason: it is the one element that has to look clickable everywhere.
 *
 * ## The text part is not an afterthought
 *
 * Every message is sent `multipart/alternative` with a real plain-text alternative. Spam
 * filters weight an HTML-only message against the sender, some clients are configured to
 * text, and a text part is what a screen reader gets a clean pass at. It is generated from
 * the same `EmailBody`, so it cannot drift from what the HTML says.
 */

const BRAND = '#1f3af5';
const INK = '#0f1222';
const MUTED = '#6b7280';
const BORDER = '#e5e7eb';
const PAGE = '#f5f6f8';

/** `&` and `<` in user-supplied prose must not become markup. */
function escapeHtml(value: string): string {
  return value
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

/**
 * A blank line in the form becomes a paragraph break, and a single newline a `<br>`.
 *
 * Whoever writes an announcement types into a textarea and presses Enter. Rendering that as
 * one run-on paragraph is the difference between an e-mail that looks written and one that
 * looks generated.
 */
function paragraphHtml(text: string): string {
  return escapeHtml(text.trim()).replace(/\n/g, '<br />');
}

export interface UnsubscribeCopy {
  /** "You are receiving this because…" */
  reason: string;
  link: string;
}

const UNSUBSCRIBE: Record<Locale, (site: string) => UnsubscribeCopy> = {
  en: (site) => ({
    reason: `You are getting this because you asked for product e-mail from ${site}.`,
    link: 'Unsubscribe',
  }),
  fr: (site) => ({
    reason: `Vous recevez ce message parce que vous avez accepté les e-mails de ${site}.`,
    link: 'Se désabonner',
  }),
  de: (site) => ({
    reason: `Sie erhalten diese E-Mail, weil Sie Produkt-E-Mails von ${site} abonniert haben.`,
    link: 'Abmelden',
  }),
  nl: (site) => ({
    reason: `Je krijgt deze e-mail omdat je product-e-mail van ${site} hebt aangevraagd.`,
    link: 'Afmelden',
  }),
};

export interface RenderedEmail {
  subject: string;
  html: string;
  text: string;
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
  const footer = UNSUBSCRIBE[locale](siteName);

  const paragraphs = body.paragraphs
    .map(
      (text) =>
        `<p style="margin:0 0 16px;font-size:15px;line-height:1.65;color:${INK};">${paragraphHtml(text)}</p>`,
    )
    .join('');

  const html = `<!doctype html>
<html lang="${locale}">
<head>
<meta charset="utf-8" />
<meta name="viewport" content="width=device-width,initial-scale=1" />
<title>${escapeHtml(body.subject)}</title>
</head>
<body style="margin:0;padding:0;background:${PAGE};">
<!--
  A preheader: the grey line a client shows next to the subject in the inbox list. Left
  empty, clients scrape the first thing they find, which is usually the greeting — so every
  message in the list reads "Hi Sara,". Hidden in the body, shown in the list.
-->
<div style="display:none;max-height:0;overflow:hidden;opacity:0;">${escapeHtml(
    body.paragraphs[1] ?? body.heading,
  )}</div>
<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:${PAGE};padding:32px 16px;">
  <tr>
    <td align="center">
      <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="max-width:560px;background:#ffffff;border:1px solid ${BORDER};border-radius:14px;">
        <tr>
          <td style="padding:28px 28px 0;">
            <a href="${siteUrl}" style="font-size:16px;font-weight:700;color:${INK};text-decoration:none;">${escapeHtml(siteName)}</a>
          </td>
        </tr>
        <tr>
          <td style="padding:20px 28px 0;">
            <h1 style="margin:0 0 18px;font-size:23px;line-height:1.3;font-weight:800;color:${INK};">${escapeHtml(body.heading)}</h1>
            ${paragraphs}
          </td>
        </tr>
        <tr>
          <td style="padding:8px 28px 4px;">
            <table role="presentation" cellpadding="0" cellspacing="0">
              <tr>
                <td style="background:${BRAND};border-radius:9px;">
                  <a href="${ctaUrl}" style="display:inline-block;padding:13px 26px;font-size:15px;font-weight:700;color:#ffffff;text-decoration:none;">${escapeHtml(body.cta)}</a>
                </td>
              </tr>
            </table>
          </td>
        </tr>
        ${
          body.footnote
            ? `<tr><td style="padding:14px 28px 0;"><p style="margin:0;font-size:13px;line-height:1.6;color:${MUTED};">${escapeHtml(body.footnote)}</p></td></tr>`
            : ''
        }
        <tr>
          <td style="padding:26px 28px 28px;">
            <div style="border-top:1px solid ${BORDER};padding-top:16px;">
              <p style="margin:0 0 6px;font-size:12px;line-height:1.6;color:${MUTED};">${escapeHtml(footer.reason)}</p>
              <p style="margin:0;font-size:12px;line-height:1.6;color:${MUTED};">
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
    body.heading,
    '',
    ...body.paragraphs.map((paragraph) => paragraph.trim()),
    '',
    `${body.cta}: ${ctaUrl}`,
    ...(body.footnote ? ['', body.footnote] : []),
    '',
    '---',
    footer.reason,
    `${footer.link}: ${unsubscribeUrl}`,
  ].join('\n');

  return { subject: body.subject, html, text };
}
