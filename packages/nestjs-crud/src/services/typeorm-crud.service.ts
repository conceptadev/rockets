import { Repository } from 'typeorm';
import { Injectable } from '@nestjs/common';
import { CrudRequest, GetManyDefaultResponse } from '@nestjsx/crud';
import { TypeOrmCrudService as xTypeOrmCrudService } from '@nestjsx/crud-typeorm';
import { CrudQueryHelper } from '../util/crud-query.helper';
import { CrudQueryOptionsInterface } from '../interfaces/crud-query-options.interface';
import { CrudPlainResponseInterface } from '../interfaces/crud-plain-response.interface';

@Injectable()
export class TypeOrmCrudService<T> extends xTypeOrmCrudService<T> {
  constructor(repo: Repository<T>) {
    super(repo);
  }

  private crudQueryHelper: CrudQueryHelper = new CrudQueryHelper();

  async getMany(
    req: CrudRequest,
    queryOptions?: CrudQueryOptionsInterface,
  ): Promise<T[] | (GetManyDefaultResponse<T> & CrudPlainResponseInterface)> {
    // apply options
    this.crudQueryHelper.modifyRequest(req, queryOptions);

    // get parent result
    const result = await super.getMany(req);

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
    return super.getOne(req);
  }

  async createMany(
    req: CrudRequest,
    dto: Parameters<xTypeOrmCrudService<T>['createMany']>[1],
    queryOptions?: CrudQueryOptionsInterface,
  ): ReturnType<xTypeOrmCrudService<T>['createMany']> {
    // apply options
    this.crudQueryHelper.modifyRequest(req, queryOptions);
    // return parent result
    return super.createMany(req, dto);
  }

  async createOne(
    req: CrudRequest,
    dto: Parameters<xTypeOrmCrudService<T>['createOne']>[1],
    queryOptions?: CrudQueryOptionsInterface,
  ): ReturnType<xTypeOrmCrudService<T>['createOne']> {
    // apply options
    this.crudQueryHelper.modifyRequest(req, queryOptions);
    // return parent result
    return super.createOne(req, dto);
  }

  async updateOne(
    req: CrudRequest,
    dto: Parameters<xTypeOrmCrudService<T>['updateOne']>[1],
    queryOptions?: CrudQueryOptionsInterface,
  ): ReturnType<xTypeOrmCrudService<T>['updateOne']> {
    // apply options
    this.crudQueryHelper.modifyRequest(req, queryOptions);
    // return parent result
    return super.updateOne(req, dto);
  }

  async replaceOne(
    req: CrudRequest,
    dto: Parameters<xTypeOrmCrudService<T>['replaceOne']>[1],
    queryOptions?: CrudQueryOptionsInterface,
  ): ReturnType<xTypeOrmCrudService<T>['replaceOne']> {
    // apply options
    this.crudQueryHelper.modifyRequest(req, queryOptions);
    // return parent result
    return super.replaceOne(req, dto);
  }

  async deleteOne(
    req: CrudRequest,
    queryOptions?: CrudQueryOptionsInterface,
  ): ReturnType<xTypeOrmCrudService<T>['deleteOne']> {
    // apply options
    this.crudQueryHelper.modifyRequest(req, queryOptions);
    // return parent result
    return super.deleteOne(req);
  }

  async recoverOne(
    req: CrudRequest,
    queryOptions?: CrudQueryOptionsInterface,
  ): ReturnType<xTypeOrmCrudService<T>['recoverOne']> {
    // apply options
    this.crudQueryHelper.modifyRequest(req, queryOptions);
    // return parent result
    return super.recoverOne(req);
  }
}
