import type { Metadata } from 'next';

import { NL_LANDING } from '../nl-landing-copy';
import { NL_SHELL } from '../nl-shell';
import { LandingPage } from '@/components/marketing/LandingPage';
import { pageMetadata } from '@/lib/seo/metadata';

/**
 * `/nl/cv-schrijven`.
 *
 * The words live in `nl-landing-copy.ts` and the shape in `LandingPage`; this file gives the
 * route its canonical URL and its metadata. `path` is read from the copy object rather than
 * repeated here, because it also has to match the entry in `TRANSLATED_PATHS` for `hreflang`
 * to pair — one literal, one place to get it wrong.
 */
const page = NL_LANDING['cv-schrijven']!;

export const metadata: Metadata = pageMetadata({
  title: page.metaTitle,
  description: page.metaDescription,
  path: page.path,
  locale: 'nl',
  keywords: page.keywords,
});

export default function DutchWriteCvPage() {
  return <LandingPage page={page} shell={NL_SHELL} />;
}
