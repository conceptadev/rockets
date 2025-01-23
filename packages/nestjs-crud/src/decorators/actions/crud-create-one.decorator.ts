import { applyDecorators, Post, SetMetadata } from '@nestjs/common';
import { CrudCreateOneOptionsInterface } from '../../interfaces/crud-route-options.interface';
import { CrudActions } from '../../crud.enums';
import { CrudAction } from '../routes/crud-action.decorator';
import { CRUD_MODULE_ROUTE_CREATE_ONE_METADATA } from '../../crud.constants';
import { CrudValidate } from '../routes/crud-validate.decorator';
import { CrudSerialize } from '../routes/crud-serialize.decorator';
import { CrudApiOperation } from '../openapi/crud-api-operation.decorator';
import { CrudApiBody } from '../openapi/crud-api-body.decorator';
import { CrudApiResponse } from '../openapi/crud-api-response.decorator';

/**
 * CRUD Create One route decorator
 */
export const CrudCreateOne = (options: CrudCreateOneOptionsInterface = {}) => {
  const { path, validation, serialization, api, ...rest } = { ...options };

  return applyDecorators(
    Post(path),
    CrudAction(CrudActions.CreateOne),
    SetMetadata(CRUD_MODULE_ROUTE_CREATE_ONE_METADATA, rest),
    CrudValidate(validation),
    CrudSerialize(serialization),
    CrudApiOperation(api?.operation),
    CrudApiBody({
      type: options?.dto,
      ...options?.api?.body,
    }),
    CrudApiResponse(CrudActions.CreateOne, api?.response),
  );
};
