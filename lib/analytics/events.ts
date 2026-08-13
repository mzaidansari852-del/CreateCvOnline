/**
 * Product analytics.
 *
 * One `trackEvent` call site style everywhere, one place that decides where events go.
 * Today that is Google Analytics 4 (when a measurement id is configured) and Firebase
 * Analytics (when a measurement id is configured on the Firebase side).
 *
 * Deliberately conservative about what is collected: event names and low-cardinality
 * properties only. No CV content, no e-mail addresses, no free text a user typed.
 */

export type AnalyticsEvent =
  | 'signup'
  | 'login'
  | 'logout'
  | 'cv_created'
  | 'cv_deleted'
  | 'cv_duplicated'
  | 'template_selected'
  | 'template_previewed'
  | 'cv_downloaded'
  | 'cv_shared'
  | 'cv_printed'
  | 'pricing_viewed'
  | 'checkout_started'
  | 'payment_completed'
  | 'payment_cancelled'
  | 'payment_failed'
  | 'upgrade_prompt_shown'
  | 'editor_section_added'
  | 'search_templates';

export type AnalyticsParams = Record<string, string | number | boolean | undefined>;

interface GtagWindow extends Window {
  gtag?: (command: string, ...args: unknown[]) => void;
  dataLayer?: unknown[];
}

/** Fire-and-forget. Never throws, never blocks the interaction that triggered it. */
export function trackEvent(event: AnalyticsEvent, params: AnalyticsParams = {}): void {
  if (typeof window === 'undefined') return;

  const cleaned: AnalyticsParams = {};
  for (const [key, value] of Object.entries(params)) {
    if (value !== undefined && value !== '') cleaned[key] = value;
  }

  try {
    const win = window as GtagWindow;
    win.gtag?.('event', event, cleaned);
  } catch {
    /* Analytics must never break a user flow. */
  }

  void logToFirebase(event, cleaned);
}

async function logToFirebase(event: AnalyticsEvent, params: AnalyticsParams): Promise<void> {
  try {
    const { publicEnv } = await import('@/lib/env');
    if (!publicEnv.firebase.measurementId) return;
    const [{ getAnalytics, isSupported, logEvent }, { firebaseApp }] = await Promise.all([
      import('firebase/analytics'),
      import('@/lib/firebase/client'),
    ]);
    if (!(await isSupported())) return;
    // Firebase types `logEvent` with per-event parameter shapes for its reserved names
    // (`login`, `sign_up`, …). Our event union deliberately uses those names with our own
    // properties, so the call is widened to the generic custom-event overload.
    const log = logEvent as (
      instance: ReturnType<typeof getAnalytics>,
      name: string,
      params?: Record<string, unknown>,
    ) => void;
    log(getAnalytics(firebaseApp()), event, params);
  } catch {
    /* Optional integration. */
  }
}

/** Manual page-view for client-side navigations (GA4's SPA mode needs the explicit call). */
export function trackPageView(path: string, title?: string): void {
  if (typeof window === 'undefined') return;
  try {
    const win = window as GtagWindow;
    win.gtag?.('event', 'page_view', {
      page_path: path,
      page_title: title ?? document.title,
      page_location: window.location.href,
    });
  } catch {
    /* no-op */
  }
}
