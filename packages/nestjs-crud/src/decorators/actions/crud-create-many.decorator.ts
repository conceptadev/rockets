import { applyDecorators, Post } from '@nestjs/common';
import { CrudCreateManyOptionsInterface } from '../../interfaces/crud-route-options.interface';
import { CrudActions } from '../../crud.enums';
import { CrudAction } from '../routes/crud-action.decorator';
import { CRUD_MODULE_ROUTE_CREATE_MANY_DEFAULT_PATH } from '../../crud.constants';
import { CrudValidation } from '../routes/crud-validation.decorator';
import { CrudSerialize } from '../routes/crud-serialize.decorator';

/**
 * CRUD Create Many route decorator
 */
export const CrudCreateMany = (
  options: CrudCreateManyOptionsInterface = {},
) => {
  const {
    path = CRUD_MODULE_ROUTE_CREATE_MANY_DEFAULT_PATH,
    validation,
    serialize,
  } = { ...options };

  return applyDecorators(
    Post(path),
    CrudAction(CrudActions.CreateMany),
    CrudValidation(validation),
    CrudSerialize(serialize),
  );
};
