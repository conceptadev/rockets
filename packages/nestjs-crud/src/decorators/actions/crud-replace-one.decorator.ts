import { applyDecorators, Put, SetMetadata } from '@nestjs/common';
import { CrudReplaceOneOptionsInterface } from '../../interfaces/crud-route-options.interface';
import { CrudActions } from '../../crud.enums';
import { CrudAction } from '../routes/crud-action.decorator';
import {
  CRUD_MODULE_ROUTE_ID_DEFAULT_PATH,
  CRUD_MODULE_ROUTE_REPLACE_ONE_METADATA,
} from '../../crud.constants';
import { CrudValidation } from '../routes/crud-validation.decorator';
import { CrudSerialize } from '../routes/crud-serialize.decorator';

/**
 * CRUD Replace One route decorator
 */
export const CrudReplaceOne = (
  options: CrudReplaceOneOptionsInterface = {},
) => {
  const {
    path = CRUD_MODULE_ROUTE_ID_DEFAULT_PATH,
    validation,
    serialize,
    ...rest
  } = { ...options };

  return applyDecorators(
    Put(path),
    CrudAction(CrudActions.ReplaceOne),
    SetMetadata(CRUD_MODULE_ROUTE_REPLACE_ONE_METADATA, rest),
    CrudValidation(validation),
    CrudSerialize(serialize),
  );
};
