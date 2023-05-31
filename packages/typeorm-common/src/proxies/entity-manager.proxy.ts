import { EntityManager, ObjectLiteral, Repository } from 'typeorm';
import { EntityManagerOptionInterface } from '../interfaces/entity-manager-option.interface';
import { QueryOptionsInterface } from '../interfaces/query-options.interface';
import { SafeTransactionOptionsInterface } from '../interfaces/safe-transaction-options.interface';
import { TransactionProxy } from './transaction.proxy';

export class EntityManagerProxy {
  constructor(private _entityManager: EntityManager) {}

  entityManager(options?: EntityManagerOptionInterface) {
    return options?.entityManager ?? this._entityManager;
  }

  repository<T extends ObjectLiteral>(
    repository: Repository<T>,
    options?: QueryOptionsInterface & EntityManagerOptionInterface,
  ): Repository<T> {
    if (options?.transaction) {
      return options.transaction.repository(repository);
    } else if (this.entityManager(options) !== this._entityManager) {
      return this._entityManager.withRepository<T, Repository<T>>(repository);
    } else {
      return repository;
    }
  }

  transaction(options?: SafeTransactionOptionsInterface): TransactionProxy {
    return new TransactionProxy(this._entityManager, options);
  }
}
