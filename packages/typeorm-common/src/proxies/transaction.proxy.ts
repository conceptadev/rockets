import { EntityManager, Repository } from 'typeorm';
import { SafeTransactionOptionsInterface } from '../interfaces/safe-transaction-options.interface';
import { RunInTransactionCallback } from '../typeorm-common.types';
import { repositoryToQuery } from '../utils/repository-to-query.util';
import { safeTransaction } from '../utils/safe-transaction.util';

type TransactionCallback<T> =
  | (() => Promise<T>)
  | ((transaction: TransactionProxy) => Promise<T>);

export class TransactionProxy {
  private parentTransaction: TransactionProxy | undefined;
  private transactionalEntityManager: EntityManager | undefined;

  constructor(
    private entityManager: EntityManager,
    private options?: SafeTransactionOptionsInterface,
  ) {
    this.parentTransaction = this.options?.transaction;
  }

  repository<E>(targetRepository: Repository<E>): Repository<E> {
    if (this.parentTransaction) {
      return this.parentTransaction.repository<E>(targetRepository);
    } else {
      return repositoryToQuery(targetRepository, {
        entityManager: this.transactionalEntityManager,
      });
    }
  }

  async commit<T>(runInTransaction: TransactionCallback<T>): Promise<T> {
    if (this.parentTransaction) {
      return runInTransaction(this);
    } else {
      return safeTransaction<T>(
        this.entityManager,
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
