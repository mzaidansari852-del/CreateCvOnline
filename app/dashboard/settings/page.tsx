import type { Metadata } from 'next';
import Link from 'next/link';
import { Lock } from 'lucide-react';

import { DashboardShell } from '@/components/dashboard/DashboardShell';
import {
  DeleteAccountPanel,
  ExportDataButton,
  NewCVDefaultsForm,
  type TemplateChoice,
} from '@/components/dashboard/SettingsPanels';
import { LanguagePanel } from '@/components/i18n/LanguagePanel';
import { Panel } from '@/components/ui/card';
import { Badge } from '@/components/ui/feedback';
import { requireViewer } from '@/lib/auth/guards';
import {
  DEFAULT_TEMPLATE_ID,
  getTemplate,
  TEMPLATES,
  TEMPLATE_CATEGORIES,
} from '@/lib/cv/template-registry';
import { privateMetadata } from '@/lib/seo/metadata';
import { site } from '@/lib/site';

export const metadata: Metadata = privateMetadata(
  'Settings',
  'Defaults for new CVs, e-mail preferences and your data.',
);

const CATEGORY_LABELS = new Map(
  TEMPLATE_CATEGORIES.map((category) => [category.id as string, category.label]),
);

export default async function SettingsPage() {
  const viewer = await requireViewer('/dashboard/settings');

  const templates: TemplateChoice[] = TEMPLATES.map((template) => ({
    id: template.id,
    name: template.name,
    categoryLabel: CATEGORY_LABELS.get(template.category) ?? template.category,
    premium: template.premium,
  }));

  return (
    <DashboardShell
      viewer={viewer}
      title="Settings"
      description="Only the things that genuinely do something are switchable here. Everything else says so."
    >
      <div className="flex flex-col gap-5">
        {/*
          Language first, because it changes everything below it. A user who has just
          worked out that this page exists in order to find the language setting should
          not have to scroll past four panels of English to reach it.
        */}
        <LanguagePanel />

        <Panel
          title="New CV defaults"
          description="Applied the next time you create a CV from this browser."
        >
          <NewCVDefaultsForm
            templates={templates}
            defaultTemplateName={getTemplate(DEFAULT_TEMPLATE_ID).name}
            canUsePremium={viewer.limits.premiumTemplates}
          />
        </Panel>

        <Panel
          title="E-mail preferences"
          description="What we are allowed to send you."
          action={<Badge tone="neutral">Read-only</Badge>}
        >
          <dl className="flex flex-col divide-y divide-ink-100">
            <div className="flex flex-wrap items-baseline justify-between gap-2 pb-3">
              <dt className="text-sm text-ink-500">Product and marketing e-mail</dt>
              <dd className="text-sm font-medium text-ink-900">
                {viewer.profile.marketingOptIn ? (
                  <Badge tone="success">Opted in</Badge>
                ) : (
                  <Badge tone="neutral">Opted out</Badge>
                )}
              </dd>
            </div>
            <div className="flex flex-wrap items-baseline justify-between gap-2 pt-3">
              <dt className="text-sm text-ink-500">Account e-mail</dt>
              <dd className="text-sm font-medium text-ink-900">
                Always sent — receipts, verification and security notices
              </dd>
            </div>
          </dl>

          <div className="mt-4 flex items-start gap-2.5 rounded-lg bg-ink-50 p-3 text-xs leading-relaxed text-ink-600">
            <Lock size={14} aria-hidden className="mt-0.5 shrink-0 text-ink-400" />
            <p>
              {site.name} has no endpoint for changing this yet, so there is no switch here that
              would pretend to work. Every marketing e-mail carries a one-click unsubscribe link, or{' '}
              <Link href="/contact" className="font-semibold text-brand-700 underline">
                ask us
              </Link>{' '}
              to change it.
            </p>
          </div>
        </Panel>

        <Panel
          title="Your data"
          description="Take a copy of everything you have written here, at any time."
        >
          <ExportDataButton />
          <p className="mt-3 text-xs leading-relaxed text-ink-500">
            The file contains every CV in full — personal details, sections, and the design settings
            for each one — as JSON. It is built in your browser from your own account, so nothing is
            stored or sent anywhere else.
          </p>
        </Panel>

        <Panel title="Danger zone" description="Irreversible things.">
          <DeleteAccountPanel email={viewer.user.email} />
        </Panel>
      </div>
    </DashboardShell>
  );
}
