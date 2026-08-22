import type { Metadata } from 'next';

import { FR_LANDING } from '../fr-landing-copy';
import { FrenchLandingPage } from '../FrenchLandingPage';
import { pageMetadata } from '@/lib/seo/metadata';

/**
 * `/fr/exemples-de-cv`.
 *
 * The words live in `fr-landing-copy.ts` and the shape in `FrenchLandingPage`; this file
 * exists to give the route its canonical URL and its metadata. `path` is read from the copy
 * object rather than repeated here, because it also has to match the entry in
 * `TRANSLATED_PATHS` for `hreflang` to pair — one literal, one place to get it wrong.
 */
const page = FR_LANDING['exemples-de-cv']!;

export const metadata: Metadata = pageMetadata({
  title: page.metaTitle,
  description: page.metaDescription,
  path: page.path,
  locale: 'fr',
  keywords: page.keywords,
});

export default function FrenchCvExamplesPage() {
  return <FrenchLandingPage page={page} />;
}
