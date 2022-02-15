import { applyDecorators, Get } from '@nestjs/common';
import { CrudActions } from '../../crud.enums';
import { CrudReadAllOptionsInterface } from '../../interfaces/crud-route-options.interface';
import { CrudAction } from '../routes/crud-action.decorator';

/**
 * CRUD Read All route decorator
 */
export const CrudReadAll = (options: CrudReadAllOptionsInterface = {}) =>
  applyDecorators(Get(options?.path), CrudAction(CrudActions.ReadAll));
