export { FirestoreRepositoryModule } from './firestore-repository.module';
export {
  FirestoreRepository,
  isFirestoreRepository,
} from './repository/firestore-repository';
export type { FirestoreProviderOptions } from './interfaces/firestore-provider-options.interface';
export type { FirestoreBackend } from './interfaces/firestore-backend.interface';
export type { FirestoreTransactionHandle } from './interfaces/firestore-transaction-handle.interface';
export {
  FIRESTORE_BACKEND,
  FIRESTORE_REPOSITORY_MODULE_NAME,
} from './constants/firestore-repository.constants';
export { FIRESTORE_DEFAULT_TRANSACTION_KEY } from './constants/firestore-transaction.constants';
export {
  FIRESTORE_ALT_SOFT_DELETE_FIELD,
  FIRESTORE_DEFAULT_SOFT_DELETE_FIELD,
} from './constants/firestore-soft-delete.constants';
export { ensureFirebaseAdminApp } from './utils/ensure-firebase-admin-app';
export { backfillSoftDeleteNull } from './utils/backfill-soft-delete-null';
export type { BackfillSoftDeleteNullOptions } from './utils/backfill-soft-delete-null';
export { FirestoreDuplicateIdException } from './exceptions/firestore-duplicate-id.exception';
export { FirestoreTransactionAbortedException } from './exceptions/firestore-transaction-aborted.exception';
export { FirestoreTransactionBackendMismatchException } from './exceptions/firestore-transaction-backend-mismatch.exception';
export { FirestoreTransactionRetryUnsupportedException } from './exceptions/firestore-transaction-retry-unsupported.exception';
export { InMemoryFirestoreBackend } from './backends/in-memory-firestore.backend';
export { AdminFirestoreBackend } from './backends/admin-firestore.backend';
export { defineFirestoreRepository } from './integration/define-firestore-repository';
export type { DefineFirestoreRepositoryOptions } from './integration/define-firestore-repository.config';
export type {
  FirestoreRepositoryModuleOptions,
  FirestoreRepositoryRootOptions,
} from './interfaces/firestore-repository-module-options.interface';
export { FirestoreTransaction } from './transaction/firestore-transaction';
export { FirestoreTransactionFactory } from './transaction/firestore-transaction.factory';
export { runInFirestoreTransaction } from './transaction/run-in-firestore-transaction';
