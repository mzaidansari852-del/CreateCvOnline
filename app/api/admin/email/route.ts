import { NextResponse } from 'next/server';
import { z } from 'zod';

import { apiError, authedRoute, readJson } from '@/lib/api/handler';
import { marketingAudience, type AudienceMember } from '@/lib/db/audience';
import { readLaunchOffer } from '@/lib/db/offers';
import { renderEmail } from '@/lib/email/render';
import { canSend, estimateSeconds, sendCampaign, sendOne, verifyTransport } from '@/lib/email/send';
import { emailTemplate, EMAIL_TEMPLATE_IDS, type EmailContext } from '@/lib/email/templates';
import { unsubscribeUrl } from '@/lib/email/unsubscribe';
import { LOCALES, type Locale } from '@/lib/i18n/locales';
import { PLANS, listPrice, offerSavingAmount, offerSavingPercent } from '@/lib/plans';
import { publicEnv } from '@/lib/env';
import { absoluteUrl, site } from '@/lib/site';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

const bodySchema = z.object({
  templateId: z.enum(EMAIL_TEMPLATE_IDS as [string, ...string[]]),
  /** `preview` renders without sending. `test` sends to the admin. `send` sends to everyone. */
  action: z.enum(['preview', 'test', 'send']),
  /** Which language to render, for preview only. A real send uses each recipient's own. */
  locale: z.enum(LOCALES).default('en'),
  subject: z.string().max(200).default(''),
  heading: z.string().max(200).default(''),
  body: z.string().max(5_000).default(''),
  /**
   * The audience size the admin was shown when they pressed send.
   *
   * Compared against the count at send time and refused if it has moved. Somebody who
   * confirmed "send to 143 people" must not discover they sent to 900 because a signup
   * campaign ran while the confirmation dialog was open.
   */
  expectedRecipients: z.number().int().min(0).optional(),
});

/**
 * What stands in for a first name when nobody real is being written to.
 *
 * Used by preview and by the test send. A test goes to the admin's own inbox, where a
 * stranger's name in the greeting is just as confusing as it is in the preview pane.
 */
const PREVIEW_NAME = '[first name]';

/** The context a template renders against, for one recipient. */
async function buildContext(
  member: Pick<AudienceMember, 'name' | 'locale'>,
  custom: { subject: string; heading: string; body: string },
  ctaPath: string,
): Promise<EmailContext> {
  const offer = await readLaunchOffer();

  return {
    name: member.name,
    siteName: site.name,
    siteUrl: absoluteUrl('/'),
    ctaUrl: absoluteUrl(ctaPath),
    offer: offer
      ? {
          planName: PLANS[offer.planId].name,
          price: offer.price,
          listPrice: listPrice(offer.planId),
          saving: offerSavingAmount(offer, offer.planId),
          percent: offerSavingPercent(offer, offer.planId),
          currency: publicEnv.storeCurrency,
          seats: offer.seats,
        }
      : null,
    custom,
  };
}

