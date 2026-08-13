import type { Metadata } from 'next';
import Link from 'next/link';

import {
  AdminDataAlert,
  AdminPageHeader,
  AdminTable,
  Env,
  StatTile,
  StatTileGrid,
  TableEmptyRow,
  Td,
  Th,
  formatCount,
} from '@/components/admin/primitives';
import { loadAdmin } from '@/components/admin/data';
import { Alert, Badge } from '@/components/ui/feedback';
import { Card } from '@/components/ui/card';
import { templateUsageCounts } from '@/lib/db/cvs';
import { TEMPLATES, TEMPLATE_CATEGORIES } from '@/lib/cv/template-registry';
import { privateMetadata } from '@/lib/seo/metadata';
import { cn } from '@/lib/utils/cn';
import type { TemplateDefinition } from '@/types/cv';

export const metadata: Metadata = privateMetadata(
  'Templates',
  'The template registry and how much each design is used.',
);

const SORT_KEYS = ['name', 'category', 'plan', 'ats', 'columns', 'usage'] as const;
type SortKey = (typeof SORT_KEYS)[number];

function first(value: string | string[] | undefined): string {
  if (Array.isArray(value)) return value[0] ?? '';
  return value ?? '';
}

function parseSort(value: string): SortKey {
  return (SORT_KEYS as readonly string[]).includes(value) ? (value as SortKey) : 'usage';
}

const CATEGORY_LABEL = new Map(TEMPLATE_CATEGORIES.map((entry) => [entry.id, entry.label]));

function compare(
  a: TemplateDefinition,
  b: TemplateDefinition,
  key: SortKey,
  usage: Record<string, number>,
): number {
  switch (key) {
    case 'name':
      return a.name.localeCompare(b.name);
    case 'category':
      return a.category.localeCompare(b.category) || a.name.localeCompare(b.name);
    case 'plan':
      return Number(a.premium) - Number(b.premium) || a.name.localeCompare(b.name);
    case 'ats':
      return a.atsScore - b.atsScore || a.name.localeCompare(b.name);
    case 'columns':
      return a.columns - b.columns || a.name.localeCompare(b.name);
    case 'usage':
    default:
      return (usage[a.id] ?? 0) - (usage[b.id] ?? 0) || a.name.localeCompare(b.name);
  }
}

