import { ObjectLiteral, Repository, SelectQueryBuilder } from 'typeorm';
import { Injectable } from '@nestjs/common';
import { CrudRequest, JoinOptions, QueryOptions } from '@nestjsx/crud';
import { TypeOrmCrudService as xTypeOrmCrudService } from '@nestjsx/crud-typeorm';
import {
  SafeTransactionOptionsInterface,
  TransactionProxy,
} from '@concepta/typeorm-common';

import { CrudQueryHelper } from '../util/crud-query.helper';
import { CrudQueryOptionsInterface } from '../interfaces/crud-query-options.interface';
import { CrudResultPaginatedInterface } from '../interfaces/crud-result-paginated.interface';
import { CrudQueryException } from '../exceptions/crud-query.exception';
import { ParsedRequestParams, QueryJoin } from '@nestjsx/crud-request';

@Injectable()
export class TypeOrmCrudService<
  T extends ObjectLiteral,
> extends xTypeOrmCrudService<T> {
  constructor(protected repo: Repository<T>) {
    super(repo);
  }

  protected readonly crudQueryHelper: CrudQueryHelper = new CrudQueryHelper();

  async getMany(
    req: CrudRequest,
    queryOptions?: CrudQueryOptionsInterface,
  ): Promise<T[] | CrudResultPaginatedInterface<T>> {
    // apply options
    this.crudQueryHelper.modifyRequest(req, queryOptions);

    // the result
    let result;

    // get parent result
    try {
      result = await super.getMany(req);
    } catch (e) {
      throw new CrudQueryException(this.repo.metadata.name, e);
    }

    // is an array?
    if (Array.isArray(result)) {
      // yes, just return
      return result;
    } else {
      // not an array, add pagination hint
      return {
        ...result,
        __isPaginated: this.decidePagination(req.parsed, req.options),
      };
    }
  }

  async getOne(
    req: CrudRequest,
    queryOptions?: CrudQueryOptionsInterface,
  ): ReturnType<xTypeOrmCrudService<T>['getOne']> {
    // apply options
    this.crudQueryHelper.modifyRequest(req, queryOptions);
    // return parent result
    try {
      return super.getOne(req);
    } catch (e) {
      throw new CrudQueryException(this.repo.metadata.name, e);
    }
  }

  async createMany(
    req: CrudRequest,
    dto: Parameters<xTypeOrmCrudService<T>['createMany']>[1],
    queryOptions?: CrudQueryOptionsInterface,
  ): ReturnType<xTypeOrmCrudService<T>['createMany']> {
    // apply options
    this.crudQueryHelper.modifyRequest(req, queryOptions);
    // return parent result
    try {
      return super.createMany(req, dto);
    } catch (e) {
      throw new CrudQueryException(this.repo.metadata.name, e);
    }
  }

  async createOne(
    req: CrudRequest,
    dto: Parameters<xTypeOrmCrudService<T>['createOne']>[1],
    queryOptions?: CrudQueryOptionsInterface,
  ): ReturnType<xTypeOrmCrudService<T>['createOne']> {
    // apply options
    this.crudQueryHelper.modifyRequest(req, queryOptions);
    // return parent result
    try {
      return super.createOne(req, dto);
    } catch (e) {
      throw new CrudQueryException(this.repo.metadata.name, e);
    }
  }

  async updateOne(
    req: CrudRequest,
    dto: Parameters<xTypeOrmCrudService<T>['updateOne']>[1],
    queryOptions?: CrudQueryOptionsInterface,
  ): ReturnType<xTypeOrmCrudService<T>['updateOne']> {
    // apply options
    this.crudQueryHelper.modifyRequest(req, queryOptions);
    // return parent result
    try {
      return super.updateOne(req, dto);
    } catch (e) {
      throw new CrudQueryException(this.repo.metadata.name, e);
    }
  }

  async replaceOne(
    req: CrudRequest,
    dto: Parameters<xTypeOrmCrudService<T>['replaceOne']>[1],
    queryOptions?: CrudQueryOptionsInterface,
  ): ReturnType<xTypeOrmCrudService<T>['replaceOne']> {
    // apply options
    this.crudQueryHelper.modifyRequest(req, queryOptions);
    // return parent result
    try {
      return super.replaceOne(req, dto);
    } catch (e) {
      throw new CrudQueryException(this.repo.metadata.name, e);
    }
  }

  async deleteOne(
    req: CrudRequest,
    queryOptions?: CrudQueryOptionsInterface,
  ): ReturnType<xTypeOrmCrudService<T>['deleteOne']> {
    // apply options
    this.crudQueryHelper.modifyRequest(req, queryOptions);
    // return parent result
    try {
      return super.deleteOne(req);
    } catch (e) {
      throw new CrudQueryException(this.repo.metadata.name, e);
    }
  }

  async recoverOne(
    req: CrudRequest,
    queryOptions?: CrudQueryOptionsInterface,
  ): ReturnType<xTypeOrmCrudService<T>['recoverOne']> {
    // apply options
    this.crudQueryHelper.modifyRequest(req, queryOptions);
    // return parent result
    try {
      return super.recoverOne(req);
    } catch (e) {
      throw new CrudQueryException(this.repo.metadata.name, e);
    }
  }

  transaction(options?: SafeTransactionOptionsInterface): TransactionProxy {
    return new TransactionProxy(this.repo.manager, options);
  }

  protected setJoin(
    cond: QueryJoin,
    joinOptions: JoinOptions,
    builder: SelectQueryBuilder<T>,
  ): ReturnType<xTypeOrmCrudService<T>['setJoin']> {
    const options = joinOptions[cond.field];

    if (!options) {
      return true;
    }

    const allowedRelation = this.getRelationMetadata(cond.field, options);

    if (!allowedRelation) {
      return true;
    }

    const relationType = options.required ? 'innerJoin' : 'leftJoin';
    const alias = options.alias ? options.alias : allowedRelation.name;

    builder[relationType](allowedRelation.path, alias);

    if (options.select !== false) {
      const columns =
        Array.isArray(cond.select) && cond.select?.length
          ? cond.select.filter((column) =>
              allowedRelation.allowedColumns.some(
                (allowed) => allowed === column,
              ),
            )
          : allowedRelation.allowedColumns;

      const select = new Set(
        [
          ...allowedRelation.primaryColumns,
          ...(Array.isArray(options.persist) && options.persist?.length
            ? options.persist
            : []),
          ...columns,
        ].map((col) => `${alias}.${col}`),
      );

      builder.addSelect(Array.from(select));
    }

    return true;
  }

  protected getSelect(
    query: ParsedRequestParams,
    options: QueryOptions,
  ): string[] {
    const allowed = this.getAllowedColumns(this.entityColumns, options);

    const columns =
      query.fields && query.fields.length
        ? query.fields.filter((field) => allowed.some((col) => field === col))
        : allowed;

    const select = new Set(
      [
        ...(options.persist && options.persist.length ? options.persist : []),
        ...columns,
        ...this.entityPrimaryColumns,
      ].map((col) => `${this.alias}.${col}`),
    );

    return Array.from(select);
  }
}