export const POST = authedRoute(
  { scope: 'admin-email', requireAdmin: true, rateLimit: { max: 20, windowSeconds: 60 } },
  async ({ request, profile }) => {
    const input = await readJson(request, bodySchema);

    const template = emailTemplate(input.templateId);
    if (!template) return apiError(400, 'unknown-template', 'That template does not exist.');

    const custom = { subject: input.subject, heading: input.heading, body: input.body };

    /*
     * A template that quotes a price has nothing to say without an offer, and would render
     * an e-mail with a hole where the discount should be. Refused before anything is sent
     * rather than producing a broken message to a few hundred people.
     */
    const offer = await readLaunchOffer();
    if (template.requiresOffer && !offer) {
      return apiError(
        409,
        'no-offer',
        `"${template.name}" quotes the offer price, and no offer is running. Switch one on under Offers, or pick a different template.`,
      );
    }

    /* ------------------------------------------------------------------ */
    /* Preview                                                             */
    /* ------------------------------------------------------------------ */

    if (input.action === 'preview') {
      const locale = input.locale as Locale;
      /*
       * An obvious placeholder, not a plausible name.
       *
       * This was `Sara`, on the reasoning that a preview should show the greeting the way a
       * reader sees it. In practice it showed the person previewing a stranger's name in
       * their own e-mail, which reads as a bug — and a preview that looks broken is worse
       * than one that looks like a template, because the reviewer stops reading the rest of
       * it. Square brackets say "this is substituted" without needing a caption.
       */
      const context = await buildContext(
        { name: PREVIEW_NAME, locale },
        custom,
        template.path[locale],
      );
      const rendered = renderEmail({
        body: template.render[locale](context),
        locale,
        siteName: site.name,
        siteUrl: context.siteUrl,
        ctaUrl: context.ctaUrl,
        unsubscribeUrl: absoluteUrl('/unsubscribe?token=preview'),
      });
      return NextResponse.json({ preview: rendered });
    }

    if (!canSend()) {
      return apiError(
        503,
        'smtp-not-configured',
        'No mail transport is configured. Set SMTP_HOST, SMTP_USER and SMTP_PASSWORD.',
      );
    }

    /* ------------------------------------------------------------------ */
    /* Test — to the admin only                                            */
    /* ------------------------------------------------------------------ */

    if (input.action === 'test') {
      if (!profile.email) {
        return apiError(400, 'no-address', 'This admin account has no e-mail address.');
      }

      const locale = input.locale as Locale;
      const context = await buildContext(
        { name: PREVIEW_NAME, locale },
        custom,
        template.path[locale],
      );
      const url = unsubscribeUrl(profile.uid);

      try {
        await sendOne({
          uid: profile.uid,
          email: profile.email,
          unsubscribeUrl: url,
          message: renderEmail({
            body: template.render[locale](context),
            locale,
            siteName: site.name,
            siteUrl: context.siteUrl,
            ctaUrl: context.ctaUrl,
            unsubscribeUrl: url,
          }),
        });
      } catch (error) {
        return apiError(
          502,
          'send-failed',
          error instanceof Error ? error.message : 'The message could not be sent.',
        );
      }

      /*
       * The test goes to the admin's own address, and that address is very likely opted in
       * — so the unsubscribe link in it is live and will genuinely unsubscribe them. Said
       * here so it appears in the toast rather than being discovered.
       */
      return NextResponse.json({
        sent: 1,
        to: profile.email,
        note: 'The unsubscribe link in it is real — clicking it will opt you out.',
      });
    }

    /* ------------------------------------------------------------------ */
    /* Send                                                                */
    /* ------------------------------------------------------------------ */

    const audience = await marketingAudience();

    if (audience.length === 0) {
      return apiError(
        409,
        'no-audience',
        'Nobody has opted in to product e-mail, so there is nobody to send to.',
      );
    }

    /*
     * The count is re-read here and compared against what the admin confirmed. A send is not
     * undoable, and "I approved 143 and it went to 900" is the mistake worth one comparison.
     */
    if (
      input.expectedRecipients !== undefined &&
      input.expectedRecipients !== audience.length
    ) {
      return apiError(
        409,
        'audience-changed',
        `The audience changed while you were composing — it is now ${audience.length}, not ${input.expectedRecipients}. Nothing was sent. Reload and check before sending.`,
      );
    }

    const recipients = await Promise.all(
      audience.map(async (member) => {
        const context = await buildContext(member, custom, template.path[member.locale]);
        const url = unsubscribeUrl(member.uid);
        return {
          uid: member.uid,
          email: member.email,
          unsubscribeUrl: url,
          message: renderEmail({
            body: template.render[member.locale](context),
            locale: member.locale,
            siteName: site.name,
            siteUrl: context.siteUrl,
            ctaUrl: context.ctaUrl,
            unsubscribeUrl: url,
          }),
        };
      }),
    );

    const verified = await verifyTransport();
    if (!verified.ok) {
      return apiError(
        502,
        'smtp-unreachable',
        `The mail server refused the connection before anything was sent: ${verified.error}`,
      );
    }

    const report = await sendCampaign(recipients);

    console.warn(
      '[email] campaign sent',
      JSON.stringify({
        by: profile.email ?? profile.uid,
        template: template.id,
        sent: report.sent,
        failed: report.failed.length,
      }),
    );

    return NextResponse.json({
      sent: report.sent,
      failed: report.failed,
      total: recipients.length,
      seconds: estimateSeconds(recipients.length),
    });
  },
);
