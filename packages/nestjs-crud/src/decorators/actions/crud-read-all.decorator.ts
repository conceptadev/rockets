import { applyDecorators, Get } from '@nestjs/common';
import { CrudActions } from '../../crud.enums';
import { CrudReadAllOptionsInterface } from '../../interfaces/crud-route-options.interface';
import { CrudAction } from '../routes/crud-action.decorator';
import { CrudSerialize } from '../routes/crud-serialize.decorator';
import { CrudValidate } from '../routes/crud-validate.decorator';

/**
 * CRUD Read All route decorator
 */
export const CrudReadAll = (options: CrudReadAllOptionsInterface = {}) => {
  const { path, validation, serialization } = options;

  return applyDecorators(
    Get(path),
    CrudAction(CrudActions.ReadAll),
    CrudValidate(validation),
    CrudSerialize(serialization),
  );
};
