import { ObjectLiteral, Repository } from 'typeorm';
import { EntityManagerProxy } from './entity-manager.proxy';
import { QueryOptionsInterface } from '../interfaces/query-options.interface';
import { SafeTransactionOptionsInterface } from '../interfaces/safe-transaction-options.interface';
import { TransactionProxy } from './transaction.proxy';

export class RepositoryProxy<T extends ObjectLiteral> {
  private entityManagerProxy: EntityManagerProxy;

  constructor(private targetRepository: Repository<T>) {
    this.entityManagerProxy = new EntityManagerProxy(targetRepository.manager);
  }

  entityManager() {
    return this.entityManagerProxy.entityManager();
  }

  repository(queryOptions?: QueryOptionsInterface): Repository<T> {
    return this.entityManagerProxy.repository<T>(
      this.targetRepository,
      queryOptions,
    );
  }

  transaction(options?: SafeTransactionOptionsInterface): TransactionProxy {
    return this.entityManagerProxy.transaction(options);
  }
}
