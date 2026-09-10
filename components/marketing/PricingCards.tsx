import { ButtonLink } from '@/components/ui/button';
import { Badge } from '@/components/ui/feedback';
import { FREE_TEMPLATE_COUNT, TEMPLATE_COUNT } from '@/lib/cv/template-registry';
import { publicEnv } from '@/lib/env';
import { PLAN_ORDER, getPlan, hasLaunchOffer, launchOffer, listPrice } from '@/lib/plans';
import { cn } from '@/lib/utils/cn';

/**
 * The pricing table.
 *
 * Rendered from `lib/plans.ts`, which is the same object the server reads when it decides
 * what a user may do — so the page can never advertise a limit the backend does not
 * actually enforce. Prices come from `getPlan()` rather than from `PLANS` directly, which
 * is what makes the launch offer arrive here, at the checkout and in the amount PayPal is
 * asked for as one number instead of three that have to be kept in agreement.
 */

const currencySymbols: Record<string, string> = { USD: '$', EUR: '€', GBP: '£', MAD: 'MAD ' };

function formatPrice(value: string): string {
  const symbol = currencySymbols[publicEnv.storeCurrency] ?? `${publicEnv.storeCurrency} `;
  const amount = Number.parseFloat(value);
  const display = Number.isInteger(amount) ? String(amount) : amount.toFixed(2);
  return `${symbol}${display}`;
}

function intervalLabel(interval: string): string {
  switch (interval) {
    case 'forever':
      return 'forever';
    case 'month':
      return 'per month';
    case 'year':
      return 'per year';
    case 'one-time':
      return 'one-time';
    default:
      return interval;
  }
}

/** Whole percent off the list price, for the badge. */
function savedPercent(planId: string): number {
  const full = Number.parseFloat(listPrice(planId));
  const now = Number.parseFloat(getPlan(planId).price);
  if (!Number.isFinite(full) || !Number.isFinite(now) || full <= 0) return 0;
  return Math.round(((full - now) / full) * 100);
}

/** Money saved, as a decimal string the formatter can take. */
function savedAmount(planId: string): string {
  const full = Number.parseFloat(listPrice(planId));
  const now = Number.parseFloat(getPlan(planId).price);
  if (!Number.isFinite(full) || !Number.isFinite(now)) return '0.00';
  return (full - now).toFixed(2);
}

