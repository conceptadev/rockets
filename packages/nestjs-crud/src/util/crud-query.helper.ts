import { Injectable } from '@nestjs/common';
import { CrudRequest } from '@nestjsx/crud';
import { SCondition } from '@nestjsx/crud-request';
import { CrudQueryOptionsInterface } from '../interfaces/crud-query-options.interface';

@Injectable()
export class CrudQueryHelper {
  modifyRequest(req: CrudRequest, options?: CrudQueryOptionsInterface) {
    // get any options?
    if (options) {
      // deconstruct
      const { filter, ...rest } = options;
      // merge the options
      this.mergeOptions(req, rest);
      // add filters to search
      this.addSearch(req, filter);
    }
  }

  mergeOptions(
    req: CrudRequest,
    options: Omit<CrudQueryOptionsInterface, 'filter'>,
  ) {
    // already have options on request?
    if (req.options) {
      // yes, merge them
      req.options.query = {
        ...req.options?.query,
        ...options,
      };
    } else {
      // no, set the property
      req.options = {
        query: options,
      };
    }
  }

  addSearch(req: CrudRequest, search?: SCondition) {
    if (search) {
      req.parsed.search = {
        $and: [req.parsed.search, search],
      };
    }
  }
}
