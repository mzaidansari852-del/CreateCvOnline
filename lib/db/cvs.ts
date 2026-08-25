import 'server-only';

import { FieldValue } from 'firebase-admin/firestore';

import { adminDb, COLLECTIONS, cvCollection, toIso } from '@/lib/firebase/admin';
import { adjustCvCount } from './users';
import { createDefaultCustomization, createEmptyCV } from '@/lib/cv/defaults';
import type { Locale } from '@/lib/i18n/locales';
import { completenessScore, defaultSectionConfigs } from '@/lib/cv/sections';
import { DEFAULT_TEMPLATE_ID, findTemplate } from '@/lib/cv/template-registry';
import { shareId as makeShareId } from '@/lib/utils/id';
import {
  cvCustomizationSchema,
  cvDataSchema,
  type CVCustomization,
  type CVData,
  type CVDocument,
  type CVSummary,
} from '@/types/cv';

/**
 * CV repository.
 *
 * Every read goes through the Zod schemas, so a document saved by an older build — or one
 * missing a field added later — is upgraded in place rather than breaking the editor.
 * Every write is scoped to `users/{uid}/cvs`, which is also what the Firestore rules
 * enforce, so ownership is checked twice: here and in the database.
 */

export class CVNotFoundError extends Error {
  readonly status = 404;
  constructor() {
    super('That CV does not exist, or it belongs to someone else.');
    this.name = 'CVNotFoundError';
  }
}

/**
 * A document with no section list cannot be edited back to health.
 *
 * `sections` is the render order *and* the editor's sidebar, and the schema defaults it to
 * `[]` — so a CV that reached storage without one opens as a blank page offering nothing to
 * switch on. There is no control anywhere in the UI that adds a built-in section back, which
 * makes the state permanent: the owner's history is intact in the database and unreachable
 * from the only screen that can edit it. The importer created exactly this, for real people,
 * before it was fixed.
 *
 * Repairing on read rather than on write is deliberate. A migration would have to find the
 * affected documents; this heals each one the moment its owner opens it, and costs an array
 * comparison for every CV that was never broken. It is also a net the next writer of a
 * creation path falls into instead of shipping the same blank page again.
 */
function withSections(data: CVData): CVData {
  if (data.sections.length > 0) return data;
  return { ...data, sections: defaultSectionConfigs(data.language) };
}

function hydrate(id: string, ownerId: string, raw: Record<string, unknown>): CVDocument {
  const data = cvDataSchema.safeParse(raw.data);
  const customization = cvCustomizationSchema.safeParse(raw.customization);

  return {
    id,
    ownerId,
    title: typeof raw.title === 'string' && raw.title.trim() ? raw.title : 'Untitled CV',
    data: data.success ? withSections(data.data) : createEmptyCV(),
    customization: customization.success ? customization.data : createDefaultCustomization(),
    createdAt: toIso(raw.createdAt),
    updatedAt: toIso(raw.updatedAt),
    shareId: typeof raw.shareId === 'string' ? raw.shareId : null,
    isPublic: raw.isPublic === true,
    downloadCount: Number(raw.downloadCount ?? 0),
    lastDownloadedAt: raw.lastDownloadedAt ? toIso(raw.lastDownloadedAt) : null,
  };
}

function summarise(document: CVDocument): CVSummary {
  const { personal } = document.data;
  return {
    id: document.id,
    title: document.title,
    templateId: document.customization.templateId,
    updatedAt: document.updatedAt,
    createdAt: document.createdAt,
    isPublic: document.isPublic,
    shareId: document.shareId,
    accentColor: document.customization.accentColor,
    fullName: [personal.firstName, personal.lastName].filter(Boolean).join(' '),
    headline: personal.title,
    completeness: completenessScore(document.data),
  };
}

/* -------------------------------------------------------------------------- */
/* Reads                                                                       */
/* -------------------------------------------------------------------------- */

export async function listCVs(uid: string): Promise<CVSummary[]> {
  const snapshot = await cvCollection(uid).orderBy('updatedAt', 'desc').limit(200).get();
  return snapshot.docs.map((doc) => summarise(hydrate(doc.id, uid, doc.data())));
}

export async function countCVs(uid: string): Promise<number> {
  const snapshot = await cvCollection(uid).count().get();
  return snapshot.data().count;
}

export async function getCV(uid: string, cvId: string): Promise<CVDocument> {
  const snapshot = await cvCollection(uid).doc(cvId).get();
  if (!snapshot.exists) throw new CVNotFoundError();
  return hydrate(snapshot.id, uid, snapshot.data() ?? {});
}

export async function findCV(uid: string, cvId: string): Promise<CVDocument | null> {
  const snapshot = await cvCollection(uid).doc(cvId).get();
  if (!snapshot.exists) return null;
  return hydrate(snapshot.id, uid, snapshot.data() ?? {});
}

