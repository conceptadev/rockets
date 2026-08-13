import type { TransactionFactoryInterface } from '@concepta/nestjs-repository';

import type { FirestoreBackend } from '../interfaces/firestore-backend.interface';
import { FirestoreTransaction } from './firestore-transaction';

export class FirestoreTransactionFactory
  implements TransactionFactoryInterface
{
  constructor(private readonly backend: FirestoreBackend) {}

  create(): FirestoreTransaction {
    return new FirestoreTransaction(this.backend);
  }
}
