import { applyDecorators, Patch, SetMetadata } from '@nestjs/common';
import { CrudRecoverOneOptionsInterface } from '../../interfaces/crud-route-options.interface';
import { CrudActions } from '../../crud.enums';
import { CrudAction } from '../routes/crud-action.decorator';
import {
  CRUD_MODULE_ROUTE_RECOVER_ONE_DEFAULT_PATH,
  CRUD_MODULE_ROUTE_RECOVER_ONE_METADATA,
} from '../../crud.constants';

/**
 * CRUD Recover One route decorator
 */
export const CrudRecoverOne = (options: CrudRecoverOneOptionsInterface = {}) =>
  applyDecorators(
    Patch(options?.path ?? CRUD_MODULE_ROUTE_RECOVER_ONE_DEFAULT_PATH),
    CrudAction(CrudActions.RecoverOne),
    SetMetadata(CRUD_MODULE_ROUTE_RECOVER_ONE_METADATA, options),
  );
