import { AsyncLocalStorage } from 'node:async_hooks';

import type { FirestoreBackend } from '../interfaces/firestore-backend.interface';
import type { FirestoreTransactionHandle } from '../interfaces/firestore-transaction-handle.interface';

interface AmbientFirestoreTransaction {
  readonly backend: FirestoreBackend;
  readonly handle: FirestoreTransactionHandle;
}

/**
 * Ambient transactional handle for {@link runInFirestoreTransaction}.
 * Kept module-private so only the callback-scoped API can populate it;
 * repository `do*` methods read it via {@link getAmbientFirestoreTransaction}.
 *
 * The owning backend is stored with the handle: a Firestore transaction
 * belongs to one database, so a repository bound to another backend must not
 * join it.
 */
const ambientFirestoreTransaction =
  new AsyncLocalStorage<AmbientFirestoreTransaction>();

/** The ambient handle, only when it belongs to `backend`. */
export function getAmbientFirestoreTransaction(
  backend: FirestoreBackend,
): FirestoreTransactionHandle | undefined {
  const ambient = ambientFirestoreTransaction.getStore();
  if (ambient === undefined || ambient.backend !== backend) {
    return undefined;
  }
  return ambient.handle;
}

/** The ambient entry regardless of owner — for nesting checks. */
export function getAmbientFirestoreTransactionOwner():
  | FirestoreBackend
  | undefined {
  return ambientFirestoreTransaction.getStore()?.backend;
}

export function runWithAmbientFirestoreTransaction<T>(
  backend: FirestoreBackend,
  handle: FirestoreTransactionHandle,
  fn: () => Promise<T>,
): Promise<T> {
  return ambientFirestoreTransaction.run({ backend, handle }, fn);
}
