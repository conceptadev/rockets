import { SetMetadata } from '@nestjs/common';
import { CRUD_MODULE_ROUTE_SERIALIZE_METADATA } from '../../crud.constants';
import { CrudSerializeOptionsInterface } from '../../interfaces/crud-serialize-options.interface';

/**
 * CRUD serialize route decorator
 */
export const CrudSerialize = (options?: CrudSerializeOptionsInterface) =>
  SetMetadata(CRUD_MODULE_ROUTE_SERIALIZE_METADATA, options);
