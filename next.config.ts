import type { NextConfig } from 'next';

/**
 * Content Security Policy.
 *
 * The policy is intentionally explicit: every third-party origin the app talks to
 * (Firebase, Paddle, Google Analytics, Google Fonts) is listed here and nowhere else.
 *
 * Paddle is the one entry that is a wildcard rather than a host list, and it is deliberate.
 * Its overlay is assembled from several subdomains that differ by environment and by payment
 * method — `cdn.` serves the script, `buy.` the checkout frame, `checkout-service.` the XHR,
 * each with a `sandbox-` twin — and a card form that renders in an iframe is exactly the
 * place where an origin missing from this list produces a blank box rather than an error
 * anyone reads. `https://*.paddle.com` is still bounded by a domain Paddle controls, which
 * is the property that matters; enumerating the subdomains buys nothing and breaks the next
 * time Paddle adds one.
 *
 * `'unsafe-inline'` is required in `script-src` because the public marketing pages are
 * statically pre-rendered and Next.js emits inline bootstrap scripts for them. A stricter
 * nonce-based policy would force every page into dynamic rendering, which would defeat the
 * performance goals of the marketing site. Moving to a nonce-based policy means opting
 * every page into dynamic rendering, which is a trade this site has not made.
 */
const csp = [
  `default-src 'self'`,
  `base-uri 'self'`,
  `object-src 'none'`,
  `frame-ancestors 'none'`,
  `form-action 'self'`,
  `script-src 'self' 'unsafe-inline' https://www.googletagmanager.com https://apis.google.com https://*.firebaseapp.com https://*.paddle.com`,
  `style-src 'self' 'unsafe-inline' https://fonts.googleapis.com https://*.paddle.com`,
  `font-src 'self' data: https://fonts.gstatic.com https://*.paddle.com`,
  `img-src 'self' data: blob: https://*.googleusercontent.com https://firebasestorage.googleapis.com https://www.google-analytics.com https://*.paddle.com`,
  `connect-src 'self' https://*.googleapis.com https://*.firebaseio.com https://*.firebase.com wss://*.firebaseio.com https://securetoken.googleapis.com https://identitytoolkit.googleapis.com https://firebasestorage.googleapis.com https://www.google-analytics.com https://*.paddle.com`,
  `frame-src 'self' https://*.firebaseapp.com https://accounts.google.com https://*.paddle.com`,
  `worker-src 'self' blob:`,
  `manifest-src 'self'`,
  `upgrade-insecure-requests`,
].join('; ');

const securityHeaders = [
  { key: 'Content-Security-Policy', value: csp },
  { key: 'X-Content-Type-Options', value: 'nosniff' },
  { key: 'X-Frame-Options', value: 'DENY' },
  { key: 'Referrer-Policy', value: 'strict-origin-when-cross-origin' },
  { key: 'X-DNS-Prefetch-Control', value: 'on' },
  {
    key: 'Permissions-Policy',
    value: 'camera=(), microphone=(), geolocation=(), browsing-topics=(), interest-cohort=()',
  },
  { key: 'Strict-Transport-Security', value: 'max-age=63072000; includeSubDomains; preload' },
  { key: 'Cross-Origin-Opener-Policy', value: 'same-origin-allow-popups' },
];

const nextConfig: NextConfig = {
  reactStrictMode: true,
  poweredByHeader: false,
  compress: true,

  // These packages must not be bundled by the server compiler — they load native
  // binaries (firebase-admin gRPC, the headless Chromium used for PDF export).
  serverExternalPackages: ['firebase-admin', 'puppeteer-core', '@sparticuz/chromium'],

  /*
   * Ship Chromium's payload with the function that launches it.
   *
   * `serverExternalPackages` stops the compiler bundling the package; it does not decide
   * what gets *deployed*. Next traces a function's dependencies by following `import` and
   * `require`, and `@sparticuz/chromium` does not require its binaries — it decompresses
   * `bin/chromium.br` from disk at run time, by path. Nothing in the module graph mentions
   * those files, so tracing leaves them behind and the deployed function contains the
   * library without the browser: `executablePath()` finds nothing, and PDF export fails at
   * the moment a customer presses Download, having built fine.
   *
   * Vercel raised the function size limit to 5 GB on 30 June 2026, so including the ~68 MB
   * of Brotli payload is no longer the trade-off it once was — `@sparticuz/chromium-min`
   * plus a remotely-hosted pack exists for the old 250 MB ceiling and is not needed here.
   */
  outputFileTracingIncludes: {
    'app/api/cvs/**': ['./node_modules/@sparticuz/chromium/bin/**'],
  },

  images: {
    formats: ['image/avif', 'image/webp'],
    remotePatterns: [
      { protocol: 'https', hostname: 'firebasestorage.googleapis.com' },
      { protocol: 'https', hostname: 'lh3.googleusercontent.com' },
      { protocol: 'https', hostname: 'storage.googleapis.com' },
    ],
  },

  experimental: {
    optimizePackageImports: ['lucide-react'],
  },

  async headers() {
    return [
      {
        source: '/:path*',
        headers: securityHeaders,
      },
      {
        // Static template thumbnails are immutable and content-addressed by slug.
        source: '/template-previews/:path*',
        headers: [{ key: 'Cache-Control', value: 'public, max-age=31536000, immutable' }],
      },
    ];
  },

  async redirects() {
    return [
      { source: '/signup', destination: '/register', permanent: true },
      { source: '/sign-in', destination: '/login', permanent: true },
      { source: '/sign-up', destination: '/register', permanent: true },
      // Common alternate spellings that would otherwise 404. Note that
      // `/resume-templates`, `/cv-templates` and the other keyword paths are real
      // pages, not redirects — redirecting them away would throw away the ranking
      // they exist to earn.
      { source: '/cv-template', destination: '/cv-templates', permanent: true },
      { source: '/resume-template', destination: '/resume-templates', permanent: true },
      { source: '/curriculum-vitae', destination: '/professional-cv', permanent: true },
      // `/templates?category=…` is consolidated in `proxy.ts` instead: a `redirects()` rule
      // forwards the unconsumed query onto the destination, which recreates the second
      // address the redirect exists to remove.
    ];
  },
};

export default nextConfig;
