import { Repository } from 'typeorm';
import { Injectable } from '@nestjs/common';
import { CrudRequest } from '@nestjsx/crud';
import { TypeOrmCrudService as xTypeOrmCrudService } from '@nestjsx/crud-typeorm';
import { CrudQueryHelper } from '../util/crud-query.helper';
import { CrudQueryOptionsInterface } from '../interfaces/crud-query-options.interface';
import { CrudResultPaginatedInterface } from '../interfaces/crud-result-paginated.interface';
import { CrudQueryException } from '../exceptions/crud-query.exception';

@Injectable()
export class TypeOrmCrudService<T> extends xTypeOrmCrudService<T> {
  constructor(protected repo: Repository<T>) {
    super(repo);
  }

  private crudQueryHelper: CrudQueryHelper = new CrudQueryHelper();

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
}
