import { Suspense } from 'react';
import type { Metadata, Viewport } from 'next';

import './globals.css';

import { Analytics } from '@/components/analytics/Analytics';
import { AuthProvider } from '@/components/auth/AuthProvider';
import { JsonLd } from '@/components/seo/JsonLd';
import { ToastProvider } from '@/components/ui/toast';
import { getSessionUser } from '@/lib/auth/session';
import { CV_DOCUMENT_CSS } from '@/lib/cv/document-css';
import { rootMetadata } from '@/lib/seo/metadata';
import { organizationSchema, websiteSchema } from '@/lib/seo/schema';

export const metadata: Metadata = rootMetadata();

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  viewportFit: 'cover',
  themeColor: [
    { media: '(prefers-color-scheme: light)', color: '#ffffff' },
    { media: '(prefers-color-scheme: dark)', color: '#0a0e18' },
  ],
};

/**
 * Fonts are loaded from Google Fonts with `preconnect` + `display=swap` rather than
 * `next/font`, because the CV templates let a user pick from fifteen families and the
 * PDF renderer must be able to request any of them at run time. Self-hosting all fifteen
 * would add several megabytes to the repository for no user-visible gain.
 */
const UI_FONTS =
  'https://fonts.googleapis.com/css2' +
  '?family=Inter:wght@300..800' +
  '&family=Plus+Jakarta+Sans:wght@500..800' +
  '&display=swap';

export default async function RootLayout({ children }: { children: React.ReactNode }) {
  const sessionUser = await getSessionUser();

  return (
    <html lang="en" dir="ltr" data-scroll-behavior="smooth">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link rel="stylesheet" href={UI_FONTS} />
        {/* Shared by the live preview, the print route and the PDF renderer. */}
        <style
          id="cv-document-css"
          dangerouslySetInnerHTML={{ __html: CV_DOCUMENT_CSS }}
        />
      </head>
      <body className="min-h-dvh bg-white antialiased">
        <a href="#main" className="sr-focusable rounded-lg bg-brand-600 font-semibold text-white">
          Skip to main content
        </a>

        <AuthProvider initialUser={sessionUser}>
          <ToastProvider>{children}</ToastProvider>
        </AuthProvider>

        <JsonLd nodes={[organizationSchema(), websiteSchema()]} />

        <Suspense fallback={null}>
          <Analytics />
        </Suspense>
      </body>
    </html>
  );
}
