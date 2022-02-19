import { applyDecorators, Post, SetMetadata } from '@nestjs/common';
import { CrudCreateOneOptionsInterface } from '../../interfaces/crud-route-options.interface';
import { CrudActions } from '../../crud.enums';
import { CrudAction } from '../routes/crud-action.decorator';
import { CRUD_MODULE_ROUTE_CREATE_ONE_METADATA } from '../../crud.constants';
import { CrudValidation } from '../routes/crud-validation.decorator';
import { CrudSerialize } from '../routes/crud-serialize.decorator';

/**
 * CRUD Create One route decorator
 */
export const CrudCreateOne = (options: CrudCreateOneOptionsInterface = {}) => {
  const { path, validation, serialize, ...rest } = { ...options };

  return applyDecorators(
    Post(path),
    CrudAction(CrudActions.CreateOne),
    SetMetadata(CRUD_MODULE_ROUTE_CREATE_ONE_METADATA, rest),
    CrudValidation(validation),
    CrudSerialize(serialize),
  );
};
