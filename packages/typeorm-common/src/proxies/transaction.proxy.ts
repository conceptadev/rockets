import { EntityManagerProxy } from './entity-manager.proxy';
import { SafeTransactionOptionsInterface } from '../interfaces/safe-transaction-options.interface';
import { RunInTransactionCallback } from '../typeorm-common.types';
import { safeTransaction } from '../utils/safe-transaction.util';
import { EntityManager, ObjectLiteral, Repository } from 'typeorm';

type TransactionCallback<T> =
  | (() => Promise<T>)
  | ((transaction: TransactionProxy) => Promise<T>);

export class TransactionProxy {
  private entityManagerProxy: EntityManagerProxy;
  private parentTransaction?: TransactionProxy;
  private transactionalEntityManager?: EntityManager;

  constructor(
    entityManager: EntityManager,
    private options?: SafeTransactionOptionsInterface,
  ) {
    this.entityManagerProxy = new EntityManagerProxy(entityManager);
    this.parentTransaction = this.options?.transaction;
  }

  repository<E extends ObjectLiteral>(
    targetRepository: Repository<E>,
  ): Repository<E> {
    if (this.parentTransaction) {
      return this.parentTransaction.repository<E>(targetRepository);
    } else {
      return this.entityManagerProxy.repository(targetRepository, {
        entityManager: this.transactionalEntityManager,
      });
    }
  }

  async commit<T>(runInTransaction: TransactionCallback<T>): Promise<T> {
    if (this.parentTransaction) {
      return runInTransaction(this);
    } else {
      return safeTransaction<T>(
        this.entityManagerProxy.entityManager(),
        this.callback(runInTransaction),
        this.options,
      );
    }
  }

  private callback<T>(
    runInTransaction: TransactionCallback<T>,
  ): RunInTransactionCallback<T> {
    return async (entityManager: EntityManager | undefined) => {
      this.transactionalEntityManager = entityManager;
      return runInTransaction(this);
    };
  }
}
