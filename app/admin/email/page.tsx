import type { Metadata } from 'next';

import { AdminDataAlert, AdminPageHeader } from '@/components/admin/primitives';
import { loadAdmin } from '@/components/admin/data';
import { EmailComposer } from './EmailComposer';
import { audienceSummary } from '@/lib/db/audience';
import { readLaunchOffer } from '@/lib/db/offers';
import { EMAIL_TEMPLATES } from '@/lib/email/templates';
import { serverEnv } from '@/lib/env';
import { privateMetadata } from '@/lib/seo/metadata';
import { site } from '@/lib/site';

export const metadata: Metadata = privateMetadata('Email', `Announcements from ${site.name}.`);

export const dynamic = 'force-dynamic';

export default async function AdminEmailPage() {
  const audience = await loadAdmin(() => audienceSummary());
  const offer = await readLaunchOffer();
  const smtp = serverEnv().smtp;

  return (
    <div className="space-y-8">
      <AdminPageHeader
        title="Email"
        description="Announcements to members who opted in to product e-mail, each in their own language. Preview it, send yourself a test, then send — a campaign cannot be recalled."
      />

      {audience.configured ? (
        <EmailComposer
          templates={EMAIL_TEMPLATES.map((template) => ({
            id: template.id,
            name: template.name,
            description: template.description,
            requiresOffer: template.requiresOffer,
          }))}
          audience={audience.data}
          offerActive={offer !== null}
          smtpConfigured={smtp !== null}
          smtpFrom={smtp?.from ?? null}
        />
      ) : (
        <AdminDataAlert configured={audience.configured} error={audience.error} what="The audience" />
      )}
    </div>
  );
}
