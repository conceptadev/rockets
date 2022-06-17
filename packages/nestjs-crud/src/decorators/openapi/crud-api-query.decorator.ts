import { SetMetadata } from '@nestjs/common';
import { ApiQueryOptions } from '@nestjs/swagger';
import { CRUD_MODULE_API_QUERY_METADATA } from '../../crud.constants';
import { DecoratorTargetObject } from '../../crud.types';
import { CrudApiQueryMetadataInterface } from '../../interfaces/crud-api-query-metadata.interface';
import { CrudReflectionService } from '../../services/crud-reflection.service';

/**
 * @CrudApiQuery() open api decorator
 */
export function CrudApiQuery(options?: ApiQueryOptions[]): MethodDecorator {
  return (target: DecoratorTargetObject, ...rest) => {
    const [propertyKey] = rest;

    if (!('__proto__' in target)) {
      throw new Error('Cannot decorate with api query, target must be a class');
    }

    const reflectionService = new CrudReflectionService();

    const previousValues = reflectionService.getApiQueryOptions(target) || [];

    const value: CrudApiQueryMetadataInterface = {
      propertyKey,
      options,
    };

    const values = [...previousValues, value];

    SetMetadata(CRUD_MODULE_API_QUERY_METADATA, values)(target);
  };
}
