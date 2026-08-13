import type { Metadata } from 'next';
import Link from 'next/link';

import { LegalDocument, type LegalSection } from '@/components/marketing/LegalDocument';
import { PLANS } from '@/lib/plans';
import { pageMetadata } from '@/lib/seo/metadata';
import { publicEnv } from '@/lib/env';
import { site } from '@/lib/site';

const pro = PLANS.pro;
const lifetime = PLANS.lifetime;
const currency = publicEnv.paypalCurrency;

export const metadata: Metadata = pageMetadata({
  title: 'Refund Policy',
  description: `Every ${site.name} payment carries a 14-day refund window, for any reason. What is refundable, how to ask, how long the money takes to come back, and what happens to your CVs afterwards.`,
  path: '/refund-policy',
  keywords: ['cv builder refund', 'refund policy', 'money back guarantee'],
});

/**
 * The refund policy.
 *
 * The numbers here are read from `lib/plans.ts` so that the document cannot drift from
 * what the checkout actually charges — the same reason the terms page does it.
 */

const SECTIONS: LegalSection[] = [
  {
    id: 'the-promise',
    title: 'The 14-day window',
    body: (
      <>
        <p>
          <strong>
            If you paid us within the last 14 days and you want your money back, you get it
            back.
          </strong>{' '}
          You do not need a reason, you do not need to justify it, and we will not ask you to
          sit through a retention offer. &ldquo;I found a job the same week&rdquo; and
          &ldquo;this is not what I expected&rdquo; are both perfectly good answers, and so is
          no answer at all.
        </p>
        <p>
          The window runs for 14 calendar days from the date of the payment, not from the date
          you first used the product. It applies to each payment separately: if you buy{' '}
          {pro.name} twice, each payment has its own 14 days.
        </p>
        <p>
          There is no partial refund and no proration inside the window — you get the full
          amount you paid, in the currency you paid it.
        </p>
      </>
    ),
  },
  {
    id: 'what-is-refundable',
    title: 'What is refundable',
    body: (
      <>
        <ul>
          <li>
            <strong>{pro.name}</strong> — {pro.price} {currency} for {pro.accessDays} days of
            access. Refundable in full within 14 days of the payment.
          </li>
          <li>
            <strong>{lifetime.name}</strong> — {lifetime.price} {currency}, paid once.
            Refundable in full within 14 days of the payment.
          </li>
          <li>
            <strong>A duplicate payment.</strong> If a checkout was submitted twice and two
            charges landed, the second one is refunded whenever you notice it, with no time
            limit at all. Our own fulfilment is idempotent — a repeated capture of the same
            order never grants or charges twice — but if two separate orders were genuinely
            created, that is our problem to fix, not yours.
          </li>
          <li>
            <strong>A payment that took money without unlocking anything.</strong> If PayPal
            debited you and your account is still on {PLANS.free.name}, tell us and we will
            either grant the plan you paid for or refund you, whichever you prefer. No time
            limit.
          </li>
          <li>
            <strong>A payment you did not authorise.</strong> Contact us and PayPal both.
            There is no time limit and we will not argue about it.
          </li>
        </ul>
        <p>
          <strong>The {PLANS.free.name} plan costs nothing</strong>, so there is nothing to
          refund. It is not a trial and it does not expire.
        </p>
      </>
    ),
  },
  {
    id: 'what-is-not',
    title: 'What is not refundable',
    body: (
      <>
        <p>
          The exceptions are few and they are all about the calendar or about bad faith, not
          about how much you used the product.
        </p>
        <ul>
          <li>
            <strong>Payments more than 14 days old.</strong> After the window closes, a refund
            becomes a favour rather than a right. Ask anyway — we would rather refund an
            unhappy person than keep the money — but we are not promising it here.
          </li>
          <li>
            <strong>Accounts terminated for a serious breach</strong> of the{' '}
            <Link href="/terms">terms of service</Link> — reselling the templates, attacking
            the service, or using it to commit fraud. Ordinary account deletion is not a
            breach and does not affect your refund rights.
          </li>
          <li>
            <strong>Repeat buy-and-refund cycles.</strong> Buying, exporting, refunding, and
            repeating is not what this policy is for. We will refund you and decline the next
            purchase rather than pretend we did not notice.
          </li>
          <li>
            <strong>Currency conversion losses and cross-border fees.</strong> We refund the
            exact amount we were paid, in {currency}. If your bank converted at one rate on the
            way out and a different rate on the way back, or charged a foreign-transaction fee,
            that difference is between you and them — we never received it.
          </li>
        </ul>
        <p>
          Note what is <em>not</em> on this list: how many CVs you made, how many PDFs you
          downloaded, or how many days of a {pro.accessDays}-day period you used. None of that
          affects a refund inside the window.
        </p>
      </>
    ),
  },
  {
    id: 'how-to-ask',
    title: 'How to request a refund',
    body: (
      <>
        <p>
          Use the <Link href="/contact">contact form</Link> and pick{' '}
          <strong>&ldquo;Refund request&rdquo;</strong> as the subject, or e-mail{' '}
          <a href={`mailto:${site.supportEmail}`}>{site.supportEmail}</a> directly. Include:
        </p>
        <ul>
          <li>
            <strong>The PayPal transaction id</strong> — the order reference for the payment.
            This is the one detail that makes the request instant instead of a conversation.
          </li>
          <li>
            <strong>The e-mail address on your {site.name} account</strong>, if it differs from
            the address you are writing from.
          </li>
          <li>
            A reason, if you feel like giving one. It is genuinely optional, and it is only
            ever used to fix the product.
          </li>
        </ul>
        <h3>Where to find your transaction id</h3>
        <ul>
          <li>
            <strong>In your account:</strong> sign in and open{' '}
            <Link href="/dashboard/account">your account page</Link>. The billing history table
            lists every payment with its order id, plan, amount and status.
          </li>
          <li>
            <strong>On the confirmation page:</strong> the order reference is printed at the
            bottom of the page you landed on after paying.
          </li>
          <li>
            <strong>In PayPal:</strong> the receipt PayPal e-mailed you, or your PayPal
            activity list.
          </li>
        </ul>
        <p>
          If you cannot find it, write to us anyway from the address on the account and say
          roughly when you paid — we can find the payment from that.
        </p>
        <p>
          <strong>Please write from the e-mail address on the account.</strong> A refund moves
          money and removes a paid plan, so we verify that the request comes from the account
          holder before we act on it. If you cannot access that mailbox any more, tell us and
          we will find another way to verify you.
        </p>
      </>
    ),
  },
  {
    id: 'how-long',
    title: 'How long it takes',
    body: (
      <>
        <ul>
          <li>
            <strong>Our part: within 2 working days</strong>, usually the same day. We reply to
            confirm, issue the refund through PayPal and remove the paid plan from the account
            in the same action.
          </li>
          <li>
            <strong>PayPal&apos;s part: typically 3 to 5 working days</strong> for the money to
            appear, and it can be longer if the original payment was made by card, because the
            refund has to travel back through your card issuer. That leg is outside our
            control and we cannot speed it up.
          </li>
        </ul>
        <p>
          The refund goes back to <strong>the same payment method you used</strong> — a PayPal
          balance, a linked bank account, or the card you paid with. We cannot send it
          somewhere else, and we never hold a store credit or a voucher instead of returning
          real money.
        </p>
        <p>
          You will get a confirmation from us and a separate one from PayPal. If more than five
          working days pass after our confirmation and nothing has arrived, reply to that
          e-mail and we will chase it with the transaction id.
        </p>
      </>
    ),
  },
  {
    id: 'after-a-refund',
    title: 'What happens to your CVs and your downloads',
    body: (
      <>
        <p>
          <strong>A refund does not delete anything.</strong> Your account stays, and every CV
          you have written stays with it, word for word. What changes is the plan: the account
          returns to {PLANS.free.name} and the {PLANS.free.name} limits apply again from that
          moment.
        </p>
        <ul>
          <li>
            <strong>Your CVs are kept and stay editable</strong>, including any you created
            beyond the free plan&apos;s limit of {PLANS.free.limits.maxCvs}. You will not be
            able to create new ones past that limit until you are under it, but nothing is
            deleted to get you there — that choice stays yours.
          </li>
          <li>
            <strong>A CV using a Pro-only template stays intact.</strong> You keep the content;
            you will need to switch it to one of the free designs before you can download it
            again. Switching template never changes a word of what you wrote.
          </li>
          <li>
            <strong>PDFs you already downloaded are yours permanently.</strong> A refund cannot
            and does not reach into files on your computer, or into a document you have already
            e-mailed to an employer. We do not try.
          </li>
          <li>
            <strong>Downloads return to the free allowance</strong> of{' '}
            {PLANS.free.limits.maxDownloadsPerMonth} per month, and Pro-only features — custom
            sections, full font and spacing control, share links, and export without the{' '}
            {site.name} credit line — switch off.
          </li>
          <li>
            <strong>An active share link stops working</strong>, because share links are a paid
            feature. The CV behind it is untouched.
          </li>
        </ul>
        <p>
          If you would rather have your data gone entirely, delete your account from{' '}
          <Link href="/dashboard/settings">your settings</Link> — export first, because deletion
          cannot be undone. Deleting an account does not waive a refund you are owed; ask for
          the refund first, or just tell us both at once.
        </p>
      </>
    ),
  },
  {
    id: 'cancelling',
    title: 'How to make sure you are not charged again',
    body: (
      <>
        <p>
          <strong>There is nothing to cancel, because nothing renews.</strong> We do not store
          your payment method and we do not create a recurring PayPal billing agreement.{' '}
          {pro.name} is a single payment covering {pro.accessDays} days; when those days are
          up, the account quietly returns to {PLANS.free.name} and you decide whether to buy
          another period. {lifetime.name} is bought once and never expires.
        </p>
        <p>
          So there is no cancellation form to find, no notice period, and no dark pattern to
          survive. <strong>To stop paying, simply do not buy again.</strong>
        </p>
        <p>
          If you want to be certain, two things are worth doing. Check{' '}
          <Link href="/dashboard/account">your account page</Link>, which shows every payment
          recorded against the account and the date your current access ends. And check your
          PayPal account under Settings → Payments → Automatic payments: you should find no
          agreement for {site.name} listed there. If you ever do find one, that is a bug —
          tell us at <a href={`mailto:${site.supportEmail}`}>{site.supportEmail}</a> and we
          will cancel it and refund whatever it took.
        </p>
      </>
    ),
  },
  {
    id: 'chargebacks',
    title: 'Disputes and chargebacks',
    body: (
      <>
        <p>
          If you open a PayPal dispute or ask your bank for a chargeback, we will not fight it.
          But please ask us first: a refund from us takes a couple of days, whereas a dispute
          takes weeks, freezes the payment while it runs, and usually ends in exactly the same
          place.
        </p>
        <p>
          While a dispute is open we may pause the paid plan on the account, because the money
          is held rather than settled. Nothing is deleted, and access returns immediately if
          the dispute is closed in our favour or withdrawn.
        </p>
        <p>
          If a payment was genuinely not made by you, do the opposite — raise it with PayPal
          straight away, and tell us so we can lock the account down at our end too.
        </p>
      </>
    ),
  },
  {
    id: 'statutory-rights',
    title: 'Your statutory rights',
    body: (
      <>
        <p>
          Nothing on this page reduces a right you have by law. Consumers in the European Union
          and the United Kingdom, among other places, have a statutory right to withdraw from a
          distance contract for digital content, subject to the usual conditions about
          performance beginning with your consent. Where that right gives you more than this
          policy does, <strong>the law wins</strong>.
        </p>
        <p>
          Where this policy is more generous than the law requires — and inside 14 days, for any
          reason, it usually is — this policy applies.
        </p>
        <p>
          The <Link href="/terms">terms of service</Link> govern the rest of the relationship,
          and they defer to this document on refunds.
        </p>
      </>
    ),
  },
  {
    id: 'changes',
    title: 'Changes to this policy',
    body: (
      <>
        <p>
          <strong>The policy that applies to your payment is the one published on the day you
          paid.</strong> If we shorten the window or add an exception later, that change cannot
          reach backwards to a purchase already made.
        </p>
        <p>
          Any change appears here with a new &ldquo;last updated&rdquo; date at the top. A
          change that materially reduces what you are entitled to would also be announced to
          account holders rather than left for you to notice.
        </p>
      </>
    ),
  },
];

