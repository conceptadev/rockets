import { describe, expect, it, vi, beforeEach } from 'vitest';

const { fakeDb, createDoc } = vi.hoisted(() => {
  const createDoc = vi.fn(async (): Promise<void> => undefined);
  const getAll = vi.fn(async (...refs: Array<{ readonly id: string }>) =>
    refs.map((ref) => ({
      exists: true,
      id: ref.id,
      data: () => ({ title: `row-${ref.id}` }),
    })),
  );
  const fakeDb = {
    getAll,
    collection: (_name: string) => ({
      doc: (id: string) => ({ id, create: createDoc }),
    }),
  };
  return { fakeDb, createDoc };
});

vi.mock('firebase-admin/app', () => ({ getApp: () => ({}) }));
vi.mock('firebase-admin/firestore', () => ({ getFirestore: () => fakeDb }));

import { AdminFirestoreBackend } from '../backends/admin-firestore.backend';
import { FirestoreDuplicateIdException } from '../exceptions/firestore-duplicate-id.exception';

describe('AdminFirestoreBackend', () => {
  beforeEach(() => {
    fakeDb.getAll.mockClear();
    createDoc.mockClear();
  });

  it('chunks getAll so id lists of any size load without a cap', async () => {
    const backend = new AdminFirestoreBackend();
    const documentIds = Array.from(
      { length: 800 },
      (_, index) => `doc-${index}`,
    );

    const rows = await backend.queryBranch('widgets', {
      branch: { documentIds, filters: [], postFilters: [] },
    });

    expect(rows).toHaveLength(800);
    expect(fakeDb.getAll).toHaveBeenCalledTimes(3);
    expect(fakeDb.getAll.mock.calls[0]).toHaveLength(300);
    expect(fakeDb.getAll.mock.calls[2]).toHaveLength(200);
    expect(rows[799]).toMatchObject({ id: 'doc-799', title: 'row-doc-799' });
  });

  it('translates the SDK ALREADY_EXISTS error into the contract exception', async () => {
    const backend = new AdminFirestoreBackend();
    createDoc.mockRejectedValueOnce({ code: 6 });

    await expect(
      backend.create('widgets', 'dup-id', { title: 'x' }),
    ).rejects.toBeInstanceOf(FirestoreDuplicateIdException);
  });

  it('re-throws SDK errors that are not duplicates untouched', async () => {
    const backend = new AdminFirestoreBackend();
    createDoc.mockRejectedValueOnce({ code: 13, message: 'internal' });

    await expect(
      backend.create('widgets', 'any-id', { title: 'x' }),
    ).rejects.toMatchObject({ code: 13 });
  });
});
