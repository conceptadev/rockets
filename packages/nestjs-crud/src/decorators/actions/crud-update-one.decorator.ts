import { applyDecorators, Patch, SetMetadata } from '@nestjs/common';
import { CrudUpdateOneOptionsInterface } from '../../interfaces/crud-route-options.interface';
import { CrudActions } from '../../crud.enums';
import { CrudAction } from '../routes/crud-action.decorator';
import {
  CRUD_MODULE_ROUTE_ID_DEFAULT_PATH,
  CRUD_MODULE_ROUTE_UPDATE_ONE_METADATA,
} from '../../crud.constants';
import { CrudValidation } from '../routes/crud-validation.decorator';
import { CrudSerialize } from '../routes/crud-serialize.decorator';

/**
 * CRUD Update One route decorator
 */
export const CrudUpdateOne = (options: CrudUpdateOneOptionsInterface = {}) => {
  const {
    path = CRUD_MODULE_ROUTE_ID_DEFAULT_PATH,
    validation,
    serialize,
    ...rest
  } = { ...options };

  return applyDecorators(
    Patch(path),
    CrudAction(CrudActions.UpdateOne),
    SetMetadata(CRUD_MODULE_ROUTE_UPDATE_ONE_METADATA, rest),
    CrudValidation(validation),
    CrudSerialize(serialize),
  );
};
