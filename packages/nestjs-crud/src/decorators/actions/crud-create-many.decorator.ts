import { applyDecorators, SetMetadata, UseInterceptors } from '@nestjs/common';
import { CRUD_MODULE_ROUTE_ACTION_METADATA } from '../../crud.constants';
import { CrudActions } from '../../crud.enums';
import { CrudRequestInterceptor } from '../../interceptors/crud-request.interceptor';

/**
 * CRUD Create Many route decorator
 */
export const CrudCreateMany = () =>
  applyDecorators(
    SetMetadata(CRUD_MODULE_ROUTE_ACTION_METADATA, CrudActions.CreateMany),
    UseInterceptors(CrudRequestInterceptor),
  );
