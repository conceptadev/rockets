import { describe, expect, it } from 'vitest';

import { InMemoryFirestoreBackend } from '../backends/in-memory-firestore.backend';
import { FIRESTORE_MAX_BATCH_WRITES } from '../constants/firestore-transaction.constants';
import { FirestoreBatchWriteLimitExceededException } from '../exceptions/firestore-batch-write-limit-exceeded.exception';
import { FirestorePreconditionFailedException } from '../exceptions/firestore-precondition-failed.exception';
import type { FirestoreBatchOperation } from '../interfaces/firestore-backend.interface';

function overLimitCreates(): FirestoreBatchOperation[] {
  return Array.from({ length: FIRESTORE_MAX_BATCH_WRITES + 1 }, (_, i) => ({
    op: 'create' as const,
    collection: 'batch-limit',
    id: `row-${i}`,
    data: { id: `row-${i}` },
  }));
}

describe('WriteBatch 500-op limit', () => {
  it('in-memory backend throws FirestoreBatchWriteLimitExceededException', async () => {
    const backend = new InMemoryFirestoreBackend();
    await expect(backend.writeBatch(overLimitCreates())).rejects.toMatchObject({
      errorCode: 'FIRESTORE_BATCH_WRITE_LIMIT_EXCEEDED',
    });
    await expect(backend.writeBatch(overLimitCreates())).rejects.toBeInstanceOf(
      FirestoreBatchWriteLimitExceededException,
    );
  });

  it('rejects a stale lastUpdateTime precondition', async () => {
    const backend = new InMemoryFirestoreBackend();
    await backend.create('cas-time', 'row-1', { id: 'row-1', value: 1 });
    await expect(
      backend.set('cas-time', 'row-1', { value: 2 }, true, {
        lastUpdateTime: new Date(0),
      }),
    ).rejects.toBeInstanceOf(FirestorePreconditionFailedException);
  });
});