export function PricingCards({
  ctaHref = '/register',
  checkoutHref = '/payment/checkout',
  seatsClaimed,
  className,
}: {
  /** Where the free plan's button goes. */
  ctaHref?: string;
  /**
   * Where a paid plan's button goes, with `?plan=` appended.
   *
   * `/payment/checkout` is authenticated and redirects a signed-out visitor through
   * `/login?next=…` back to itself, which is what lets this component — and therefore
   * every page that renders it — stay fully static and still sell.
   */
  checkoutHref?: string;
  /**
   * How many launch-offer seats have been taken, counted from the payment ledger.
   *
   * Optional, and omitted rather than defaulted when the count could not be read: the
   * figure sits next to a public promise about how many are available, so showing a made-up
   * one would be worse than showing none. Pages that render statically and have no ledger
   * access simply leave it out.
   */
  seatsClaimed?: number;
  className?: string;
}) {
  const offer = launchOffer();

  return (
    <div className={cn('grid gap-6 lg:grid-cols-3', className)}>
      {PLAN_ORDER.map((planId) => {
        const plan = getPlan(planId);
        const onOffer = hasLaunchOffer(planId);
        /*
         * The offer takes the spotlight while it runs. Pro is the featured plan normally,
         * but a one-off payment worth less than one month of it is not a card to leave
         * looking like the quiet third option.
         */
        const featured = onOffer || (plan.featured && !offer);

        return (
          <div
            key={plan.id}
            className={cn(
              'relative flex flex-col rounded-2xl border bg-white p-6',
              featured
                ? 'border-brand-500 shadow-[0_0_0_1px_var(--color-brand-500),0_18px_40px_-16px_rgba(31,58,245,.35)] lg:-my-3 lg:py-9'
                : 'border-ink-200 shadow-card',
            )}
          >
            {featured ? (
              <span className="absolute -top-3 left-6">
                <Badge
                  tone="brand"
                  className={cn(
                    'text-white',
                    onOffer ? 'bg-accent-600 ring-accent-600' : 'bg-brand-600 ring-brand-600',
                  )}
                >
                  {onOffer ? offer?.label : 'Most popular'}
                </Badge>
              </span>
            ) : null}

            <div className="flex items-baseline justify-between gap-3">
              <h3 className="text-lg font-bold text-ink-950">{plan.name}</h3>
              {plan.id === 'lifetime' && !onOffer ? <Badge tone="accent">Best value</Badge> : null}
              {onOffer ? <Badge tone="accent">{savedPercent(planId)}% off</Badge> : null}
            </div>
            <p className="mt-1 text-sm text-ink-600">{plan.tagline}</p>

            <p className="mt-5 flex items-baseline gap-2">
              {/*
                The list price is struck through rather than dropped, because a price with
                nothing to compare it against is just a low price — the saving is the offer.
                `<s>` and not a CSS line-through: a screen reader should announce that this
                figure no longer applies.
              */}
              {onOffer ? (
                <s className="text-xl font-semibold text-ink-400 decoration-2">
                  {formatPrice(listPrice(planId))}
                </s>
              ) : null}
              <span
                className={cn(
                  'text-4xl font-extrabold tracking-tight',
                  onOffer ? 'text-accent-700' : 'text-ink-950',
                )}
              >
                {formatPrice(plan.price)}
              </span>
              <span className="text-sm text-ink-500">{intervalLabel(plan.interval)}</span>
            </p>

            {onOffer ? (
              <p className="mt-2 text-[13px] font-semibold text-accent-700">
                Save {formatPrice(savedAmount(planId))} — first {offer?.seats.toLocaleString('en')}{' '}
                members
                {/*
                  The claimed figure is only rendered when the page actually counted it.
                  A scarcity number that is really a graphic is a false claim, so when the
                  count is unavailable this says nothing rather than inventing a number.
                */}
                {seatsClaimed !== undefined ? (
                  <span className="font-normal text-ink-500">
                    {' '}
                    · {seatsClaimed.toLocaleString('en')} claimed so far
                  </span>
                ) : null}
              </p>
            ) : null}

            <p className="mt-3 text-sm leading-relaxed text-ink-600">{plan.description}</p>

            <ul className="mt-6 flex flex-1 flex-col gap-2.5">
              {plan.highlights.map((highlight) => (
                <li key={highlight} className="flex gap-2.5 text-sm text-ink-700">
                  <svg
                    className={cn('mt-0.5 size-4 shrink-0', featured ? 'text-brand-600' : 'text-success-600')}
                    viewBox="0 0 24 24"
                    fill="none"
                    aria-hidden
                  >
                    <path
                      d="m5 12.5 4.5 4.5L19 7.5"
                      stroke="currentColor"
                      strokeWidth="2.4"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                  </svg>
                  {highlight}
                </li>
              ))}
            </ul>

            <ButtonLink
              href={plan.purchasable ? `${checkoutHref}?plan=${plan.id}` : ctaHref}
              variant={featured ? 'primary' : 'outline'}
              size="lg"
              fullWidth
              className="mt-7"
            >
              {plan.purchasable ? `Get ${plan.name}` : 'Start free'}
            </ButtonLink>

            {plan.id === 'free' ? (
              <p className="mt-3 text-center text-xs text-ink-500">No card required</p>
            ) : (
              <p className="mt-3 text-center text-xs text-ink-500">
                Secure checkout with PayPal · 14-day refund
              </p>
            )}
          </div>
        );
      })}
    </div>
  );
}

/** Condensed two-column comparison used on SEO pages that mention pricing in passing. */
export function PlanComparisonRows() {
  const rows: { label: string; free: string; pro: string }[] = [
    {
      label: 'Templates',
      free: `${FREE_TEMPLATE_COUNT} free designs`,
      pro: `All ${TEMPLATE_COUNT} designs`,
    },
    { label: 'Saved CVs', free: 'Up to 2', pro: 'Unlimited' },
    { label: 'PDF downloads', free: '5 per month', pro: 'Unlimited' },
    { label: 'Fonts, spacing, colours', free: 'Accent colour + paper size', pro: 'Full control' },
    { label: 'Custom sections', free: '—', pro: 'Yes' },
    { label: 'Public share link', free: '—', pro: 'Yes' },
    { label: 'Footer credit on PDF', free: 'Yes', pro: 'Removed' },
  ];

  return (
    <div className="overflow-hidden rounded-xl border border-ink-200">
      <table className="w-full border-collapse text-sm">
        <caption className="sr-only">Free plan compared with the Pro plan</caption>
        <thead>
          <tr className="bg-ink-50 text-left">
            <th scope="col" className="px-4 py-3 font-semibold text-ink-950">
              Feature
            </th>
            <th scope="col" className="px-4 py-3 font-semibold text-ink-950">
              Free
            </th>
            <th scope="col" className="px-4 py-3 font-semibold text-brand-700">
              Pro
            </th>
          </tr>
        </thead>
        <tbody>
          {rows.map((row) => (
            <tr key={row.label} className="border-t border-ink-200">
              <th scope="row" className="px-4 py-3 text-left font-medium text-ink-800">
                {row.label}
              </th>
              <td className="px-4 py-3 text-ink-600">{row.free}</td>
              <td className="px-4 py-3 font-medium text-ink-900">{row.pro}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
