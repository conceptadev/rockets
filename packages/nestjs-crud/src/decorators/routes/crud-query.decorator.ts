import { SetMetadata } from '@nestjs/common';
import { CRUD_MODULE_ROUTE_QUERY_METADATA } from '../../crud.constants';
import { CrudQueryOptionsInterface } from '../../interfaces/crud-query-options.interface';

/**
 * CRUD Query decorator
 *
 * @todo This decorator is temporary, remove when all individual options decorators have been created.
 * @param {CrudQueryOptionsInterface} options
 */
export const CrudQuery = (options: CrudQueryOptionsInterface) =>
  SetMetadata(CRUD_MODULE_ROUTE_QUERY_METADATA, options);
