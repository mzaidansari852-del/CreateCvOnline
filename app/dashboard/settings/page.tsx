import type { Metadata } from 'next';
import Link from 'next/link';
import { cookies } from 'next/headers';
import { Lock } from 'lucide-react';

import { DashboardShell } from '@/components/dashboard/DashboardShell';
import {
  DeleteAccountPanel,
  ExportDataButton,
  NewCVDefaultsForm,
  type TemplateChoice,
} from '@/components/dashboard/SettingsPanels';
import { PromoCodeBox } from '@/components/dashboard/PromoCodeBox';
import { LanguagePanel } from '@/components/i18n/LanguagePanel';
import { Panel } from '@/components/ui/card';
import { Badge } from '@/components/ui/feedback';
import { requireViewer } from '@/lib/auth/guards';
import { DEFAULT_TEMPLATE_ID, getTemplate, TEMPLATES } from '@/lib/cv/template-registry';
import { appCopy } from '@/lib/i18n/app-copy';
import { LOCALE_COOKIE, resolveLocale } from '@/lib/i18n/resolve';
import { privateMetadata } from '@/lib/seo/metadata';
import { site } from '@/lib/site';

export const metadata: Metadata = privateMetadata(
  'Settings',
  'Defaults for new CVs, e-mail preferences and your data.',
);

export default async function SettingsPage() {
  const viewer = await requireViewer('/dashboard/settings');
  const locale = resolveLocale({
    profileLocale: viewer.profile.locale,
    cookieLocale: (await cookies()).get(LOCALE_COOKIE)?.value,
  });
  const copy = appCopy(locale);

  const templates: TemplateChoice[] = TEMPLATES.map((template) => ({
    id: template.id,
    name: template.name,
    categoryLabel: copy.templates.categoryLabel[template.category],
    premium: template.premium,
  }));

  return (
    <DashboardShell
      viewer={viewer}
      title={copy.settings.title}
      description={copy.settings.pageLede}
    >
      <div className="flex flex-col gap-5">
        {/*
          Language first, because it changes everything below it. A user who has just
          worked out that this page exists in order to find the language setting should
          not have to scroll past four panels of English to reach it.
        */}
        <LanguagePanel />

        <Panel title={copy.settings.preferencesHeading} description={copy.settings.preferencesHint}>
          <NewCVDefaultsForm
            templates={templates}
            defaultTemplateName={getTemplate(DEFAULT_TEMPLATE_ID).name}
            canUsePremium={viewer.limits.premiumTemplates}
          />
        </Panel>

        <Panel
          title={copy.settings.emailHeading}
          description={copy.settings.emailHint}
          action={<Badge tone="neutral">{copy.settings.readOnly}</Badge>}
        >
          <dl className="flex flex-col divide-y divide-ink-100">
            <div className="flex flex-wrap items-baseline justify-between gap-2 pb-3">
              <dt className="text-sm text-ink-500">{copy.settings.marketingEmail}</dt>
              <dd className="text-sm font-medium text-ink-900">
                {viewer.profile.marketingOptIn ? (
                  <Badge tone="success">{copy.settings.optedIn}</Badge>
                ) : (
                  <Badge tone="neutral">{copy.settings.optedOut}</Badge>
                )}
              </dd>
            </div>
            <div className="flex flex-wrap items-baseline justify-between gap-2 pt-3">
              <dt className="text-sm text-ink-500">{copy.settings.accountEmail}</dt>
              <dd className="text-sm font-medium text-ink-900">
                {copy.settings.accountEmailAlways}
              </dd>
            </div>
          </dl>

          <div className="mt-4 flex items-start gap-2.5 rounded-lg bg-ink-50 p-3 text-xs leading-relaxed text-ink-600">
            <Lock size={14} aria-hidden className="mt-0.5 shrink-0 text-ink-400" />
            <p>
              {copy.settings.emailLockedLead(site.name)}{' '}
              <Link href="/contact" className="font-semibold text-brand-700 underline">
                {copy.settings.askUs}
              </Link>
              {copy.settings.emailLockedTail}
            </p>
          </div>
        </Panel>

        {/*
          Above the data panel rather than beside the plan, because redeeming is something a
          user comes here to *do* — usually with a code already in their clipboard from a post
          or a message — while the plan section is something they read.
        */}
        <Panel title={copy.settings.promoHeading}>
          <PromoCodeBox />
        </Panel>

        <Panel title={copy.settings.dataHeading} description={copy.settings.dataHint}>
          <ExportDataButton />
          <p className="mt-3 text-xs leading-relaxed text-ink-500">{copy.settings.exportNote}</p>
        </Panel>

        <Panel title={copy.settings.dangerZone} description={copy.settings.dangerZoneHint}>
          <DeleteAccountPanel email={viewer.user.email} />
        </Panel>
      </div>
    </DashboardShell>
  );
}
