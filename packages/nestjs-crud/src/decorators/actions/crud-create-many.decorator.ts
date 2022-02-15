import { applyDecorators, Post } from '@nestjs/common';
import { CrudCreateManyOptionsInterface } from '../../interfaces/crud-route-options.interface';
import { CrudActions } from '../../crud.enums';
import { CrudAction } from '../routes/crud-action.decorator';
import { CRUD_MODULE_ROUTE_CREATE_MANY_DEFAULT_PATH } from '../../crud.constants';

/**
 * CRUD Create Many route decorator
 */
export const CrudCreateMany = (options: CrudCreateManyOptionsInterface = {}) =>
  applyDecorators(
    Post(options?.path ?? CRUD_MODULE_ROUTE_CREATE_MANY_DEFAULT_PATH),
    CrudAction(CrudActions.CreateMany),
  );
