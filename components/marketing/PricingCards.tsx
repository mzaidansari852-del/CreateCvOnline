import { ButtonLink } from '@/components/ui/button';
import { Badge } from '@/components/ui/feedback';
import { FREE_TEMPLATE_COUNT, TEMPLATE_COUNT } from '@/lib/cv/template-registry';
import { publicEnv } from '@/lib/env';
import { PLAN_ORDER, PLANS } from '@/lib/plans';
import { cn } from '@/lib/utils/cn';

/**
 * The pricing table.
 *
 * Rendered from `lib/plans.ts`, which is the same object the server reads when it decides
 * what a user may do — so the page can never advertise a limit the backend does not
 * actually enforce.
 */

const currencySymbols: Record<string, string> = { USD: '$', EUR: '€', GBP: '£', MAD: 'MAD ' };

function formatPrice(value: string): string {
  const symbol = currencySymbols[publicEnv.paypalCurrency] ?? `${publicEnv.paypalCurrency} `;
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

export function PricingCards({
  ctaHref = '/register',
  className,
}: {
  ctaHref?: string;
  className?: string;
}) {
  return (
    <div className={cn('grid gap-6 lg:grid-cols-3', className)}>
      {PLAN_ORDER.map((planId) => {
        const plan = PLANS[planId];
        const featured = plan.featured;

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
                <Badge tone="brand" className="bg-brand-600 text-white ring-brand-600">
                  Most popular
                </Badge>
              </span>
            ) : null}

            <div className="flex items-baseline justify-between gap-3">
              <h3 className="text-lg font-bold text-ink-950">{plan.name}</h3>
              {plan.id === 'lifetime' ? <Badge tone="accent">Best value</Badge> : null}
            </div>
            <p className="mt-1 text-sm text-ink-600">{plan.tagline}</p>

            <p className="mt-5 flex items-baseline gap-1.5">
              <span className="text-4xl font-extrabold tracking-tight text-ink-950">
                {formatPrice(plan.price)}
              </span>
              <span className="text-sm text-ink-500">{intervalLabel(plan.interval)}</span>
            </p>

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
              href={plan.purchasable ? `${ctaHref}?plan=${plan.id}` : ctaHref}
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
