import type { ReactNode } from 'react';
import type { Metadata } from 'next';

import { requireViewer } from '@/lib/auth/guards';
import { privateMetadata } from '@/lib/seo/metadata';

/**
 * The authenticated area.
 *
 * This layout does exactly two things: it refuses anonymous visitors, and it gives the
 * tree a full-height box. It deliberately renders **no chrome** — the CV editor at
 * `/dashboard/cvs/[id]/edit` needs the entire viewport with no top bar and no sidebar,
 * and a layout that imposed them would force that route to fight its own container.
 * Pages that want the navigation opt in with `<DashboardShell>`.
 */

export const metadata: Metadata = privateMetadata('Dashboard');

export default async function DashboardLayout({ children }: { children: ReactNode }) {
  // Every page below re-reads the viewer from the same request-scoped cache, so this
  // costs one lookup, not one per page.
  await requireViewer('/dashboard');

  return <div className="min-h-dvh bg-ink-50">{children}</div>;
}
