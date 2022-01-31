import { SetMetadata } from '@nestjs/common';
import { CRUD_MODULE_ROUTE_ACTION_METADATA } from '../../crud.constants';
import { CrudCtrlOptionsInterface } from '../../interfaces/crud-ctrl-options.interface';

/**
 * CRUD Model route decorator.
 *
 * Set the CRUD model, or override the model set by the `@CrudController` decorator.
 */
export const CrudModel = (options: CrudCtrlOptionsInterface['model']) =>
  SetMetadata(CRUD_MODULE_ROUTE_ACTION_METADATA, options);
