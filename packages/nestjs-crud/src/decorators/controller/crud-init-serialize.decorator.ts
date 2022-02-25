import { UseInterceptors } from '@nestjs/common';
import { CrudSerializeInterceptor } from '../../interceptors/crud-serialize.interceptor';

/**
 * Crud initialize serialize decorator.
 *
 * Sets up the crud serialize interceptor.
 */
export const CrudInitSerialize = () =>
  UseInterceptors(CrudSerializeInterceptor);
