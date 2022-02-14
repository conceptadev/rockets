import { applyDecorators, Put, SetMetadata } from '@nestjs/common';
import { CrudReplaceOneOptionsInterface } from '../../interfaces/crud-route-options.interface';
import { CrudActions } from '../../crud.enums';
import { CrudAction } from '../routes/crud-action.decorator';
import {
  CRUD_MODULE_ROUTE_ID_DEFAULT_PATH,
  CRUD_MODULE_ROUTE_REPLACE_ONE_METADATA,
} from '../../crud.constants';

/**
 * CRUD Replace One route decorator
 */
export const CrudReplaceOne = (options: CrudReplaceOneOptionsInterface = {}) =>
  applyDecorators(
    Put(options?.path ?? CRUD_MODULE_ROUTE_ID_DEFAULT_PATH),
    CrudAction(CrudActions.ReplaceOne),
    SetMetadata(CRUD_MODULE_ROUTE_REPLACE_ONE_METADATA, options),
  );
