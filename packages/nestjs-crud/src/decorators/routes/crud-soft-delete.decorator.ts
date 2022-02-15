import { SetMetadata } from '@nestjs/common';
import { CRUD_MODULE_ROUTE_QUERY_SOFT_DELETE_METADATA } from '../../crud.constants';
import { CrudQueryOptionsInterface } from '../../interfaces/crud-query-options.interface';

/**
 * CRUD soft delete route decorator.
 *
 * Set the CRUD soft delete query option.
 */
export const CrudSoftDelete = (
  softDelete: CrudQueryOptionsInterface['softDelete'],
) => SetMetadata(CRUD_MODULE_ROUTE_QUERY_SOFT_DELETE_METADATA, softDelete);
