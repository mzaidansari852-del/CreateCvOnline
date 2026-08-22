import type { Metadata } from 'next';
import { cookies } from 'next/headers';

import { DashboardShell } from '@/components/dashboard/DashboardShell';
import { InterviewFlow } from '@/components/dashboard/InterviewFlow';
import { ButtonLink } from '@/components/ui/button';
import { requireViewer } from '@/lib/auth/guards';
import { appCopy } from '@/lib/i18n/app-copy';
import { LOCALE_COOKIE, resolveLocale } from '@/lib/i18n/resolve';
import { privateMetadata } from '@/lib/seo/metadata';

export const metadata: Metadata = privateMetadata(
  'Build a CV',
  'Answer a few questions and we will write the CV from your answers.',
);

/**
 * The interview.
 *
 * Everything after this line is client-side: the answers only exist in the browser until the
 * person asks for them to be written, and holding them server-side would mean a second
 * collection to secure, to migrate and to delete when an account closes — for a form that a
 * refresh already survives through `localStorage`.
 */
export default async function BuildCvPage() {
  const viewer = await requireViewer('/dashboard/cvs/build');
  const locale = resolveLocale({
    profileLocale: viewer.profile.locale,
    cookieLocale: (await cookies()).get(LOCALE_COOKIE)?.value,
  });
  const copy = appCopy(locale);

  return (
    <DashboardShell
      viewer={viewer}
      title={copy.interview.title}
      description={copy.interview.lede}
      actions={
        <ButtonLink href="/dashboard/cvs" variant="outline" size="sm">
          {copy.cvs.backToMyCvs}
        </ButtonLink>
      }
    >
      <InterviewFlow />
    </DashboardShell>
  );
}
