import { NextResponse } from 'next/server';

import { apiError, authedRoute } from '@/lib/api/handler';
import { getCV, recordCVDownload } from '@/lib/db/cvs';
import { recordDownload } from '@/lib/db/users';
import { assertCanDownload, assertCanUseTemplate } from '@/lib/entitlements';
import { effectivePlan } from '@/lib/plans';
import { PdfUnavailableError, pdfFileName, renderCVPdf } from '@/lib/pdf/render';
import { site } from '@/lib/site';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';
/** A three-page CV with webfonts takes a few seconds to paginate in Chromium. */
export const maxDuration = 60;

type Params = { id: string };

/**
 * PDF export.
 *
 * Every gate lives here rather than in the UI: the download quota, the premium-template
 * check, and whether the export carries the footer credit. A user who calls this endpoint
 * directly gets exactly the same answer as one who clicks the button.
 */
export const GET = authedRoute<Params>(
  { scope: 'cv-pdf', rateLimit: { max: 20, windowSeconds: 60 } },
  async ({ profile, params }) => {
    const cv = await getCV(profile.uid, params.id);

    assertCanDownload(profile);
    assertCanUseTemplate(profile, cv.customization.templateId);

    const plan = effectivePlan(profile.entitlement);

    try {
      const { buffer, pageCount } = await renderCVPdf({
        cv: cv.data,
        customization: cv.customization,
        branding: plan.limits.removeBranding
          ? null
          : { label: `Made with ${site.name}`, url: site.domain },
      });

      // Only count a download that actually produced a file.
      await Promise.all([recordDownload(profile.uid), recordCVDownload(profile.uid, params.id)]);

      return new NextResponse(new Uint8Array(buffer), {
        status: 200,
        headers: {
          'Content-Type': 'application/pdf',
          'Content-Disposition': `attachment; filename="${pdfFileName(cv.data, cv.title)}"`,
          'Content-Length': String(buffer.byteLength),
          'Cache-Control': 'private, no-store',
          'X-PDF-Pages': String(pageCount),
        },
      });
    } catch (error) {
      if (error instanceof PdfUnavailableError) {
        return apiError(503, 'pdf-unavailable', error.message);
      }
      throw error;
    }
  },
);
