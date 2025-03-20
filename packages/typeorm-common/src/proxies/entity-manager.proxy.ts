import { EntityManagerOptionInterface } from '../interfaces/entity-manager-option.interface';
import { QueryOptionsInterface } from '../interfaces/query-options.interface';
import { SafeTransactionOptionsInterface } from '../interfaces/safe-transaction-options.interface';
import { TransactionProxy } from './transaction.proxy';
import { RepositoryInterface } from '../interfaces/repository.interface';
import { EntityManagerInterface } from '../interfaces/entity-manager-repository.interface';
import { ObjectLiteral } from 'typeorm';

export class EntityManagerProxy {
  constructor(private _entityManager: EntityManagerInterface) {}

  entityManager() {
    return this._entityManager;
  }

  repository<T extends ObjectLiteral>(
    repository: RepositoryInterface<T>,
    options?: QueryOptionsInterface & EntityManagerOptionInterface,
  ): RepositoryInterface<T> {
    if (options?.transaction) {
      return options.transaction.repository(repository);
    } else if (
      options?.entityManager &&
      options?.entityManager !== repository.manager
    ) {
      return options.entityManager.withRepository<T, RepositoryInterface<T>>(
        repository,
      );
    } else {
      return repository;
    }
  }

  transaction(options?: SafeTransactionOptionsInterface): TransactionProxy {
    return new TransactionProxy(this._entityManager, options);
  }
}
