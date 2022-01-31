import { applyDecorators, SetMetadata, UseInterceptors } from '@nestjs/common';
import { CRUD_MODULE_ROUTE_ACTION_METADATA } from '../../crud.constants';
import { CrudActions } from '../../crud.enums';
import { CrudRequestInterceptor } from '../../interceptors/crud-request.interceptor';

/**
 * CRUD Read All route decorator
 */
export const CrudReadAll = () =>
  applyDecorators(
    SetMetadata(CRUD_MODULE_ROUTE_ACTION_METADATA, CrudActions.ReadAll),
    UseInterceptors(CrudRequestInterceptor),
  );
