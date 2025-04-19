import { EntityManagerProxy } from './entity-manager.proxy';
import { SafeTransactionOptionsInterface } from '../interfaces/safe-transaction-options.interface';
import { TransactionProxy } from './transaction.proxy';
import { ObjectLiteral, Repository } from 'typeorm';

export class RepositoryProxy<T extends ObjectLiteral> {
  private entityManagerProxy: EntityManagerProxy;

  constructor(private targetRepository: Repository<T>) {
    this.entityManagerProxy = new EntityManagerProxy(targetRepository.manager);
  }

  entityManager() {
    return this.entityManagerProxy.entityManager();
  }

  repository(): Repository<T> {
    return this.entityManagerProxy.repository<T>(this.targetRepository);
  }

  transaction(options?: SafeTransactionOptionsInterface): TransactionProxy {
    return this.entityManagerProxy.transaction(options);
  }
}
