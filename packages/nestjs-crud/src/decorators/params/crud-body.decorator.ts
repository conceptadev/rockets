import { SetMetadata, Type } from '@nestjs/common';
import { CRUD_MODULE_PARAM_BODY_METADATA } from '../../crud.constants';
import { CrudBodyOptionsInterface } from '../../interfaces/crud-body-options.interface';
import { CrudValidationMetadataInterface } from '../../interfaces/crud-validation-metadata.interface';
import { CrudReflectionService } from '../../services/crud-reflection.service';

/**
 * @CrudBody() parameter decorator
 */
export function CrudBody(
  options?: CrudBodyOptionsInterface,
): ParameterDecorator {
  return (
    target: Type,
    propertyKey: string | symbol,
    parameterIndex: number,
  ) => {
    const reflectionService = new CrudReflectionService();

    const previousValues = reflectionService.getBodyParamOptions(target) || [];

    const value: CrudValidationMetadataInterface = {
      propertyKey,
      parameterIndex,
      validation: options?.validation,
      pipes: options?.pipes,
    };

    const values = [...previousValues, value];

    SetMetadata(CRUD_MODULE_PARAM_BODY_METADATA, values)(target);
  };
}
