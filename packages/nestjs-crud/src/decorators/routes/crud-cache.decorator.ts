import { SetMetadata } from '@nestjs/common';
import { CRUD_MODULE_ROUTE_QUERY_CACHE_METADATA } from '../../crud.constants';
import { CrudQueryOptionsInterface } from '../../interfaces/crud-query-options.interface';

/**
 * CRUD cache route decorator.
 *
 * Set the CRUD cache query option.
 */
export const CrudCache = (cache: CrudQueryOptionsInterface['cache']) =>
  SetMetadata(CRUD_MODULE_ROUTE_QUERY_CACHE_METADATA, cache);
