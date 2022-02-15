import { SetMetadata } from '@nestjs/common';
import { ParamsOptions } from '@nestjsx/crud-request';
import { CRUD_MODULE_ROUTE_PARAMS_METADATA } from '../../crud.constants';

/**
 * CRUD Params route decorator.
 *
 * Set the CRUD params.
 */
export const CrudParams = (params: ParamsOptions) =>
  SetMetadata(CRUD_MODULE_ROUTE_PARAMS_METADATA, params);
