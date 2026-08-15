import { SiteFooter } from '@/components/layout/SiteFooter';
import { SiteHeader } from '@/components/layout/SiteHeader';

/**
 * The German site shell.
 *
 * `lang` sits on a wrapping element rather than on `<html>`, for the reason set out in
 * `app/fr/layout.tsx`: a per-locale `<html>` needs multiple root layouts, and there is a
 * shared `app/layout.tsx` serving the dashboard, editor, auth and print routes.
 *
 * There is no language link in the footer here, unlike the first French release — the
 * header now carries a switcher on every page in every language, driven by the same path
 * map as `hreflang`, so a second one below the fold would just be a second thing to keep
 * in step.
 */
export default function GermanLayout({ children }: { children: React.ReactNode }) {
  return (
    <div lang="de" className="flex min-h-dvh flex-col">
      <SiteHeader />
      <main id="main" className="flex-1">
        {children}
      </main>
      <SiteFooter />
    </div>
  );
}
