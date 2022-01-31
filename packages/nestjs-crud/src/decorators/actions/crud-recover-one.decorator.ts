import { applyDecorators, SetMetadata, UseInterceptors } from '@nestjs/common';
import {
  CRUD_MODULE_ROUTE_ACTION_METADATA,
  CRUD_MODULE_ROUTE_RECOVER_ONE_METADATA,
} from '../../crud.constants';
import { CrudActions } from '../../crud.enums';
import { CrudRequestInterceptor } from '../../interceptors/crud-request.interceptor';
import { CrudReplaceOneOptionsInterface } from '../../interfaces/crud-route-options.interface';

/**
 * CRUD Recover One route decorator
 */
export const CrudRecoverOne = (options: CrudReplaceOneOptionsInterface = {}) =>
  applyDecorators(
    SetMetadata(CRUD_MODULE_ROUTE_ACTION_METADATA, CrudActions.RecoverOne),
    SetMetadata(CRUD_MODULE_ROUTE_RECOVER_ONE_METADATA, options),
    UseInterceptors(CrudRequestInterceptor),
  );
