import type { Metadata } from 'next';

import { FR_LANDING } from '../fr-landing-copy';
import { FR_SHELL } from '../fr-shell';
import { LandingPage } from '@/components/marketing/LandingPage';
import { pageMetadata } from '@/lib/seo/metadata';

/**
 * `/fr/cv-avec-ia`.
 *
 * The words live in `fr-landing-copy.ts`; this file gives the route its canonical URL and its
 * metadata. `path` is read from the copy object rather than repeated here, because it also
 * has to match the entry in `TRANSLATED_PATHS` for `hreflang` to pair.
 */
const page = FR_LANDING['cv-avec-ia']!;

export const metadata: Metadata = pageMetadata({
  title: page.metaTitle,
  description: page.metaDescription,
  path: page.path,
  locale: 'fr',
  keywords: page.keywords,
});

export default function FrenchAiCvPage() {
  return <LandingPage page={page} shell={FR_SHELL} />;
}
