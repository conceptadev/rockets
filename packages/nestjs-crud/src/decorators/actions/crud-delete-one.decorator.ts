import { applyDecorators, Delete, SetMetadata } from '@nestjs/common';
import { CrudDeleteOneOptionsInterface } from '../../interfaces/crud-route-options.interface';
import { CrudActions } from '../../crud.enums';
import { CrudAction } from '../routes/crud-action.decorator';
import {
  CRUD_MODULE_ROUTE_ID_DEFAULT_PATH,
  CRUD_MODULE_ROUTE_DELETE_ONE_METADATA,
} from '../../crud.constants';

/**
 * CRUD Delete One route decorator
 */
export const CrudDeleteOne = (options: CrudDeleteOneOptionsInterface = {}) =>
  applyDecorators(
    Delete(options?.path ?? CRUD_MODULE_ROUTE_ID_DEFAULT_PATH),
    CrudAction(CrudActions.DeleteOne),
    SetMetadata(CRUD_MODULE_ROUTE_DELETE_ONE_METADATA, options),
  );
