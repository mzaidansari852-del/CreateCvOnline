'use client';

import { useEffect } from 'react';
import { usePathname, useSearchParams } from 'next/navigation';
import Script from 'next/script';

import { publicEnv } from '@/lib/env';
import { initFirebaseAnalytics } from '@/lib/firebase/client';
import { trackPageView } from '@/lib/analytics/events';

/**
 * Analytics bootstrap.
 *
 * Renders nothing and loads nothing unless a measurement id is configured, so a fresh
 * clone of the project ships zero third-party requests until the operator opts in.
 */
export function Analytics() {
  const measurementId = publicEnv.gaMeasurementId;
  const pathname = usePathname();
  const searchParams = useSearchParams();

  useEffect(() => {
    void initFirebaseAnalytics();
  }, []);

  useEffect(() => {
    if (!measurementId) return;
    const query = searchParams.toString();
    trackPageView(query ? `${pathname}?${query}` : pathname);
  }, [measurementId, pathname, searchParams]);

  if (!measurementId) return null;

  return (
    <>
      <Script
        src={`https://www.googletagmanager.com/gtag/js?id=${measurementId}`}
        strategy="afterInteractive"
      />
      <Script id="ga4-init" strategy="afterInteractive">
        {`window.dataLayer = window.dataLayer || [];
function gtag(){dataLayer.push(arguments);}
window.gtag = gtag;
gtag('js', new Date());
gtag('config', '${measurementId}', { send_page_view: false, anonymize_ip: true });`}
      </Script>
    </>
  );
}
