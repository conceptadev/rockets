import { FirestoreTransactionBackendMismatchException } from '../exceptions/firestore-transaction-backend-mismatch.exception';
import type { FirestoreBackend } from '../interfaces/firestore-backend.interface';
import {
  getAmbientFirestoreTransactionOwner,
  runWithAmbientFirestoreTransaction,
} from './firestore-transaction-context';

/**
 * Run `fn` inside a real Firestore transaction attempt.
 *
 * Unlike the imperative `TransactionInterface` bridge (used by
 * `TransactionScope`), the body lives **inside** the SDK callback, so a
 * contended retry re-executes `fn`. Repository calls made during `fn`
 * automatically join the ambient handle — no `{ ctx }` plumbing required.
 *
 * Nesting on the same backend joins the ambient transaction instead of
 * opening a second one (which would deadlock on the same document or commit
 * two independent units). Nesting across backends throws, because a Firestore
 * transaction cannot span databases.
 *
 * Prefer this for contended read-modify-write (rate limits, leases, turn
 * locks, idempotent enqueue). Use `TransactionScope` only for uncontended
 * multi-write units where a retry refusal is acceptable.
 *
 * Firestore limits a single transaction to 500 writes; exceeding that
 * rejects the attempt (the adapter does not split batches).
 */
export async function runInFirestoreTransaction<T>(
  backend: FirestoreBackend,
  fn: () => Promise<T>,
): Promise<T> {
  const ambientOwner = getAmbientFirestoreTransactionOwner();
  if (ambientOwner !== undefined) {
    if (ambientOwner !== backend) {
      throw new FirestoreTransactionBackendMismatchException();
    }
    return fn();
  }
  return backend.runTransaction((tx) =>
    runWithAmbientFirestoreTransaction(backend, tx, fn),
  );
}
