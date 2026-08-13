/**
 * Shared bootstrap for the CLI scripts.
 *
 * These run under plain Node (`node --experimental-strip-types`), not inside Next.js, so
 * they cannot use the `@/` path alias or import anything marked `server-only`. They read
 * `.env.local` themselves and initialise the Admin SDK directly.
 */
import { readFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

import { cert, getApps, initializeApp, type App } from 'firebase-admin/app';
import { getAuth } from 'firebase-admin/auth';
import { getFirestore } from 'firebase-admin/firestore';

const here = dirname(fileURLToPath(import.meta.url));
export const projectRoot = join(here, '..', '..');

/** Minimal `.env` parser — enough for `KEY=value`, quotes and `#` comments. */
export function loadEnv(files = ['.env.local', '.env']): void {
  for (const file of files) {
    let contents: string;
    try {
      contents = readFileSync(join(projectRoot, file), 'utf8');
    } catch {
      continue;
    }

    for (const rawLine of contents.split('\n')) {
      const line = rawLine.trim();
      if (!line || line.startsWith('#')) continue;

      const separator = line.indexOf('=');
      if (separator < 1) continue;

      const key = line.slice(0, separator).trim();
      if (process.env[key] !== undefined) continue;

      let value = line.slice(separator + 1).trim();
      if (
        (value.startsWith('"') && value.endsWith('"')) ||
        (value.startsWith("'") && value.endsWith("'"))
      ) {
        value = value.slice(1, -1);
      }
      process.env[key] = value;
    }
  }
}

export function adminApp(): App {
  const existing = getApps()[0];
  if (existing) return existing;

  const json = process.env.FIREBASE_SERVICE_ACCOUNT_JSON?.trim();
  if (json) {
    const parsed = JSON.parse(json) as Record<string, string>;
    return initializeApp({
      credential: cert({
        projectId: parsed.project_id,
        clientEmail: parsed.client_email,
        privateKey: (parsed.private_key ?? '').replace(/\\n/g, '\n'),
      }),
      projectId: parsed.project_id,
    });
  }

  const projectId = process.env.FIREBASE_PROJECT_ID?.trim();
  const clientEmail = process.env.FIREBASE_CLIENT_EMAIL?.trim();
  const privateKey = process.env.FIREBASE_PRIVATE_KEY?.trim();

  if (!projectId || !clientEmail || !privateKey) {
    console.error(
      '\n✗ Firebase Admin is not configured.\n\n' +
        '  Set FIREBASE_PROJECT_ID, FIREBASE_CLIENT_EMAIL and FIREBASE_PRIVATE_KEY in .env.local\n' +
        '  (or FIREBASE_SERVICE_ACCOUNT_JSON with the whole service-account key file).\n\n' +
        '  Firebase Console → Project settings → Service accounts → Generate new private key.\n',
    );
    process.exit(1);
  }

  return initializeApp({
    credential: cert({
      projectId,
      clientEmail,
      privateKey: privateKey.replace(/\\n/g, '\n').replace(/^"|"$/g, ''),
    }),
    projectId,
  });
}

export function db() {
  return getFirestore(adminApp());
}

export function auth() {
  return getAuth(adminApp());
}

export function arg(name: string): string | undefined {
  const prefix = `--${name}=`;
  const match = process.argv.find((value) => value.startsWith(prefix));
  if (match) return match.slice(prefix.length);

  const index = process.argv.indexOf(`--${name}`);
  if (index > -1) {
    const next = process.argv[index + 1];
    if (next && !next.startsWith('--')) return next;
  }
  return undefined;
}

export function hasFlag(name: string): boolean {
  return process.argv.includes(`--${name}`);
}
