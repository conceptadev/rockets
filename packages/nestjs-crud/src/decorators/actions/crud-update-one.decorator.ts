import { applyDecorators, Patch, SetMetadata } from '@nestjs/common';
import { CrudUpdateOneOptionsInterface } from '../../interfaces/crud-route-options.interface';
import { CrudActions } from '../../crud.enums';
import { CrudAction } from '../routes/crud-action.decorator';
import {
  CRUD_MODULE_ROUTE_ID_DEFAULT_PATH,
  CRUD_MODULE_ROUTE_UPDATE_ONE_METADATA,
} from '../../crud.constants';

/**
 * CRUD Update One route decorator
 */
export const CrudUpdateOne = (options: CrudUpdateOneOptionsInterface = {}) =>
  applyDecorators(
    Patch(options?.path ?? CRUD_MODULE_ROUTE_ID_DEFAULT_PATH),
    CrudAction(CrudActions.UpdateOne),
    SetMetadata(CRUD_MODULE_ROUTE_UPDATE_ONE_METADATA, options),
  );
