import { SetMetadata } from '@nestjs/common';
import { CRUD_MODULE_ROUTE_QUERY_LIMIT_METADATA } from '../../crud.constants';
import { CrudQueryOptionsInterface } from '../../interfaces/crud-query-options.interface';

/**
 * CRUD limit route decorator.
 *
 * Set the CRUD limit query option.
 */
export const CrudLimit = (limit: CrudQueryOptionsInterface['limit']) =>
  SetMetadata(CRUD_MODULE_ROUTE_QUERY_LIMIT_METADATA, limit);
