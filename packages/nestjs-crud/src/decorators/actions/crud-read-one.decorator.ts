import { applyDecorators, Get } from '@nestjs/common';
import { CRUD_MODULE_ROUTE_ID_DEFAULT_PATH } from '../../crud.constants';
import { CrudActions } from '../../crud.enums';
import { CrudReadOneOptionsInterface } from '../../interfaces/crud-route-options.interface';
import { CrudAction } from '../routes/crud-action.decorator';

/**
 * CRUD Read One route decorator
 */
export const CrudReadOne = (options: CrudReadOneOptionsInterface = {}) =>
  applyDecorators(
    Get(options?.path ?? CRUD_MODULE_ROUTE_ID_DEFAULT_PATH),
    CrudAction(CrudActions.ReadOne),
  );
