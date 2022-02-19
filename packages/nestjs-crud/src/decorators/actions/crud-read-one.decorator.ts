import { applyDecorators, Get } from '@nestjs/common';
import { CRUD_MODULE_ROUTE_ID_DEFAULT_PATH } from '../../crud.constants';
import { CrudActions } from '../../crud.enums';
import { CrudReadOneOptionsInterface } from '../../interfaces/crud-route-options.interface';
import { CrudAction } from '../routes/crud-action.decorator';
import { CrudSerialize } from '../routes/crud-serialize.decorator';
import { CrudValidation } from '../routes/crud-validation.decorator';

/**
 * CRUD Read One route decorator
 */
export const CrudReadOne = (options: CrudReadOneOptionsInterface = {}) => {
  const {
    path = CRUD_MODULE_ROUTE_ID_DEFAULT_PATH,
    validation,
    serialize,
  } = { ...options };

  return applyDecorators(
    Get(path),
    CrudAction(CrudActions.ReadOne),
    CrudValidation(validation),
    CrudSerialize(serialize),
  );
};
