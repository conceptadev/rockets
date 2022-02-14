import { SetMetadata } from '@nestjs/common';
import { CRUD_MODULE_ROUTE_QUERY_ALLOW_METADATA } from '../../crud.constants';
import { CrudQueryOptionsInterface } from '../../interfaces/crud-query-options.interface';

/**
 * CRUD allow route decorator.
 *
 * Set the CRUD allow query option.
 */
export const CrudAllow = (fields: CrudQueryOptionsInterface['allow']) =>
  SetMetadata(CRUD_MODULE_ROUTE_QUERY_ALLOW_METADATA, fields);
