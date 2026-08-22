import { Suspense } from 'react';
import type { Metadata, Viewport } from 'next';

import './globals.css';

import { Analytics } from '@/components/analytics/Analytics';
import { AuthProvider } from '@/components/auth/AuthProvider';
import { JsonLd } from '@/components/seo/JsonLd';
import { HtmlLang } from '@/components/layout/HtmlLang';
import { SkipLink } from '@/components/layout/SkipLink';
import { ToastProvider } from '@/components/ui/toast';
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

/**
 * The root layout must not read the session.
 *
 * `getSessionUser()` reads `cookies()`, and a cookie read anywhere in the root layout opts
 * *every route in the application* out of static rendering. That turned all 56 template
 * pages, the 13 landing pages and the home page into per-request renders — each one
 * rebuilding eight CV documents through `renderToStaticMarkup` and emitting ~650KB, with
 * nothing cacheable in front of it. It also embedded the signed-in user's address, uid and
 * role in the markup of public marketing pages.
 *
 * The failure was invisible locally: `getSessionUser()` returns early when Firebase Admin
 * credentials are absent, so a credential-less build still reported the pages as static.
 * Production has credentials, so production was fully dynamic.
 *
 * `AuthProvider` resolves the user from the Firebase client SDK instead. Server components
 * that need an authoritative user still call `requireViewer()` / `requireUser()` directly,
 * which keeps the cookie read inside the private routes where dynamic rendering is correct.
 */
export default function RootLayout({ children }: { children: React.ReactNode }) {
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
        <HtmlLang />
        <SkipLink />

        <AuthProvider>
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
