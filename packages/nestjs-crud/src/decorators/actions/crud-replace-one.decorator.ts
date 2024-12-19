import { applyDecorators, Put, SetMetadata } from '@nestjs/common';
import { CrudReplaceOneOptionsInterface } from '../../interfaces/crud-route-options.interface';
import { CrudValidationOptions } from '../../crud.types';
import { CrudActions } from '../../crud.enums';
import { CrudAction } from '../routes/crud-action.decorator';
import {
  CRUD_MODULE_ROUTE_ID_DEFAULT_PATH,
  CRUD_MODULE_ROUTE_REPLACE_ONE_METADATA,
} from '../../crud.constants';
import { CrudValidate } from '../routes/crud-validate.decorator';
import { CrudSerialize } from '../routes/crud-serialize.decorator';
import { CrudApiOperation } from '../openapi/crud-api-operation.decorator';
import { CrudApiParam } from '../openapi/crud-api-param.decorator';
import { CrudApiResponse } from '../openapi/crud-api-response.decorator';

/**
 * CRUD Replace One route decorator
 */
export const CrudReplaceOne = (
  options: CrudReplaceOneOptionsInterface = {},
) => {
  const {
    path = CRUD_MODULE_ROUTE_ID_DEFAULT_PATH,
    dto,
    validation,
    serialization,
    api,
    ...rest
  } = { ...options };

  const validationMerged: CrudValidationOptions = dto
    ? { expectedType: dto, ...validation }
    : validation;

  return applyDecorators(
    Put(path),
    CrudAction(CrudActions.ReplaceOne),
    SetMetadata(CRUD_MODULE_ROUTE_REPLACE_ONE_METADATA, rest),
    CrudValidate(validationMerged),
    CrudSerialize(serialization),
    CrudApiOperation(api?.operation),
    CrudApiParam(api?.params),
    CrudApiResponse(CrudActions.ReplaceOne, api?.response),
  );
};
