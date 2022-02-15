import { SetMetadata } from '@nestjs/common';
import { CRUD_MODULE_ROUTE_QUERY_SORT_METADATA } from '../../crud.constants';
import { CrudQueryOptionsInterface } from '../../interfaces/crud-query-options.interface';

/**
 * CRUD sort route decorator.
 *
 * Set the CRUD sort query option.
 */
export const CrudSort = (sort: CrudQueryOptionsInterface['sort']) =>
  SetMetadata(CRUD_MODULE_ROUTE_QUERY_SORT_METADATA, sort);
