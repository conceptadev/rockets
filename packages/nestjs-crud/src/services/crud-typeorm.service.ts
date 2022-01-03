import { Injectable } from '@nestjs/common';
import { CrudRequest, GetManyDefaultResponse } from '@nestjsx/crud';
import { TypeOrmCrudService } from '@nestjsx/crud-typeorm';
import { CrudQueryOptionsInterface } from '../interfaces/crud-query-options.interface';
import { CrudQueryService } from './crud-query.service';
import { Repository } from 'typeorm';

@Injectable()
export class CrudTypeOrmService<T> extends TypeOrmCrudService<T> {
  constructor(repo: Repository<T>, private crudQueryService: CrudQueryService) {
    super(repo);
  }

  async getMany(
    req: CrudRequest,
    customOptions?: CrudQueryOptionsInterface,
  ): Promise<GetManyDefaultResponse<T> | T[]> {
    // combine with custom stuff
    if (customOptions) {
      this.crudQueryService.modifyRequest(req, customOptions);
    }
    // return parent result
    return super.getMany(req);
  }
}
