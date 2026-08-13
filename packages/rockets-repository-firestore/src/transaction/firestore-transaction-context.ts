import { AsyncLocalStorage } from 'node:async_hooks';

import type { FirestoreTransactionHandle } from '../interfaces/firestore-transaction-handle.interface';

/**
 * Ambient transactional handle for {@link runInFirestoreTransaction}.
 * Kept module-private so only the callback-scoped API can populate it;
 * repository `do*` methods read it via {@link getAmbientFirestoreTransaction}.
 */
const ambientFirestoreTransaction =
  new AsyncLocalStorage<FirestoreTransactionHandle>();

export function getAmbientFirestoreTransaction():
  | FirestoreTransactionHandle
  | undefined {
  return ambientFirestoreTransaction.getStore();
}

export function runWithAmbientFirestoreTransaction<T>(
  tx: FirestoreTransactionHandle,
  fn: () => Promise<T>,
): Promise<T> {
  return ambientFirestoreTransaction.run(tx, fn);
}
