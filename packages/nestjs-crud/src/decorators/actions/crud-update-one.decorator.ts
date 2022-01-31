import { applyDecorators, SetMetadata, UseInterceptors } from '@nestjs/common';
import {
  CRUD_MODULE_ROUTE_ACTION_METADATA,
  CRUD_MODULE_ROUTE_UPDATE_ONE_METADATA,
} from '../../crud.constants';
import { CrudActions } from '../../crud.enums';
import { CrudRequestInterceptor } from '../../interceptors/crud-request.interceptor';
import { CrudUpdateOneOptionsInterface } from '../../interfaces/crud-route-options.interface';

/**
 * CRUD Update One route decorator
 */
export const CrudUpdateOne = (options: CrudUpdateOneOptionsInterface = {}) =>
  applyDecorators(
    SetMetadata(CRUD_MODULE_ROUTE_ACTION_METADATA, CrudActions.UpdateOne),
    SetMetadata(CRUD_MODULE_ROUTE_UPDATE_ONE_METADATA, options),
    UseInterceptors(CrudRequestInterceptor),
  );
