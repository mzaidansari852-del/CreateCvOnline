import { NextResponse } from 'next/server';
import { z } from 'zod';

import { publicRoute, readJson } from '@/lib/api/handler';
import { adminDb, hasAdminCredentials } from '@/lib/firebase/admin';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

const bodySchema = z.object({
  name: z.string().trim().min(1).max(120),
  email: z.email().max(200),
  subject: z.string().trim().min(1).max(160),
  message: z.string().trim().min(10).max(4000),
  /** Honeypot: a real person never fills a field they cannot see. */
  company: z.string().max(0).optional().or(z.literal('')),
});

/**
 * Contact form.
 *
 * Messages are written to Firestore rather than e-mailed, so the project has no SMTP
 * dependency out of the box. `/admin` reads the same collection. If you would rather
 * receive e-mail, forward the collection with a Firestore trigger — see README.md.
 */
export const POST = publicRoute(
  { scope: 'contact', rateLimit: { max: 5, windowSeconds: 300 } },
  async ({ request }) => {
    const body = await readJson(request, bodySchema);

    // Silently accept honeypot submissions: telling a bot it failed only teaches it.
    if (body.company) return NextResponse.json({ ok: true });

    if (!hasAdminCredentials()) {
      return NextResponse.json(
        {
          error: {
            code: 'not-configured',
            message: 'The contact form is not connected yet. Please e-mail us directly.',
          },
        },
        { status: 503 },
      );
    }

    await adminDb()
      .collection('contactMessages')
      .add({
        name: body.name,
        email: body.email.toLowerCase(),
        subject: body.subject,
        message: body.message,
        status: 'new',
        createdAt: new Date().toISOString(),
        userAgent: request.headers.get('user-agent')?.slice(0, 300) ?? null,
      });

    return NextResponse.json({ ok: true });
  },
);
