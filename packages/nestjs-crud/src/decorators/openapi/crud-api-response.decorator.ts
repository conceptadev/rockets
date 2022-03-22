import { SetMetadata, Type } from '@nestjs/common';
import { ApiResponseOptions } from '@nestjs/swagger';
import { CrudActions } from '@nestjsx/crud';
import { CRUD_MODULE_API_RESPONSE_METADATA } from '../../crud.constants';
import { CrudApiResponseMetadataInterface } from '../../interfaces/crud-api-response-metadata.interface';
import { CrudReflectionService } from '../../services/crud-reflection.service';

/**
 * @CrudApiResponse() open api decorator
 */
export function CrudApiResponse(
  action: CrudActions,
  options?: ApiResponseOptions,
): MethodDecorator {
  return (target: Type, propertyKey: string | symbol) => {
    const reflectionService = new CrudReflectionService();

    const previousValues =
      reflectionService.getApiResponseOptions(target) || [];

    const value: CrudApiResponseMetadataInterface = {
      propertyKey,
      action,
      options,
    };

    const values = [...previousValues, value];

    SetMetadata(CRUD_MODULE_API_RESPONSE_METADATA, values)(target);
  };
}
