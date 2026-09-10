/**
 * The little brand marks on the payment-method tiles.
 *
 * ## Why these are drawn rather than imported
 *
 * A payment page is scanned, not read: the customer looks for a logo they recognise and
 * stops. That makes the marks load-bearing, which in turn makes them a liability if they
 * arrive late — a tile that is blank for 200ms reads as a broken payment option, which is
 * the one thing this page cannot afford to look like. So they are inline SVG and text: no
 * request, no layout shift, nothing to block, and they survive an ad blocker that eats
 * anything with `visa` in the URL.
 *
 * ## Replacing them with the official artwork
 *
 * These are honest approximations, not the registered marks. Visa, Mastercard, American
 * Express and PayPal each publish the real SVGs and permit their use to show accepted
 * payment methods; using the official file is both better looking and the safer position
 * on trademark. To swap one in, replace the body of the component below with the SVG —
 * every caller sizes them through this file, so nothing else changes. Keep them inline
 * rather than `<img src="/visa.svg">`, for the reason above.
 *
 * ## Keep this list honest
 *
 * Only show a mark for something the gateway will actually accept. A customer who picks a
 * tile because it showed an Amex logo and then finds Amex declined inside the overlay has
 * been misled by us, not by the card network.
 */

function Mark({ label, className }: { label: string; className: string }) {
  return (
    <span
      className={`rounded-[3px] px-[3px] py-[2px] text-[8px] leading-none font-black tracking-tight text-white ${className}`}
    >
      {label}
    </span>
  );
}

/** Visa / Mastercard / Amex, for the card tile. */
export function CardBrandMarks() {
  return (
    <span aria-hidden className="flex items-center gap-[3px]">
      <Mark label="VISA" className="bg-[#1a1f71]" />
      <Mark label="MC" className="bg-[#eb001b]" />
      <Mark label="AMEX" className="bg-[#016fd0]" />
    </span>
  );
}

/**
 * PayPal's wordmark, in its two blues.
 *
 * Text rather than a path so it stays crisp at any size — an approximation either way, and
 * the honest one is the one that does not pretend to be the registered logo.
 */
export function PayPalMark({ className = 'text-[12px]' }: { className?: string }) {
  return (
    <span aria-hidden className={`font-extrabold tracking-tight italic ${className}`}>
      <span className="text-[#003087]">Pay</span>
      <span className="text-[#009cde]">Pal</span>
    </span>
  );
}

/**
 * The reassurance strip under a pay button.
 *
 * A button that says "Continue to PayPal" is a claim; the wordmark beside it is the thing
 * people actually check. Nobody reads a checkout — they scan it for a mark they recognise
 * and decide whether to trust the button above it, and a payment page with no mark at all
 * reads as a form that might do anything with a card number.
 *
 * The card marks are here because PayPal takes a card without an account, and a visitor who
 * does not have PayPal will otherwise assume this checkout is closed to them. That is a
 * real abandonment cause and it costs nothing to answer.
 */
export function SecureCheckoutMarks({ label }: { label: string }) {
  return (
    <div className="flex flex-wrap items-center justify-center gap-x-2.5 gap-y-1.5">
      <span className="inline-flex items-center gap-1.5 text-[11.5px] font-medium text-ink-500">
        <svg width="11" height="11" viewBox="0 0 24 24" fill="none" aria-hidden>
          <path
            d="M6 10V7.5a6 6 0 1 1 12 0V10"
            stroke="currentColor"
            strokeWidth="2.2"
            strokeLinecap="round"
          />
          <rect x="3.5" y="10" width="17" height="11" rx="2.5" fill="currentColor" />
        </svg>
        {label}
      </span>
      <PayPalMark className="text-[15px]" />
      <span aria-hidden className="text-ink-300">·</span>
      <CardBrandMarks />
    </div>
  );
}
