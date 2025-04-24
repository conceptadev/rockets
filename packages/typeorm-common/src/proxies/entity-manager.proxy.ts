import { EntityManagerOptionInterface } from '../interfaces/entity-manager-option.interface';
import { QueryOptionsInterface } from '../interfaces/query-options.interface';
import { SafeTransactionOptionsInterface } from '../interfaces/safe-transaction-options.interface';
import { TransactionProxy } from './transaction.proxy';
import { EntityManager, ObjectLiteral, Repository } from 'typeorm';

export class EntityManagerProxy {
  constructor(private _entityManager: EntityManager) {}

  entityManager() {
    return this._entityManager;
  }

  repository<T extends ObjectLiteral>(
    repository: Repository<T>,
    options?: QueryOptionsInterface & EntityManagerOptionInterface,
  ): Repository<T> {
    if (options?.transaction) {
      return options.transaction.repository(repository);
    } else if (
      options?.entityManager &&
      options?.entityManager !== repository.manager
    ) {
      return options.entityManager.withRepository<T, Repository<T>>(repository);
    } else {
      return repository;
    }
  }

  transaction(options?: SafeTransactionOptionsInterface): TransactionProxy {
    return new TransactionProxy(this._entityManager, options);
  }
}