/** Looks up a publicly shared CV by its unguessable share id. */
export async function getSharedCV(shareIdValue: string): Promise<CVDocument | null> {
  if (!/^[a-f0-9]{16,32}$/i.test(shareIdValue)) return null;

  const snapshot = await adminDb()
    .collectionGroup(COLLECTIONS.cvs)
    .where('shareId', '==', shareIdValue)
    .where('isPublic', '==', true)
    .limit(1)
    .get();

  const doc = snapshot.docs[0];
  if (!doc) return null;

  const ownerId = doc.ref.parent.parent?.id ?? '';
  return hydrate(doc.id, ownerId, doc.data());
}

/* -------------------------------------------------------------------------- */
/* Writes                                                                      */
/* -------------------------------------------------------------------------- */

export async function createCV(
  uid: string,
  input: {
    title?: string;
    templateId?: string;
    data?: CVData;
    customization?: Partial<CVCustomization>;
    /**
     * The document's language, normally the creator's interface language.
     *
     * Only consulted when no `data` is supplied — an imported or duplicated CV already
     * carries its own, and overriding it here would silently retitle someone's document.
     */
    language?: Locale;
  } = {},
): Promise<CVDocument> {
  const template = findTemplate(input.templateId ?? DEFAULT_TEMPLATE_ID);
  const now = new Date().toISOString();

  const customization = createDefaultCustomization({
    ...input.customization,
    templateId: template?.id ?? DEFAULT_TEMPLATE_ID,
    accentColor: input.customization?.accentColor ?? template?.accentDefault ?? '#1f3af5',
  });

  const document: Omit<CVDocument, 'id'> = {
    ownerId: uid,
    title: input.title?.trim() || 'Untitled CV',
    data: input.data ? cvDataSchema.parse(input.data) : createEmptyCV({ language: input.language }),
    customization,
    createdAt: now,
    updatedAt: now,
    shareId: null,
    isPublic: false,
    downloadCount: 0,
    lastDownloadedAt: null,
  };

  const ref = await cvCollection(uid).add(document);
  await adjustCvCount(uid, 1);
  return { id: ref.id, ...document };
}

export async function updateCV(
  uid: string,
  cvId: string,
  patch: {
    title?: string;
    data?: CVData;
    customization?: CVCustomization;
  },
): Promise<CVDocument> {
  const ref = cvCollection(uid).doc(cvId);
  const snapshot = await ref.get();
  if (!snapshot.exists) throw new CVNotFoundError();

  const update: Record<string, unknown> = { updatedAt: new Date().toISOString() };
  if (patch.title !== undefined) update.title = patch.title.trim() || 'Untitled CV';
  if (patch.data !== undefined) update.data = cvDataSchema.parse(patch.data);
  if (patch.customization !== undefined) {
    update.customization = cvCustomizationSchema.parse(patch.customization);
  }

  await ref.update(update);
  return hydrate(cvId, uid, { ...snapshot.data(), ...update });
}

export async function duplicateCV(uid: string, cvId: string): Promise<CVDocument> {
  const source = await getCV(uid, cvId);
  const now = new Date().toISOString();

  const copy: Omit<CVDocument, 'id'> = {
    ownerId: uid,
    title: nextCopyTitle(source.title),
    data: source.data,
    customization: source.customization,
    createdAt: now,
    updatedAt: now,
    // A duplicate is private until the owner explicitly shares it.
    shareId: null,
    isPublic: false,
    downloadCount: 0,
    lastDownloadedAt: null,
  };

  const ref = await cvCollection(uid).add(copy);
  await adjustCvCount(uid, 1);
  return { id: ref.id, ...copy };
}

function nextCopyTitle(title: string): string {
  const match = /^(.*) \((\d+)\)$/.exec(title);
  if (match) return `${match[1]} (${Number(match[2]) + 1})`;
  return `${title} (copy)`.slice(0, 120);
}

export async function deleteCV(uid: string, cvId: string): Promise<void> {
  const ref = cvCollection(uid).doc(cvId);
  const snapshot = await ref.get();
  if (!snapshot.exists) throw new CVNotFoundError();
  await ref.delete();
  await adjustCvCount(uid, -1);
}

export async function renameCV(uid: string, cvId: string, title: string): Promise<void> {
  await cvCollection(uid)
    .doc(cvId)
    .update({
      title: title.trim().slice(0, 120) || 'Untitled CV',
      updatedAt: new Date().toISOString(),
    });
}

/** Enables or disables the public share link. Returns the share id when enabled. */
export async function setCVSharing(
  uid: string,
  cvId: string,
  isPublic: boolean,
): Promise<string | null> {
  const ref = cvCollection(uid).doc(cvId);
  const snapshot = await ref.get();
  if (!snapshot.exists) throw new CVNotFoundError();

  if (!isPublic) {
    await ref.update({ isPublic: false, shareId: null, updatedAt: new Date().toISOString() });
    return null;
  }

  const existing = snapshot.data()?.shareId;
  const value = typeof existing === 'string' && existing.length >= 16 ? existing : makeShareId();
  await ref.update({ isPublic: true, shareId: value, updatedAt: new Date().toISOString() });
  return value;
}

