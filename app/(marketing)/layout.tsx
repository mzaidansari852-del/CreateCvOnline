import { SiteFooter } from '@/components/layout/SiteFooter';
import { SiteHeader } from '@/components/layout/SiteHeader';

/**
 * The public site shell.
 *
 * Everything crawlable lives under this layout: marketing pages, SEO landing pages,
 * template pages, the blog and the legal pages. It is deliberately separate from the
 * dashboard shell so that no authenticated chrome ever ships to an anonymous visitor.
 */
export default function MarketingLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex min-h-dvh flex-col">
      <SiteHeader />
      <main id="main" className="flex-1">
        {children}
      </main>
      <SiteFooter />
    </div>
  );
}
