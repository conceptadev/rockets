import { SetMetadata } from '@nestjs/common';
import { CRUD_MODULE_ROUTE_QUERY_MAX_LIMIT_METADATA } from '../../crud.constants';
import { CrudQueryOptionsInterface } from '../../interfaces/crud-query-options.interface';

/**
 * CRUD max limit route decorator.
 *
 * Set the CRUD max limit query option.
 */
export const CrudMaxLimit = (maxLimit: CrudQueryOptionsInterface['maxLimit']) =>
  SetMetadata(CRUD_MODULE_ROUTE_QUERY_MAX_LIMIT_METADATA, maxLimit);
