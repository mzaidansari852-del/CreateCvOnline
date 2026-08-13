import type { Metadata } from 'next';

import { RegisterForm } from '@/components/auth/RegisterForm';
import { firstParam } from '@/components/auth/shared';
import { CVThumbnail } from '@/components/cv/CVThumbnail';
import { Badge } from '@/components/ui/feedback';
import { createDefaultCustomization, createSampleCV } from '@/lib/cv/defaults';
import { findTemplate } from '@/lib/cv/template-registry';
import { privateMetadata } from '@/lib/seo/metadata';
import { site } from '@/lib/site';

export const metadata: Metadata = privateMetadata(
  'Create your account',
  `Create a free ${site.name} account and build a professional CV in minutes.`,
);

/**
 * Sign-up.
 *
 * A visitor who clicked "Use this template" arrives with `?template=<id>`. That is worth
 * honouring twice: the template is shown here so the choice is not silently forgotten,
 * and the id is carried through to the editor once the account exists.
 */
export default async function RegisterPage(props: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const searchParams = await props.searchParams;
  const next = firstParam(searchParams.next);
  const requestedTemplate = firstParam(searchParams.template);
  // An unknown id is ignored rather than faked — the user then simply starts from the
  // default template, which is what the editor would do anyway.
  const template = requestedTemplate ? findTemplate(requestedTemplate) : undefined;

  return (
    <div className="flex flex-col gap-7">
      <div>
        <h1 className="font-display text-3xl leading-tight font-extrabold tracking-tight text-ink-950">
          Create your free account
        </h1>
        <p className="mt-2 text-sm leading-relaxed text-ink-600">
          Two saved CVs and five PDF downloads a month, free forever. No card required.
        </p>
      </div>

      {template ? (
        <div className="flex items-center gap-4 rounded-xl border border-brand-200 bg-brand-50 p-3">
          <CVThumbnail
            cv={createSampleCV()}
            customization={createDefaultCustomization({
              templateId: template.id,
              accentColor: template.accentDefault,
            })}
            width={64}
            className="shrink-0 ring-1 ring-brand-200"
            shadow={false}
          />
          <div className="min-w-0">
            <p className="text-xs font-semibold tracking-wide text-brand-700 uppercase">
              You are starting with
            </p>
            <p className="mt-0.5 flex flex-wrap items-center gap-2 text-sm font-semibold text-ink-950">
              {template.name}
              {template.premium ? <Badge tone="accent">Pro</Badge> : <Badge tone="success">Free</Badge>}
            </p>
            <p className="mt-0.5 text-xs leading-relaxed text-ink-600">
              {template.tagline} You can change template at any time.
            </p>
          </div>
        </div>
      ) : null}

      <RegisterForm templateId={template?.id} next={next} />
    </div>
  );
}
