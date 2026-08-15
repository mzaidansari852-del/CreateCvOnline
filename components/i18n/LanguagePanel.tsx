'use client';

import { LanguageSwitcher } from '@/components/i18n/LanguageSwitcher';
import { useCopy } from '@/components/i18n/LocaleProvider';
import { Panel } from '@/components/ui/card';

/**
 * The Settings entry for the interface language.
 *
 * A thin wrapper, but it earns its place: `Panel` needs a translated title and description,
 * and those come from a hook, so the settings page — a server component — cannot supply
 * them inline. Keeping the wrapper here rather than in `SettingsPanels.tsx` also keeps
 * everything language-related under `components/i18n`, which is where the next person will
 * look.
 *
 * The description is the important part. Two languages that can differ is confusing unless
 * the difference is stated, so this says plainly that the CV has its own.
 */
export function LanguagePanel() {
  const copy = useCopy();

  return (
    <Panel title={copy.settings.languageHeading} description={copy.settings.languageHint}>
      <LanguageSwitcher variant="field" />
    </Panel>
  );
}
