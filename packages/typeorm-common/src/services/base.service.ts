import { FindOneOptions, Repository } from 'typeorm';
import { ReferenceIdInterface } from '@concepta/ts-core';

import { QueryOptionsInterface } from '../interfaces/query-options.interface';
import { SafeTransactionOptionsInterface } from '../interfaces/safe-transaction-options.interface';

import { ReferenceLookupException } from '../exceptions/reference-lookup.exception';
import { RepositoryProxy } from '../proxies/repository.proxy';
import { TransactionProxy } from '../proxies/transaction.proxy';

/**
 * Abstract service
 */
export abstract class BaseService<Entity extends ReferenceIdInterface> {
  private readonly repositoryProxy: RepositoryProxy<Entity>;

  /**
   * Constructor
   *
   * @param repo - instance of the repo
   */
  constructor(private repo: Repository<Entity>) {
    this.repositoryProxy = new RepositoryProxy(repo);
  }

  /**
   * Find One wrapper.
   *
   * @param findOneOptions - Find options
   * @param queryOptions - Query options
   */
  async findOne(
    findOneOptions: FindOneOptions<Entity>,
    queryOptions?: QueryOptionsInterface,
  ): Promise<Entity | null> {
    try {
      // call the repo find one
      return this.repository(queryOptions).findOne(findOneOptions);
    } catch (e) {
      // fatal orm error
      throw new ReferenceLookupException(this.metadata.name, e);
    }
  }

  /**
   * Return the correct repository instance.
   *
   * @param queryOptions - Options
   */
  public repository(queryOptions?: QueryOptionsInterface): Repository<Entity> {
    return this.repositoryProxy.repository(queryOptions);
  }

  /**
   * Return a transaction instance.
   *
   * @param options - Options
   */
  public transaction(
    options?: SafeTransactionOptionsInterface,
  ): TransactionProxy {
    return this.repositoryProxy.transaction(options);
  }

  /**
   * @internal
   */
  protected get metadata() {
    return this.repo.metadata;
  }
}
