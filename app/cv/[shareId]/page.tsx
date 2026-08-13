import type { Metadata } from 'next';
import Link from 'next/link';
import { notFound } from 'next/navigation';

import { CVPagePreview } from '@/components/cv/CVThumbnail';
import { Logo } from '@/components/brand/Logo';
import { ButtonLink } from '@/components/ui/button';
import { getSharedCV } from '@/lib/db/cvs';
import { fullName } from '@/lib/cv/format';
import { site } from '@/lib/site';

export const dynamic = 'force-dynamic';

/**
 * A publicly shared CV.
 *
 * Reachable only by an unguessable 24-character id that the owner explicitly generated,
 * and always `noindex` — a CV is personal data, and the person sharing it wants a link to
 * send to one recruiter, not a page in a search index.
 */
export async function generateMetadata(props: {
  params: Promise<{ shareId: string }>;
}): Promise<Metadata> {
  const { shareId } = await props.params;
  const cv = await getSharedCV(shareId);

  return {
    title: cv ? `${fullName(cv.data) || 'CV'} — CV` : 'CV not found',
    description: cv?.data.personal.title || undefined,
    robots: { index: false, follow: false, nocache: true, googleBot: { index: false, follow: false } },
  };
}

export default async function SharedCVPage(props: { params: Promise<{ shareId: string }> }) {
  const { shareId } = await props.params;
  const cv = await getSharedCV(shareId);
  if (!cv) notFound();

  const name = fullName(cv.data);

  return (
    <div className="flex min-h-dvh flex-col bg-ink-100">
      <header className="border-b border-ink-200 bg-white">
        <div className="container-page flex h-14 items-center justify-between gap-4">
          <Logo />
          <ButtonLink href="/register" size="sm">
            Build your own CV
          </ButtonLink>
        </div>
      </header>

      <main id="main" className="flex-1 px-4 py-10">
        <div className="mx-auto flex max-w-3xl flex-col items-center">
          <h1 className="sr-only">{name ? `${name} — CV` : 'Shared CV'}</h1>
          <CVPagePreview cv={cv.data} customization={cv.customization} maxWidth={794} className="w-full max-w-full" />
        </div>
      </main>

      <footer className="border-t border-ink-200 bg-white py-6">
        <div className="container-page text-center text-[13px] text-ink-500">
          <p>
            Shared with {site.name} ·{' '}
            <Link href="/" className="font-medium text-brand-700 hover:text-brand-800">
              {site.domain}
            </Link>
          </p>
          <p className="mt-1">
            This page is not indexed by search engines. The owner can revoke the link at any time.
          </p>
        </div>
      </footer>
    </div>
  );
}
