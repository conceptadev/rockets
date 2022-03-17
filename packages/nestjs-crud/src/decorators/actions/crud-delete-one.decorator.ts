import { applyDecorators, Delete, SetMetadata } from '@nestjs/common';
import { CrudDeleteOneOptionsInterface } from '../../interfaces/crud-route-options.interface';
import { CrudActions } from '../../crud.enums';
import { CrudAction } from '../routes/crud-action.decorator';
import {
  CRUD_MODULE_ROUTE_ID_DEFAULT_PATH,
  CRUD_MODULE_ROUTE_DELETE_ONE_METADATA,
} from '../../crud.constants';
import { CrudValidate } from '../routes/crud-validate.decorator';
import { CrudSerialize } from '../routes/crud-serialize.decorator';
import { CrudApiOperation } from '../openapi/crud-api-operation.decorator';
import { CrudApiParam } from '../openapi/crud-api-param.decorator';
import { CrudApiResponse } from '../openapi/crud-api-response.decorator';

/**
 * CRUD Delete One route decorator
 */
export const CrudDeleteOne = (options: CrudDeleteOneOptionsInterface = {}) => {
  const {
    path = CRUD_MODULE_ROUTE_ID_DEFAULT_PATH,
    validation,
    serialization,
    api,
    ...rest
  } = { ...options };

  return applyDecorators(
    Delete(path),
    CrudAction(CrudActions.DeleteOne),
    SetMetadata(CRUD_MODULE_ROUTE_DELETE_ONE_METADATA, rest),
    CrudValidate(validation),
    CrudSerialize(serialization),
    CrudApiOperation(api?.operation),
    CrudApiParam(api?.params),
    CrudApiResponse(CrudActions.DeleteOne, api?.response),
  );
};
