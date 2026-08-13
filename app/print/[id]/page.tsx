import type { Metadata } from 'next';
import { notFound } from 'next/navigation';

import { PrintTrigger } from '@/components/cv/PrintTrigger';
import { CVDocument, documentPageBackground } from '@/components/cv/CVDocument';
import { getSessionUser } from '@/lib/auth/session';
import { findCV } from '@/lib/db/cvs';
import { googleFontsHref, PAPER } from '@/lib/cv/format';
import { printPageCss } from '@/lib/cv/document-css';
import { verifyRenderToken } from '@/lib/pdf/token';
import { privateMetadata } from '@/lib/seo/metadata';

export const metadata: Metadata = privateMetadata('Print CV');
export const dynamic = 'force-dynamic';

/**
 * The browser-print view.
 *
 * A bare page containing nothing but the document, so `Ctrl+P` produces the same result
 * as the server-side PDF export. Two ways in, both authenticated: the owner's session
 * cookie, or a short-lived signed render token. Never indexable.
 */
export default async function PrintCVPage(props: {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ token?: string }>;
}) {
  const [{ id }, { token }] = await Promise.all([props.params, props.searchParams]);

  const claims = verifyRenderToken(token);
  const user = claims ? null : await getSessionUser();
  const ownerId = claims?.uid ?? user?.uid;

  if (!ownerId) notFound();
  if (claims && claims.cvId !== id) notFound();

  const cv = await findCV(ownerId, id);
  if (!cv) notFound();

  const paper = PAPER[cv.customization.paperSize];
  const fontsHref = googleFontsHref([cv.customization.bodyFont, cv.customization.headingFont]);
  const background = documentPageBackground(cv.customization);

  return (
    <>
      {fontsHref ? <link rel="stylesheet" href={fontsHref} /> : null}
      <style
        // Page-box rules belong only to this route — injecting them globally would
        // change what every other page prints as.
        dangerouslySetInnerHTML={{
          __html: `${printPageCss(paper.puppeteerFormat)}
${background ? `body { background: ${background}; }` : 'body { background: #f1f3f7; }'}
@media screen { body { padding: 24px 0; } .cv-page { margin: 0 auto; box-shadow: 0 18px 48px -16px rgba(10,14,24,.28); } }`,
        }}
      />
      <PrintTrigger title={cv.title} />
      <CVDocument cv={cv.data} customization={cv.customization} />
    </>
  );
}