export async function recordCVDownload(uid: string, cvId: string): Promise<void> {
  await cvCollection(uid)
    .doc(cvId)
    .set(
      { downloadCount: FieldValue.increment(1), lastDownloadedAt: new Date().toISOString() },
      { merge: true },
    );
}

/* -------------------------------------------------------------------------- */
/* Admin                                                                       */
/* -------------------------------------------------------------------------- */

export interface AdminCVRow extends CVSummary {
  ownerId: string;
}

export async function listAllCVs(limit = 50): Promise<AdminCVRow[]> {
  const snapshot = await adminDb()
    .collectionGroup(COLLECTIONS.cvs)
    .orderBy('updatedAt', 'desc')
    .limit(Math.min(Math.max(limit, 1), 200))
    .get();

  return snapshot.docs.map((doc) => {
    const ownerId = doc.ref.parent.parent?.id ?? '';
    return { ...summarise(hydrate(doc.id, ownerId, doc.data())), ownerId };
  });
}

export async function countAllCVs(): Promise<number> {
  const snapshot = await adminDb().collectionGroup(COLLECTIONS.cvs).count().get();
  return snapshot.data().count;
}

/**
 * PDF exports across every account.
 *
 * Read from `downloadCount` on the CV documents themselves, which `recordCVDownload` has
 * been incrementing since the feature shipped — so this is history, not a counter that
 * starts today. The per-user `downloadsThisMonth` is a different number and answers a
 * different question: it is a quota meter that resets on the 1st, so it cannot be summed
 * for a lifetime total.
 *
 * `documentsExported` is the number worth reading first. Signups and CVs created both
 * measure intent; a downloaded PDF is the only event in the product that means someone got
 * what they came for. A large gap between `documentsCreated` and `documentsExported` is the
 * clearest signal available that people are starting and not finishing.
 *
 * One `select()` over the collection group, pulling three fields rather than whole
 * documents — a CV document carries the entire résumé, and this runs on every admin page
 * load.
 */
export interface DownloadStats {
  /** Every export ever, summed across all CVs. */
  totalDownloads: number;
  /** CVs that have been exported at least once. */
  documentsExported: number;
  documentsCreated: number;
  /** Exports per exported document — how often a finished CV gets re-used. */
  averagePerExportedDocument: number;
  /** Most-exported templates, busiest first. Keyed by template id. */
  byTemplate: { templateId: string; downloads: number }[];
  /** Exports by the language the document is written in. */
  byLanguage: { language: string; downloads: number }[];
}

export async function downloadStats(): Promise<DownloadStats> {
  const snapshot = await adminDb()
    .collectionGroup(COLLECTIONS.cvs)
    .select('downloadCount', 'customization', 'language')
    .get();

  let totalDownloads = 0;
  let documentsExported = 0;
  const templates = new Map<string, number>();
  const languages = new Map<string, number>();

  for (const doc of snapshot.docs) {
    const raw = doc.data() as {
      downloadCount?: unknown;
      customization?: { templateId?: unknown };
      language?: unknown;
    };

    const count = Number(raw.downloadCount ?? 0);
    // A corrupt or absent counter reads as zero rather than poisoning the sum with NaN.
    if (!Number.isFinite(count) || count <= 0) continue;

    totalDownloads += count;
    documentsExported += 1;

    const templateId =
      typeof raw.customization?.templateId === 'string' ? raw.customization.templateId : null;
    if (templateId) templates.set(templateId, (templates.get(templateId) ?? 0) + count);

    const language = typeof raw.language === 'string' ? raw.language : 'en';
    languages.set(language, (languages.get(language) ?? 0) + count);
  }

  const rank = <K extends string>(map: Map<string, number>, key: K) =>
    [...map.entries()]
      .map(
        ([value, downloads]) =>
          ({ [key]: value, downloads }) as Record<K, string> & {
            downloads: number;
          },
      )
      .sort((a, b) => b.downloads - a.downloads);

  return {
    totalDownloads,
    documentsExported,
    documentsCreated: snapshot.size,
    averagePerExportedDocument: documentsExported === 0 ? 0 : totalDownloads / documentsExported,
    byTemplate: rank(templates, 'templateId'),
    byLanguage: rank(languages, 'language'),
  };
}

/** Template usage across all accounts, for the admin templates page. */
export async function templateUsageCounts(): Promise<Record<string, number>> {
  const snapshot = await adminDb().collectionGroup(COLLECTIONS.cvs).select('customization').get();
  const counts: Record<string, number> = {};
  for (const doc of snapshot.docs) {
    const raw = doc.data() as { customization?: { templateId?: unknown } };
    const id =
      typeof raw.customization?.templateId === 'string' ? raw.customization.templateId : null;
    if (!id) continue;
    counts[id] = (counts[id] ?? 0) + 1;
  }
  return counts;
}
