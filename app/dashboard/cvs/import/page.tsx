import type { Metadata } from 'next';
import { cookies } from 'next/headers';

import { DashboardShell } from '@/components/dashboard/DashboardShell';
import { ImportFlow } from '@/components/dashboard/ImportFlow';
import { ButtonLink } from '@/components/ui/button';
import { requireViewer } from '@/lib/auth/guards';
import { appCopy } from '@/lib/i18n/app-copy';
import { LOCALE_COOKIE, resolveLocale } from '@/lib/i18n/resolve';
import { privateMetadata } from '@/lib/seo/metadata';

export const metadata: Metadata = privateMetadata(
  'Import a CV',
  'Upload an existing CV and turn it into an editable document.',
);

/**
 * Import an existing CV.
 *
 * The whole flow is client-side from here — upload, review, create — because none of it can
 * be prerendered: the interesting state only exists after a file is chosen. This page exists
 * to hold the shell, resolve the language and require a session.
 */
export default async function ImportCvPage() {
  const viewer = await requireViewer('/dashboard/cvs/import');
  const locale = resolveLocale({
    profileLocale: viewer.profile.locale,
    cookieLocale: (await cookies()).get(LOCALE_COOKIE)?.value,
  });
  const copy = appCopy(locale);

  return (
    <DashboardShell
      viewer={viewer}
      title={copy.importCv.title}
      description={copy.importCv.lede}
      actions={
        <ButtonLink href="/dashboard/cvs" variant="outline" size="sm">
          {copy.cvs.backToMyCvs}
        </ButtonLink>
      }
    >
      <ImportFlow />
    </DashboardShell>
  );
}
