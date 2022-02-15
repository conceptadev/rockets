import { SetMetadata } from '@nestjs/common';
import { CRUD_MODULE_ROUTE_QUERY_ALWAYS_PAGINATE_METADATA } from '../../crud.constants';
import { CrudQueryOptionsInterface } from '../../interfaces/crud-query-options.interface';

/**
 * CRUD always paginate route decorator.
 *
 * Set the CRUD always paginate query option.
 */
export const CrudAlwaysPaginate = (
  alwaysPaginate: CrudQueryOptionsInterface['alwaysPaginate'],
) =>
  SetMetadata(CRUD_MODULE_ROUTE_QUERY_ALWAYS_PAGINATE_METADATA, alwaysPaginate);
