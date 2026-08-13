import { FileQuestion } from 'lucide-react';

import { ButtonLink } from '@/components/ui/button';
import { EmptyState } from '@/components/ui/feedback';

/**
 * Shown when the id in the URL does not resolve to a CV this account owns.
 *
 * The wording deliberately does not distinguish "deleted" from "someone else's": leaking
 * which document ids exist would be a small but real information disclosure.
 */
export default function CVNotFound() {
  return (
    <div className="grid min-h-dvh place-items-center p-6">
      <div className="w-full max-w-lg">
        <EmptyState
          icon={<FileQuestion size={20} aria-hidden />}
          title="That CV is not here"
          description="It may have been deleted, or the link may point at a CV in another account."
          action={<ButtonLink href="/dashboard/cvs">Back to my CVs</ButtonLink>}
          secondaryAction={
            <ButtonLink href="/dashboard/cvs/new" variant="outline">
              Create a new CV
            </ButtonLink>
          }
        />
      </div>
    </div>
  );
}
