import Link from 'next/link';

import { ArrowIcon } from '@/components/marketing/home/icons';
import { categoryPath, TEMPLATE_CATEGORIES, templatesByCategory } from '@/lib/cv/template-registry';

/**
 * The six template categories, straight from the registry.
 *
 * Counts are computed rather than written down, so adding a template updates the homepage
 * without anybody remembering to.
 */
export function CategoryCards() {
  return (
    <ul className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
      {TEMPLATE_CATEGORIES.map((category) => {
        const count = templatesByCategory(category.id).length;
        return (
          <li key={category.id}>
            <Link
              href={categoryPath(category.id)}
              className="group flex h-full flex-col rounded-xl border border-ink-200 bg-white p-5 transition-all duration-200 hover:-translate-y-0.5 hover:border-brand-300 hover:shadow-card-hover"
            >
              <div className="flex items-center justify-between gap-3">
                <h3 className="text-base font-semibold text-ink-950 group-hover:text-brand-700">
                  {category.label}
                </h3>
                <span className="rounded-full bg-ink-100 px-2 py-0.5 text-2xs font-semibold text-ink-600">
                  {count} templates
                </span>
              </div>
              <p className="mt-2 flex-1 text-sm leading-relaxed text-ink-600">{category.blurb}</p>
              <span className="mt-4 inline-flex items-center gap-1.5 text-sm font-semibold text-brand-700">
                Browse {category.label} templates
                <ArrowIcon className="size-3.5 transition-transform group-hover:translate-x-0.5" />
              </span>
            </Link>
          </li>
        );
      })}
    </ul>
  );
}