export default function RefundPolicyPage() {
  return (
    <LegalDocument
      title="Refund policy"
      intro={`Fourteen days, any reason, full amount. This page sets out the handful of cases that fall outside that, how to ask, and what happens to your CVs afterwards.`}
      summary={[
        <>
          <strong>14 days from the payment, for any reason, refunded in full.</strong> No
          proration, no questions, no retention offer.
        </>,
        <>
          <strong>
            Ask through the <Link href="/contact">contact form</Link> or by e-mail
          </strong>
          , quoting your PayPal transaction id and writing from the address on the account.
        </>,
        <>
          <strong>We process it within 2 working days;</strong> PayPal then takes about 3 to 5
          for the money to land back on your original payment method.
        </>,
        <>
          <strong>Your CVs are not deleted.</strong> The account returns to the free plan, and
          PDFs you already downloaded stay yours.
        </>,
        <>
          <strong>Nothing renews, so there is nothing to cancel.</strong> No card is stored and
          no recurring PayPal agreement is created.
        </>,
      ]}
      sections={SECTIONS}
      relatedLinks={[
        { label: 'Pricing', href: '/pricing' },
        { label: 'Terms of service', href: '/terms' },
        { label: 'Privacy policy', href: '/privacy' },
        { label: 'Contact us', href: '/contact' },
      ]}
    />
  );
}
