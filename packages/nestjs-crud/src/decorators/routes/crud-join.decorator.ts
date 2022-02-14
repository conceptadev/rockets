import { SetMetadata } from '@nestjs/common';
import { CRUD_MODULE_ROUTE_QUERY_JOIN_METADATA } from '../../crud.constants';
import { CrudQueryOptionsInterface } from '../../interfaces/crud-query-options.interface';

/**
 * CRUD join route decorator.
 *
 * Set the CRUD join query option.
 */
export const CrudJoin = (joins: CrudQueryOptionsInterface['join']) =>
  SetMetadata(CRUD_MODULE_ROUTE_QUERY_JOIN_METADATA, joins);
