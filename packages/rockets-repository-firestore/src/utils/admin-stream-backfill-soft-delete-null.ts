import { getApp } from 'firebase-admin/app';
import {
  getFirestore,
  type DocumentSnapshot,
  type Firestore,
} from 'firebase-admin/firestore';

export interface AdminStreamBackfillSoftDeleteNullOptions {
  readonly collection: string;
  readonly softDeleteField: string;
  readonly db?: Firestore;
}

function isDocumentSnapshot(value: unknown): value is DocumentSnapshot {
  return (
    typeof value === 'object' &&
    value !== null &&
    'ref' in value &&
    'data' in value &&
    typeof (value as DocumentSnapshot).data === 'function'
  );
}

/**
 * Production-scale soft-delete backfill: streams the collection and patches
 * missing markers with Admin {@link BulkWriter} (non-atomic, high throughput).
 *
 * Prefer this over {@link backfillSoftDeleteNull} for large collections —
 * that helper loads every document into memory first.
 *
 * @returns number of documents patched
 */
export async function adminStreamBackfillSoftDeleteNull(
  options: AdminStreamBackfillSoftDeleteNullOptions,
): Promise<number> {
  const db = options.db ?? getFirestore(getApp());
  const writer = db.bulkWriter();
  let patched = 0;

  for await (const raw of db.collection(options.collection).stream()) {
    if (!isDocumentSnapshot(raw)) {
      continue;
    }
    const data = raw.data();
    if (
      data !== undefined &&
      Object.prototype.hasOwnProperty.call(data, options.softDeleteField)
    ) {
      continue;
    }
    writer.set(raw.ref, { [options.softDeleteField]: null }, { merge: true });
    patched += 1;
  }

  await writer.close();
  return patched;
}
