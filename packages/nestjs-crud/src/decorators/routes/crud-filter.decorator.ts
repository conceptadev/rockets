import { SetMetadata } from '@nestjs/common';
import { CRUD_MODULE_ROUTE_QUERY_FILTER_METADATA } from '../../crud.constants';
import { CrudQueryOptionsInterface } from '../../interfaces/crud-query-options.interface';

/**
 * CRUD filter route decorator.
 *
 * Set the CRUD filter query option.
 */
export const CrudFilter = (filters: CrudQueryOptionsInterface['filter']) =>
  SetMetadata(CRUD_MODULE_ROUTE_QUERY_FILTER_METADATA, filters);
