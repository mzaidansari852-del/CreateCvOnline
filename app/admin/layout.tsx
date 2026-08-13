import type { Metadata } from 'next';

import { AdminShell } from '@/components/admin/AdminShell';
import { requireAdmin } from '@/lib/auth/guards';
import { privateMetadata } from '@/lib/seo/metadata';

export const metadata: Metadata = privateMetadata(
  'Admin console',
  'Internal operations console. Not indexed.',
);

/**
 * Nothing under `/admin` is ever cached or statically rendered: every page reads live
 * operational data, and the authorisation check below must run on every request.
 */
export const dynamic = 'force-dynamic';

/**
 * The single authorisation gate for the console.
 *
 * `requireAdmin()` verifies the session cookie and the Firebase custom claim (`admin: true`)
 * server-side; a role field in a Firestore document is never enough on its own. Every
 * mutation the console offers is additionally re-checked in its API route, so a page that
 * somehow rendered without this guard still could not change anything.
 */
export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const admin = await requireAdmin();

  return (
    <AdminShell email={admin.email} displayName={admin.displayName}>
      {children}
    </AdminShell>
  );
}