export default async function AdminTemplatesPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const query = await searchParams;
  const sort = parseSort(first(query.sort));
  const direction = first(query.dir) === 'asc' ? 'asc' : 'desc';

  const usageResult = await loadAdmin(() => templateUsageCounts());
  const usage = usageResult.data ?? {};

  const rows = [...TEMPLATES].sort((a, b) => {
    const value = compare(a, b, sort, usage);
    return direction === 'asc' ? value : -value;
  });

  const totalUsage = Object.values(usage).reduce((sum, count) => sum + count, 0);
  const knownIds = new Set(TEMPLATES.map((template) => template.id));
  const orphanIds = Object.keys(usage).filter((id) => !knownIds.has(id));
  const unused = usageResult.data
    ? TEMPLATES.filter((template) => (usage[template.id] ?? 0) === 0).length
    : 0;
  const premiumCount = TEMPLATES.filter((template) => template.premium).length;

  const sortHref = (key: SortKey) => {
    const nextDirection = sort === key && direction === 'desc' ? 'asc' : 'desc';
    return `/admin/templates?sort=${key}&dir=${nextDirection}`;
  };

  return (
    <div className="space-y-6">
      <AdminPageHeader
        title="Templates"
        description="Every design in the registry, with how many saved CVs currently use it."
      />

      <Alert tone="info" title="Templates are code, not database rows">
        <p>
          Each template is a React component under{' '}
          <Env>components/cv/templates/&lt;category&gt;/</Env>. The registry in{' '}
          <Env>lib/cv/templates.generated.ts</Env> is produced from those files by{' '}
          <Env>npm run generate:templates</Env>, which also runs before every build. There is
          nothing here to create, edit or delete from a browser — adding a design means adding
          a file and shipping a deploy. The contract, the metadata fields and a worked example
          are in <Env>docs/TEMPLATE_AUTHORING.md</Env> in the repository.
        </p>
      </Alert>

      <StatTileGrid>
        <StatTile label="Templates" value={String(TEMPLATES.length)} hint="In the registry." />
        <StatTile
          label="Premium"
          value={String(premiumCount)}
          hint={`${TEMPLATES.length - premiumCount} available on the free plan.`}
        />
        <StatTile
          label="CVs using a template"
          value={usageResult.data ? formatCount(totalUsage) : '—'}
          hint={usageResult.data ? 'Across every account.' : 'Usage could not be read.'}
        />
        <StatTile
          label="Never used"
          value={usageResult.data ? String(unused) : '—'}
          hint={usageResult.data ? 'No saved CV picks these.' : 'Usage could not be read.'}
        />
      </StatTileGrid>

      {usageResult.data ? null : (
        <AdminDataAlert
          configured={usageResult.configured}
          error={usageResult.error}
          what="Template usage counts"
        />
      )}

      {orphanIds.length > 0 ? (
        <Alert tone="warning" title="Saved CVs reference templates that no longer exist">
          <p>
            {orphanIds.length} template id{orphanIds.length === 1 ? '' : 's'} appear in saved
            CVs but are not in the registry: <span className="font-mono text-xs">{orphanIds.join(', ')}</span>.
            Those documents fall back to the default template when they are opened.
          </p>
        </Alert>
      ) : null}

      <Card>
        <AdminTable minWidth={980}>
          <thead>
            <tr>
              <SortableTh label="Template" sortKey="name" active={sort} direction={direction} href={sortHref('name')} sticky />
              <SortableTh label="Category" sortKey="category" active={sort} direction={direction} href={sortHref('category')} />
              <SortableTh label="Plan" sortKey="plan" active={sort} direction={direction} href={sortHref('plan')} />
              <SortableTh label="ATS" sortKey="ats" active={sort} direction={direction} href={sortHref('ats')} align="right" />
              <SortableTh label="Columns" sortKey="columns" active={sort} direction={direction} href={sortHref('columns')} align="right" />
              <SortableTh label="In use" sortKey="usage" active={sort} direction={direction} href={sortHref('usage')} align="right" />
              <Th align="right">Preview</Th>
            </tr>
          </thead>
          <tbody>
            {rows.length === 0 ? (
              <TableEmptyRow colSpan={7}>
                The registry is empty. Run <Env>npm run generate:templates</Env> to rebuild it
                from the component files.
              </TableEmptyRow>
            ) : (
              rows.map((template) => (
                <tr key={template.id}>
                  <Td sticky>
                    <span className="font-medium text-ink-900">{template.name}</span>
                    <span className="ml-2 font-mono text-2xs text-ink-500">{template.id}</span>
                  </Td>
                  <Td>{CATEGORY_LABEL.get(template.category) ?? template.category}</Td>
                  <Td>
                    {template.premium ? (
                      <Badge tone="accent">Premium</Badge>
                    ) : (
                      <Badge tone="success">Free</Badge>
                    )}
                  </Td>
                  <Td align="right">{template.atsScore}/5</Td>
                  <Td align="right">{template.columns}</Td>
                  <Td align="right">
                    {usageResult.data ? (
                      <span className={cn((usage[template.id] ?? 0) === 0 && 'text-ink-400')}>
                        {formatCount(usage[template.id] ?? 0)}
                      </span>
                    ) : (
                      <span className="text-ink-400">—</span>
                    )}
                  </Td>
                  <Td align="right">
                    <Link
                      href={`/templates/${template.slug}`}
                      className="font-semibold text-brand-700 hover:text-brand-800"
                    >
                      View
                    </Link>
                  </Td>
                </tr>
              ))
            )}
          </tbody>
        </AdminTable>
      </Card>
    </div>
  );
}

function SortableTh({
  label,
  sortKey,
  active,
  direction,
  href,
  align = 'left',
  sticky = false,
}: {
  label: string;
  sortKey: SortKey;
  active: SortKey;
  direction: 'asc' | 'desc';
  href: string;
  align?: 'left' | 'right';
  sticky?: boolean;
}) {
  const isActive = active === sortKey;

  return (
    <Th
      align={align}
      sticky={sticky}
      ariaSort={isActive ? (direction === 'asc' ? 'ascending' : 'descending') : 'none'}
    >
      <Link
        href={href}
        className={cn(
          'inline-flex items-center gap-1 hover:text-ink-900',
          isActive && 'text-ink-900',
        )}
      >
        {label}
        <span aria-hidden className={cn('text-[9px]', !isActive && 'opacity-30')}>
          {isActive && direction === 'asc' ? '▲' : '▼'}
        </span>
      </Link>
    </Th>
  );
}
