import type { FirestoreBackend } from '../interfaces/firestore-backend.interface';

export interface BackfillSoftDeleteNullOptions {
  readonly backend: Pick<FirestoreBackend, 'queryBranch' | 'set'>;
  readonly collection: string;
  readonly softDeleteField: string;
}

/**
 * Patch documents that omit {@link BackfillSoftDeleteNullOptions.softDeleteField}
 * with an explicit `null` so server-side soft-delete exclusion (`field == null`)
 * can see them.
 *
 * Loads the whole collection via `queryBranch` — fine for emulator / small
 * collections. For large production collections, prefer an Admin SDK
 * `collection.stream()` + `BulkWriter` loop (see README).
 *
 * @returns number of documents patched
 */
export async function backfillSoftDeleteNull(
  options: BackfillSoftDeleteNullOptions,
): Promise<number> {
  const { backend, collection, softDeleteField } = options;
  const rows = await backend.queryBranch(collection, {
    branch: { filters: [], postFilters: [] },
  });

  let patched = 0;
  for (const row of rows) {
    const id = row.id;
    if (typeof id !== 'string' || id.length === 0) {
      continue;
    }
    if (softDeleteField in row) {
      continue;
    }
    await backend.set(
      collection,
      id,
      { ...row, [softDeleteField]: null },
      true,
    );
    patched += 1;
  }
  return patched;
}
