import type { FirestoreBackend } from '../interfaces/firestore-backend.interface';
import type {
  FirestorePostFilter,
  FirestoreQueryBranch,
  FirestoreQueryRequest,
} from '../interfaces/firestore-query.interface';
import { sortFirestoreRows } from './firestore-sort';

type FirestoreQueryClient = Pick<
  FirestoreBackend,
  'queryBranch' | 'countBranch'
>;

export async function runFirestoreQuery(
  backend: FirestoreQueryClient,
  collection: string,
  request: FirestoreQueryRequest,
): Promise<Record<string, unknown>[]> {
  const branches = augmentBranchesForSoftDelete(
    request.branches,
    request.softDeleteField,
    request.withDeleted,
  );

  const merged = new Map<string, Record<string, unknown>>();

  const pushToServer =
    branches.length === 1 &&
    branches[0] !== undefined &&
    branches[0].postFilters.length === 0;

  for (const branch of branches) {
    const rows = await backend.queryBranch(collection, {
      branch,
      orderBy: pushToServer ? request.orderBy : undefined,
      skip: pushToServer ? request.skip : undefined,
      take: pushToServer ? request.take : undefined,
    });

    for (const row of rows) {
      const id = readDocumentId(row);
      if (id) {
        merged.set(id, row);
      }
    }
  }

  let results = [...merged.values()];

  if (!pushToServer) {
    results = sortFirestoreRows(results, request.orderBy);
    if (typeof request.skip === 'number' && request.skip > 0) {
      results = results.slice(request.skip);
    }
    if (typeof request.take === 'number' && request.take > 0) {
      results = results.slice(0, request.take);
    }
  }

  return results;
}

export async function runFirestoreCount(
  backend: FirestoreQueryClient,
  collection: string,
  request: Omit<FirestoreQueryRequest, 'orderBy' | 'skip' | 'take'>,
): Promise<number> {
  const branches = augmentBranchesForSoftDelete(
    request.branches,
    request.softDeleteField,
    request.withDeleted,
  );

  if (
    branches.length === 1 &&
    branches[0] !== undefined &&
    branches[0].postFilters.length === 0
  ) {
    return backend.countBranch(collection, branches[0]);
  }

  const rows = await runFirestoreQuery(backend, collection, {
    ...request,
    orderBy: undefined,
    skip: undefined,
    take: undefined,
  });
  return rows.length;
}

function augmentBranchesForSoftDelete(
  branches: readonly FirestoreQueryBranch[],
  softDeleteField: string | undefined,
  withDeleted: boolean | undefined,
): FirestoreQueryBranch[] {
  if (!softDeleteField || withDeleted === true) {
    return [...branches];
  }

  const exclusion: FirestorePostFilter = {
    kind: 'soft_delete_excluded',
    field: softDeleteField,
  };

  return branches.map((branch) => ({
    ...branch,
    postFilters: [...branch.postFilters, exclusion],
  }));
}

function readDocumentId(row: Record<string, unknown>): string | undefined {
  const id = row.id;
  return typeof id === 'string' && id.length > 0 ? id : undefined;
}
