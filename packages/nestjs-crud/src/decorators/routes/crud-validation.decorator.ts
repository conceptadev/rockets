import { SetMetadata, UsePipes, ValidationPipe } from '@nestjs/common';
import { Controller } from '@nestjs/common/interfaces';
import { MetadataScanner } from '@nestjs/core';
import { CRUD_MODULE_ROUTE_VALIDATION_METADATA } from '../../crud.constants';
import { CrudValidationOptions } from '../../crud.types';
import { CrudReflectionHelper } from '../../util/crud-reflection.helper';

export const CrudValidation = (
  options?: CrudValidationOptions,
): ClassDecorator & MethodDecorator => {
  return (
    ...args: Parameters<ClassDecorator> | Parameters<MethodDecorator>
  ) => {
    // get the args
    const [classTarget, propertyKey, descriptor] = args;

    SetMetadata(CRUD_MODULE_ROUTE_VALIDATION_METADATA, options)(
      classTarget,
      propertyKey,
      descriptor,
    );

    // does it look like a method decorator call?
    if (propertyKey && descriptor) {
      // yes, we are done
      return;
    } else if (classTarget instanceof Function) {
      const metadataScanner = new MetadataScanner();
      const reflectionHelper = new CrudReflectionHelper();

      // TODO: if no methods have an override, use one pipe at the controller level

      // scan all controller methods and add a validation pipe if applicable
      metadataScanner.scanFromPrototype<Controller, void>(
        classTarget,
        classTarget.prototype,
        (methodName) => {
          // get the validation options
          const validationOptions = reflectionHelper.getValidationOptions(
            classTarget,
            classTarget.prototype[methodName],
          );

          // validation was not explicitly disabled?
          if (validationOptions !== false) {
            // yes, add the pipe
            UsePipes(new ValidationPipe(validationOptions))(
              classTarget.prototype[methodName],
            );
          }
        },
      );
    }
  };
};
