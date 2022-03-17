import { applyDecorators, Patch, SetMetadata } from '@nestjs/common';
import { CrudRecoverOneOptionsInterface } from '../../interfaces/crud-route-options.interface';
import { CrudActions } from '../../crud.enums';
import { CrudAction } from '../routes/crud-action.decorator';
import {
  CRUD_MODULE_ROUTE_RECOVER_ONE_DEFAULT_PATH,
  CRUD_MODULE_ROUTE_RECOVER_ONE_METADATA,
} from '../../crud.constants';
import { CrudValidate } from '../routes/crud-validate.decorator';
import { CrudSerialize } from '../routes/crud-serialize.decorator';
import { CrudApiOperation } from '../openapi/crud-api-operation.decorator';
import { CrudApiParam } from '../openapi/crud-api-param.decorator';
import { CrudApiResponse } from '../openapi/crud-api-response.decorator';

/**
 * CRUD Recover One route decorator
 */
export const CrudRecoverOne = (
  options: CrudRecoverOneOptionsInterface = {},
) => {
  const {
    path = CRUD_MODULE_ROUTE_RECOVER_ONE_DEFAULT_PATH,
    validation,
    serialization,
    api,
    ...rest
  } = { ...options };

  return applyDecorators(
    Patch(path),
    CrudAction(CrudActions.RecoverOne),
    SetMetadata(CRUD_MODULE_ROUTE_RECOVER_ONE_METADATA, rest),
    CrudValidate(validation),
    CrudSerialize(serialization),
    CrudApiOperation(api?.operation),
    CrudApiParam(api?.params),
    CrudApiResponse(CrudActions.RecoverOne, api?.response),
  );
};
