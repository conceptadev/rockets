import { FIRESTORE_MAX_TRANSACTION_WRITES } from '../constants/firestore-transaction.constants';
import { FirestoreTransactionWriteLimitExceededException } from '../exceptions/firestore-transaction-write-limit-exceeded.exception';

/**
 * Counts writes inside one transaction attempt and refuses the
 * {@link FIRESTORE_MAX_TRANSACTION_WRITES} + 1st write early.
 */
export class FirestoreTransactionWriteCounter {
  private writeCount = 0;

  recordWrite(): void {
    this.writeCount += 1;
    if (this.writeCount > FIRESTORE_MAX_TRANSACTION_WRITES) {
      throw new FirestoreTransactionWriteLimitExceededException(
        this.writeCount,
      );
    }
  }

  get count(): number {
    return this.writeCount;
  }
}
