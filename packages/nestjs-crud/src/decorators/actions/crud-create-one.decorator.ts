import { applyDecorators, Post, SetMetadata } from '@nestjs/common';
import { CrudCreateOneOptionsInterface } from '../../interfaces/crud-route-options.interface';
import { CrudActions } from '../../crud.enums';
import { CrudAction } from '../routes/crud-action.decorator';
import { CRUD_MODULE_ROUTE_CREATE_ONE_METADATA } from '../../crud.constants';

/**
 * CRUD Create One route decorator
 */
export const CrudCreateOne = (options: CrudCreateOneOptionsInterface = {}) =>
  applyDecorators(
    Post(options?.path),
    CrudAction(CrudActions.CreateOne),
    SetMetadata(CRUD_MODULE_ROUTE_CREATE_ONE_METADATA, options),
  );
