import type { Metadata } from 'next';

import { NL_LANDING } from '../nl-landing-copy';
import { NL_SHELL } from '../nl-shell';
import { LandingPage } from '@/components/marketing/LandingPage';
import { pageMetadata } from '@/lib/seo/metadata';

/**
 * `/nl/cv-importeren`.
 *
 * The words live in `nl-landing-copy.ts`; this file gives the route its canonical URL and its
 * metadata. `path` is read from the copy object rather than repeated here, because it also
 * has to match the entry in `TRANSLATED_PATHS` for `hreflang` to pair.
 */
const page = NL_LANDING['cv-importeren']!;

export const metadata: Metadata = pageMetadata({
  title: page.metaTitle,
  description: page.metaDescription,
  path: page.path,
  locale: 'nl',
  keywords: page.keywords,
});

export default function DutchImportCvPage() {
  return <LandingPage page={page} shell={NL_SHELL} />;
}
