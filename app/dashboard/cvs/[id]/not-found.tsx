import { cookies } from 'next/headers';
import { FileQuestion } from 'lucide-react';

import { ButtonLink } from '@/components/ui/button';
import { EmptyState } from '@/components/ui/feedback';
import { getViewer } from '@/lib/auth/guards';
import { appCopy } from '@/lib/i18n/app-copy';
import { LOCALE_COOKIE, resolveLocale } from '@/lib/i18n/resolve';

/**
 * Shown when the id in the URL does not resolve to a CV this account owns.
 *
 * The wording deliberately does not distinguish "deleted" from "someone else's": leaking
 * which document ids exist would be a small but real information disclosure.
 */
export default async function CVNotFound() {
  /*
   * `getViewer` rather than `requireViewer`: a not-found boundary must render, not
   * redirect. The lookup is memoised for the request, so on the ordinary path — the page
   * above called `requireViewer` and then `notFound()` — this costs nothing.
   */
  const viewer = await getViewer();
  const locale = resolveLocale({
    profileLocale: viewer?.profile.locale,
    cookieLocale: (await cookies()).get(LOCALE_COOKIE)?.value,
  });
  const copy = appCopy(locale);

  return (
    <div className="grid min-h-dvh place-items-center p-6">
      <div className="w-full max-w-lg">
        <EmptyState
          icon={<FileQuestion size={20} aria-hidden />}
          title={copy.cvs.notFoundTitle}
          description={copy.cvs.notFoundBody}
          action={<ButtonLink href="/dashboard/cvs">{copy.cvs.backToMyCvs}</ButtonLink>}
          secondaryAction={
            <ButtonLink href="/dashboard/cvs/new" variant="outline">
              {copy.cvs.createTitle}
            </ButtonLink>
          }
        />
      </div>
    </div>
  );
}
