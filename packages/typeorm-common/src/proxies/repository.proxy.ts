import { Repository } from 'typeorm';
import { QueryOptionsInterface } from '../interfaces/query-options.interface';
import { SafeTransactionOptionsInterface } from '../interfaces/safe-transaction-options.interface';
import { repositoryToQuery } from '../utils/repository-to-query.util';
import { TransactionProxy } from './transaction.proxy';

export class RepositoryProxy<T = unknown> {
  constructor(private targetRepository: Repository<T>) {}

  repository(queryOptions?: QueryOptionsInterface): Repository<T> {
    return repositoryToQuery(this.targetRepository, queryOptions);
  }

  transaction(options?: SafeTransactionOptionsInterface): TransactionProxy {
    return new TransactionProxy(this.targetRepository.manager, options);
  }
}
