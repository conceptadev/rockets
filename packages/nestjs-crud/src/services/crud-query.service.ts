import { Injectable } from '@nestjs/common';
import { CrudRequest } from '@nestjsx/crud';
import { CrudQueryOptionsInterface } from '../interfaces/crud-query-options.interface';

@Injectable()
export class CrudQueryService {
  modifyRequest(req: CrudRequest, options: CrudQueryOptionsInterface) {
    this.addOptions(req, options);
    this.addSearch(req, options);
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

  addSearch(
    req: CrudRequest,
    options: Pick<CrudQueryOptionsInterface, 'search'>,
  ) {
    req.parsed = {
      ...req.parsed,
      search: options.search,
    };
  }
}
