import { applyDecorators, SetMetadata, UseInterceptors } from '@nestjs/common';
import {
  CRUD_MODULE_ROUTE_ACTION_METADATA,
  CRUD_MODULE_ROUTE_CREATE_ONE_METADATA,
} from '../../crud.constants';
import { CrudActions } from '../../crud.enums';
import { CrudRequestInterceptor } from '../../interceptors/crud-request.interceptor';
import { CrudCreateOneOptionsInterface } from '../../interfaces/crud-route-options.interface';

/**
 * CRUD Create One route decorator
 */
export const CrudCreateOne = (options: CrudCreateOneOptionsInterface = {}) =>
  applyDecorators(
    SetMetadata(CRUD_MODULE_ROUTE_ACTION_METADATA, CrudActions.CreateOne),
    SetMetadata(CRUD_MODULE_ROUTE_CREATE_ONE_METADATA, options),
    UseInterceptors(CrudRequestInterceptor),
  );
