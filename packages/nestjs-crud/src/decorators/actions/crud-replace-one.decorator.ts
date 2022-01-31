import { applyDecorators, SetMetadata, UseInterceptors } from '@nestjs/common';
import {
  CRUD_MODULE_ROUTE_ACTION_METADATA,
  CRUD_MODULE_ROUTE_REPLACE_ONE_METADATA,
} from '../../crud.constants';
import { CrudActions } from '../../crud.enums';
import { CrudRequestInterceptor } from '../../interceptors/crud-request.interceptor';
import { CrudReplaceOneOptionsInterface } from '../../interfaces/crud-route-options.interface';

/**
 * CRUD Replace One route decorator
 */
export const CrudReplaceOne = (options: CrudReplaceOneOptionsInterface = {}) =>
  applyDecorators(
    SetMetadata(CRUD_MODULE_ROUTE_ACTION_METADATA, CrudActions.ReplaceOne),
    SetMetadata(CRUD_MODULE_ROUTE_REPLACE_ONE_METADATA, options),
    UseInterceptors(CrudRequestInterceptor),
  );
