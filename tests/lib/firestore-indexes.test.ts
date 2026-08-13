import { readFileSync } from 'node:fs';
import { join } from 'node:path';

import { describe, expect, it } from 'vitest';

/**
 * Guards `firestore.indexes.json` against the one mistake the Firebase CLI does *not*
 * catch locally.
 *
 * `firebase deploy` validates the file's shape and then POSTs each entry to the
 * Firestore API. A composite index carrying only one field is structurally valid, so
 * the CLI accepts it — but the API rejects it at deploy time with:
 *
 *   HTTP Error: 400, this index is not necessary, configure using single field index controls
 *
 * Firestore builds single-field indexes automatically at COLLECTION scope, so the only
 * legitimate reason to declare one is to widen it to COLLECTION_GROUP, and that belongs
 * under `fieldOverrides`. These tests fail in CI rather than halfway through a deploy.
 */

interface IndexField {
  fieldPath: string;
  order?: 'ASCENDING' | 'DESCENDING';
  arrayConfig?: 'CONTAINS';
}

interface CompositeIndex {
  collectionGroup: string;
  queryScope: 'COLLECTION' | 'COLLECTION_GROUP';
  fields: IndexField[];
}

interface FieldOverride {
  collectionGroup: string;
  fieldPath: string;
  indexes: { order?: string; arrayConfig?: string; queryScope?: string }[];
}

const spec = JSON.parse(
  readFileSync(join(process.cwd(), 'firestore.indexes.json'), 'utf8'),
) as { indexes: CompositeIndex[]; fieldOverrides: FieldOverride[] };

describe('firestore.indexes.json', () => {
  it('declares both top-level arrays', () => {
    expect(Array.isArray(spec.indexes)).toBe(true);
    expect(Array.isArray(spec.fieldOverrides)).toBe(true);
  });

  it('has no single-field composite index', () => {
    const offenders = spec.indexes.filter((index) => index.fields.length < 2);
    expect(
      offenders.map((index) => `${index.collectionGroup}.${index.fields[0]?.fieldPath}`),
    ).toEqual([]);
  });

  it('gives every composite index a collection group, a scope and ordered fields', () => {
    for (const index of spec.indexes) {
      expect(index.collectionGroup).toBeTruthy();
      expect(['COLLECTION', 'COLLECTION_GROUP']).toContain(index.queryScope);
      for (const field of index.fields) {
        expect(field.fieldPath).toBeTruthy();
        expect(field.order ?? field.arrayConfig).toBeTruthy();
      }
    }
  });

  it('never declares the same composite index twice', () => {
    const keys = spec.indexes.map(
      (index) =>
        `${index.collectionGroup}|${index.queryScope}|${index.fields
          .map((field) => `${field.fieldPath}:${field.order ?? field.arrayConfig}`)
          .join(',')}`,
    );
    expect(new Set(keys).size).toBe(keys.length);
  });

  it('re-declares the COLLECTION-scoped indexes it overrides', () => {
    // A fieldOverride REPLACES the automatic single-field configuration for that field.
    // Listing only the COLLECTION_GROUP entry silently removes the per-collection index
    // the app's own subcollection queries rely on, and the failure only shows up in
    // production.
    for (const override of spec.fieldOverrides) {
      const scopes = override.indexes.map((index) => index.queryScope ?? 'COLLECTION');
      expect(
        scopes,
        `${override.collectionGroup}.${override.fieldPath} drops its COLLECTION-scoped index`,
      ).toContain('COLLECTION');
    }
  });

  it('only overrides a field to widen it to COLLECTION_GROUP', () => {
    for (const override of spec.fieldOverrides) {
      const scopes = override.indexes.map((index) => index.queryScope ?? 'COLLECTION');
      expect(
        scopes,
        `${override.collectionGroup}.${override.fieldPath} overrides nothing Firestore does not already do`,
      ).toContain('COLLECTION_GROUP');
    }
  });

  it('never overrides the same field twice', () => {
    const keys = spec.fieldOverrides.map(
      (override) => `${override.collectionGroup}|${override.fieldPath}`,
    );
    expect(new Set(keys).size).toBe(keys.length);
  });

  it('covers the collection-group queries the app actually runs', () => {
    // Mirrors lib/db/cvs.ts and lib/db/payments.ts. Update both together.
    const overrideKeys = new Set(
      spec.fieldOverrides.map((override) => `${override.collectionGroup}.${override.fieldPath}`),
    );

    // listAllCVs(): collectionGroup('cvs').orderBy('updatedAt', 'desc')
    expect(overrideKeys).toContain('cvs.updatedAt');
    // listAllPayments(): collectionGroup('payments').orderBy('createdAt', 'desc')
    expect(overrideKeys).toContain('payments.createdAt');
    // revenueSummary(): collectionGroup('payments').where('status', '==', 'completed')
    expect(overrideKeys).toContain('payments.status');

    // getSharedCV(): two equality filters, so a genuine composite index.
    const shareLookup = spec.indexes.find(
      (index) =>
        index.collectionGroup === 'cvs' &&
        index.queryScope === 'COLLECTION_GROUP' &&
        index.fields.some((field) => field.fieldPath === 'shareId') &&
        index.fields.some((field) => field.fieldPath === 'isPublic'),
    );
    expect(shareLookup).toBeDefined();
  });
});
