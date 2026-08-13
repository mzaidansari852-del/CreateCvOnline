import type { Metadata } from 'next';
import Link from 'next/link';

import {
  AdminDataAlert,
  AdminPageHeader,
  AdminTable,
  PlanBadge,
  SubscriptionBadge,
  TableEmptyRow,
  Td,
  Th,
  formatCount,
  shortId,
} from '@/components/admin/primitives';
import { UserActions } from '@/components/admin/UserActions';
import { loadAdmin } from '@/components/admin/data';
import { Badge } from '@/components/ui/feedback';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/form';
import { requireAdmin } from '@/lib/auth/guards';
import { countUsers, listUsers } from '@/lib/db/users';
import { formatDateTime } from '@/lib/cv/format';
import { effectivePlan, getPlan } from '@/lib/plans';
import { privateMetadata } from '@/lib/seo/metadata';

export const metadata: Metadata = privateMetadata('Users', 'Accounts, plans and access.');

const PAGE_SIZE = 25;

function first(value: string | string[] | undefined): string {
  if (Array.isArray(value)) return value[0] ?? '';
  return value ?? '';
}

export default async function AdminUsersPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const [admin, query] = await Promise.all([requireAdmin(), searchParams]);

  const search = first(query.q).trim();
  const cursor = first(query.cursor).trim();

  const result = await loadAdmin(async () => {
    const [page, total] = await Promise.all([
      listUsers({ limit: PAGE_SIZE, cursor: cursor || null, search: search || undefined }),
      countUsers(),
    ]);
    return { page, total };
  });

  const users = result.data?.page.users ?? [];
  const nextCursor = result.data?.page.nextCursor ?? null;
  const searchIsEmail = search.includes('@');

  return (
    <div className="space-y-6">
      <AdminPageHeader
        title="Users"
        description={
          result.data
            ? `${formatCount(result.data.total)} account${result.data.total === 1 ? '' : 's'} in total. The table below is ordered by signup date, newest first.`
            : 'Accounts, plans and access.'
        }
      />

      <Card className="p-4">
        <form method="get" action="/admin/users" className="flex flex-wrap items-end gap-3">
          <div className="min-w-56 flex-1">
            <label
              htmlFor="admin-user-search"
              className="mb-1.5 block text-sm font-medium text-ink-800"
            >
              Find an account
            </label>
            <Input
              id="admin-user-search"
              name="q"
              type="search"
              defaultValue={search}
              placeholder="someone@example.com"
              autoComplete="off"
            />
          </div>
          <Button type="submit" variant="secondary">
            Search
          </Button>
          {search ? (
            <Link
              href="/admin/users"
              className="px-1 py-2 text-sm font-semibold text-brand-700 hover:text-brand-800"
            >
              Clear
            </Link>
          ) : null}
        </form>
        <p className="mt-3 text-xs leading-relaxed text-ink-500">
          Firestore cannot do substring search, so this matches a{' '}
          <span className="font-medium">complete e-mail address</span>, lower-cased. Partial
          names and partial addresses will not match — page through the table instead, or
          open an account from a payment row.
        </p>
      </Card>

      {search && !searchIsEmail ? (
        <p className="text-sm text-ink-600">
          Showing the newest accounts: “{search}” is not a full e-mail address, so it cannot
          be looked up exactly.
        </p>
      ) : null}

      {result.data ? (
        <Card>
          <AdminTable minWidth={1040}>
            <thead>
              <tr>
                <Th sticky>E-mail</Th>
                <Th>Name</Th>
                <Th>Plan</Th>
                <Th>Status</Th>
                <Th align="right">CVs</Th>
                <Th align="right">Created</Th>
                <Th align="right">Last login</Th>
                <Th align="right">Actions</Th>
              </tr>
            </thead>
            <tbody>
              {users.length === 0 ? (
                <TableEmptyRow colSpan={8}>
                  {search
                    ? `No account matches “${search}”. The address must match exactly, including the domain.`
                    : cursor
                      ? 'You have reached the end of the list.'
                      : 'No accounts have been created yet. The first signup will appear here.'}
                </TableEmptyRow>
              ) : (
                users.map((user) => {
                  const stored = getPlan(user.entitlement.plan);
                  const active = effectivePlan(user.entitlement);
                  const isSelf = user.uid === admin.uid;

                  return (
                    <tr key={user.uid}>
                      <Td sticky>
                        <div className="flex items-center gap-2">
                          <Link
                            href={`/admin/users/${user.uid}`}
                            className="font-medium text-brand-700 hover:text-brand-800"
                          >
                            {user.email || shortId(user.uid)}
                          </Link>
                          {isSelf ? <Badge tone="brand">You</Badge> : null}
                          {user.role === 'admin' ? <Badge tone="accent">Admin</Badge> : null}
                        </div>
                      </Td>
                      <Td className="max-w-56 truncate">{user.displayName || '—'}</Td>
                      <Td>
                        <div className="flex items-center gap-1.5">
                          <PlanBadge planId={stored.id} label={stored.name} />
                          {active.id !== stored.id ? (
                            <span
                              className="text-2xs text-ink-500"
                              title="The stored plan is not currently in effect — it has expired or is not active."
                            >
                              (lapsed)
                            </span>
                          ) : null}
                        </div>
                      </Td>
                      <Td>
                        <SubscriptionBadge status={user.entitlement.status} />
                      </Td>
                      <Td align="right">{user.cvCount}</Td>
                      <Td align="right" className="whitespace-nowrap text-ink-600">
                        {formatDateTime(user.createdAt)}
                      </Td>
                      <Td align="right" className="whitespace-nowrap text-ink-600">
                        {user.lastLoginAt ? formatDateTime(user.lastLoginAt) : 'Never'}
                      </Td>
                      <Td align="right">
                        <UserActions
                          uid={user.uid}
                          email={user.email}
                          role={user.role}
                          planId={user.entitlement.plan}
                          isSelf={isSelf}
                        />
                      </Td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </AdminTable>

          <div className="flex flex-wrap items-center justify-between gap-3 border-t border-ink-100 px-4 py-3">
            <p className="text-xs text-ink-500">
              {search
                ? 'Exact-match search results are not paginated.'
                : `Showing ${users.length} account${users.length === 1 ? '' : 's'}. Firestore cursors only move forwards — use “First page” to start over.`}
            </p>
            {!search ? (
              <div className="flex items-center gap-2">
                {cursor ? (
                  <Link
                    href="/admin/users"
                    className="rounded-lg border border-ink-200 px-3 py-1.5 text-sm font-semibold text-ink-700 hover:bg-ink-50"
                  >
                    First page
                  </Link>
                ) : null}
                {nextCursor ? (
                  <Link
                    href={`/admin/users?cursor=${encodeURIComponent(nextCursor)}`}
                    className="rounded-lg border border-ink-200 px-3 py-1.5 text-sm font-semibold text-ink-700 hover:bg-ink-50"
                  >
                    Next page
                  </Link>
                ) : (
                  <span className="text-xs text-ink-500">End of list</span>
                )}
              </div>
            ) : null}
          </div>
        </Card>
      ) : (
        <AdminDataAlert configured={result.configured} error={result.error} what="The user list" />
      )}
    </div>
  );
}
