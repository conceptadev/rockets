import { applyDecorators, SetMetadata, UseInterceptors } from '@nestjs/common';
import {
  CRUD_MODULE_ROUTE_ACTION_METADATA,
  CRUD_MODULE_ROUTE_DELETE_ONE_METADATA,
} from '../../crud.constants';
import { CrudActions } from '../../crud.enums';
import { CrudRequestInterceptor } from '../../interceptors/crud-request.interceptor';
import { CrudDeleteOneOptionsInterface } from '../../interfaces/crud-route-options.interface';

/**
 * CRUD Delete One route decorator
 */
export const CrudDeleteOne = (options: CrudDeleteOneOptionsInterface = {}) =>
  applyDecorators(
    SetMetadata(CRUD_MODULE_ROUTE_ACTION_METADATA, CrudActions.DeleteOne),
    SetMetadata(CRUD_MODULE_ROUTE_DELETE_ONE_METADATA, options),
    UseInterceptors(CrudRequestInterceptor),
  );
