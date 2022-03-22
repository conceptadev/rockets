import { applyDecorators, Post } from '@nestjs/common';
import { CrudCreateManyOptionsInterface } from '../../interfaces/crud-route-options.interface';
import { CrudActions } from '../../crud.enums';
import { CrudAction } from '../routes/crud-action.decorator';
import { CRUD_MODULE_ROUTE_CREATE_MANY_DEFAULT_PATH } from '../../crud.constants';
import { CrudValidate } from '../routes/crud-validate.decorator';
import { CrudSerialize } from '../routes/crud-serialize.decorator';
import { CrudApiOperation } from '../openapi/crud-api-operation.decorator';
import { CrudApiResponse } from '../openapi/crud-api-response.decorator';

/**
 * CRUD Create Many route decorator
 */
export const CrudCreateMany = (
  options: CrudCreateManyOptionsInterface = {},
) => {
  const {
    path = CRUD_MODULE_ROUTE_CREATE_MANY_DEFAULT_PATH,
    validation,
    serialization,
    api,
  } = { ...options };

  return applyDecorators(
    Post(path),
    CrudAction(CrudActions.CreateMany),
    CrudValidate(validation),
    CrudSerialize(serialization),
    CrudApiOperation(api?.operation),
    CrudApiResponse(CrudActions.CreateMany, api?.response),
  );
};
