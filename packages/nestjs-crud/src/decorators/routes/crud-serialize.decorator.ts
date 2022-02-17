import { applyDecorators, SetMetadata, UseInterceptors } from '@nestjs/common';
import { CRUD_MODULE_ROUTE_SERIALIZE_METADATA } from '../../crud.constants';
import { CrudSerializeInterceptor } from '../../interceptors/crud-serialize.interceptor';
import { CrudSerializeOptionsInterface } from '../../interfaces/crud-serialize-options.interface';

/**
 * CRUD serialize route decorator
 */
export function CrudSerialize(options?: CrudSerializeOptionsInterface) {
  return applyDecorators(
    SetMetadata(CRUD_MODULE_ROUTE_SERIALIZE_METADATA, options),
    UseInterceptors(CrudSerializeInterceptor),
  );
}
