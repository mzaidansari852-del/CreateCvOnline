import type { Metadata } from 'next';

import { DE_LANDING } from '../de-landing-copy';
import { DE_SHELL } from '../de-shell';
import { LandingPage } from '@/components/marketing/LandingPage';
import { pageMetadata } from '@/lib/seo/metadata';

/**
 * `/de/faq`.
 *
 * The words live in `de-landing-copy.ts` and the shape in `LandingPage`; this file gives the
 * route its canonical URL and its metadata. `path` is read from the copy object rather than
 * repeated here, because it also has to match the entry in `TRANSLATED_PATHS` for `hreflang`
 * to pair — one literal, one place to get it wrong.
 */
const page = DE_LANDING['faq']!;

export const metadata: Metadata = pageMetadata({
  title: page.metaTitle,
  description: page.metaDescription,
  path: page.path,
  locale: 'de',
  keywords: page.keywords,
});

export default function GermanFaqPage() {
  return <LandingPage page={page} shell={DE_SHELL} />;
}
