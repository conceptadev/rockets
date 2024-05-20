import { FindManyOptions, FindOneOptions, Repository } from 'typeorm';
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
   * @param repo instance of the repo
   */
  constructor(private repo: Repository<Entity>) {
    this.repositoryProxy = new RepositoryProxy(repo);
  }

  /**
   * Find wrapper.
   *
   * @param options Find many options
   * @param queryOptions
   */
  async find(
    options: FindManyOptions<Entity>,
    queryOptions?: QueryOptionsInterface,
  ): Promise<Promise<Entity[]>> {
    try {
      // call the repo find
      return this.repository(queryOptions).find(options);
    } catch (e) {
      // fatal orm error
      throw new ReferenceLookupException(this.metadata.name, e);
    }
  }

  /**
   * Find One wrapper.
   *
   * @param options Find one options
   * @param queryOptions
   */
  async findOne(
    options: FindOneOptions<Entity>,
    queryOptions?: QueryOptionsInterface,
  ): Promise<Entity | null> {
    try {
      // call the repo find one
      return this.repository(queryOptions).findOne(options);
    } catch (e) {
      // fatal orm error
      throw new ReferenceLookupException(this.metadata.name, e);
    }
  }

  /**
   * Return the correct repository instance.
   *
   * @param queryOptions Options
   */
  public repository(queryOptions?: QueryOptionsInterface): Repository<Entity> {
    return this.repositoryProxy.repository(queryOptions);
  }

  /**
   * Return a transaction instance.
   *
   * @param options Options
   */
  public transaction(
    options?: SafeTransactionOptionsInterface,
  ): TransactionProxy {
    return this.repositoryProxy.transaction(options);
  }

  /**
   * @private
   */
  protected get metadata() {
    return this.repo.metadata;
  }
}
