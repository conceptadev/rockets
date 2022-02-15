import { SetMetadata } from '@nestjs/common';
import { ModelOptions } from '@nestjsx/crud';
import { CRUD_MODULE_ROUTE_MODEL_METADATA } from '../../crud.constants';

/**
 * CRUD Model route decorator.
 *
 * Set the CRUD model, or override the model set by the `@CrudController` decorator.
 */
export const CrudModel = (options: ModelOptions) =>
  SetMetadata(CRUD_MODULE_ROUTE_MODEL_METADATA, options);
