import { Injectable } from '@nestjs/common';
import { CrudRequest } from '@nestjsx/crud';
import { SCondition } from '@nestjsx/crud-request';
import { CrudQueryOptionsInterface } from '../interfaces/crud-query-options.interface';

@Injectable()
export class CrudQueryService {
  modifyRequest(req: CrudRequest, options: CrudQueryOptionsInterface) {
    this.addOptions(req, options);
    this.addSearch(req, options.search);
  }

  addOptions(
    req: CrudRequest,
    options: Omit<CrudQueryOptionsInterface, 'search'>,
  ) {
    req.options = {
      ...req.options,
      ...options,
    };
  }

  addSearch(req: CrudRequest, options: SCondition) {
    req.parsed.search = {
      $and: [req.parsed.search, options],
    };
  }
}
