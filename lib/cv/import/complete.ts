import { createEmptyCV } from '@/lib/cv/defaults';
import { sectionHasContent } from '@/lib/cv/sections';
import type { Locale } from '@/lib/i18n/locales';
import type { CVData } from '@/types/cv';

/**
 * Turns parsed fields into a document a template can actually render.
 *
 * ## The bug this exists to stop
 *
 * `CVData.sections` is not decoration — array position *is* render order, and the editor's
 * sidebar is a view of it. The parser fills `experience`, `education` and the rest but knows
 * nothing about section configs, so what it returned was a CV with a full history and an
 * empty section list. `cvDataSchema` accepted it, because `sections` defaults to `[]`, and
 * `createCV` only reaches for `createEmptyCV` when no data is supplied at all.
 *
 * The result reached a user: an imported CV reporting 90% complete, with every field
 * populated in the database, that rendered as a blank page with a name on it and offered no
 * sections to edit. The data was never lost — it was simply invisible, which from the far
 * side of the screen is indistinguishable and considerably more alarming.
 *
 * So the parsed fields are laid over a structurally complete document rather than shipped as
 * one. An export that already carries its own sections keeps them; anything else gets the
 * defaults for its language.
 *
 * ## Why `language` is a parameter and not a fallback
 *
 * It was written as `data.language ?? fallback`, which never once reached the fallback:
 * `cvDataSchema` defaults `language` to `'en'`, so by the time validated data arrives the
 * field is always set and the `??` is dead. A French CV came out with English headings — the
 * same bug as the missing sections, in the same place, for the same reason. A schema default
 * is indistinguishable from an author's choice, so the caller states the language outright:
 * the account's locale for a parsed document, the file's own for an export.
 */
export function completeCv(data: Partial<CVData>, language: Locale): CVData {
  const { sections, ...fields } = data;
  const base = createEmptyCV({ ...fields, language });
  // An empty array means "the schema filled this in", not "the author wants no sections".
  const cv = sections && sections.length > 0 ? { ...base, sections } : base;

  /*
   * Anything we read is switched on, even where the default is off.
   *
   * The five sections the parser fills today are all on by default, so this changes nothing
   * yet. It matters the first time it learns to read certifications or projects, which are
   * not — and a section that was read, stored, and then silently not rendered is precisely
   * the failure above, wearing a different hat.
   */
  return {
    ...cv,
    sections: cv.sections.map((section) =>
      section.enabled || !sectionHasContent(cv, section.id)
        ? section
        : { ...section, enabled: true },
    ),
  };
}
