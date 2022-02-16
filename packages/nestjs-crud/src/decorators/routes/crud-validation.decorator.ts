import { SetMetadata, UsePipes, ValidationPipe } from '@nestjs/common';
import { Controller } from '@nestjs/common/interfaces';
import { MetadataScanner } from '@nestjs/core';
import { CRUD_MODULE_ROUTE_VALIDATION_METADATA } from '../../crud.constants';
import { CrudValidationOptions } from '../../crud.types';
import { CrudReflectionHelper } from '../../util/crud-reflection.helper';

/**
 * Crud validation decorator.
 *
 * Add a ValidationPipe to a route (or entire controller).
 *
 * If this decorator is used on a controller, it will use the given options for
 * every route on the controller that does NOT have validations explicitly set.
 *
 * @param options crud validation options
 */
export const CrudValidation = (
  options?: CrudValidationOptions,
): ClassDecorator & MethodDecorator => {
  return (
    ...args: Parameters<ClassDecorator> | Parameters<MethodDecorator>
  ) => {
    // get the args
    const [classTarget, propertyKey, descriptor] = args;

    // set the meta data
    SetMetadata(CRUD_MODULE_ROUTE_VALIDATION_METADATA, options)(
      classTarget,
      propertyKey,
      descriptor,
    );

    // reflection helper
    const reflectionHelper = new CrudReflectionHelper();

    // does it look like a method decorator call?
    if (classTarget instanceof Object && propertyKey && descriptor) {
      // yes, get options
      const methodValidationOptions = reflectionHelper.getValidationOptions(
        classTarget[propertyKey],
      );

      // validation was not explicitly disabled?
      if (methodValidationOptions !== false) {
        // yes, add the pipe
        UsePipes(new ValidationPipe(methodValidationOptions))(
          classTarget[propertyKey],
        );
      }
    } else if (classTarget instanceof Function) {
      // will need a scanner
      const metadataScanner = new MetadataScanner();

      // get the class validation options
      const classValidationOptions =
        reflectionHelper.getValidationOptions(classTarget);

      // do we have class validation options?
      if (classValidationOptions !== false) {
        // yes, scan all controller methods and add a validation pipe if one is not already set
        metadataScanner.scanFromPrototype<Controller, void>(
          classTarget,
          classTarget.prototype,
          (methodName) => {
            // get the method validation options
            const methodValidationOptions =
              reflectionHelper.getValidationOptions(
                classTarget.prototype[methodName],
              );

            // validation not explicitly false and no validation was set at all?
            if (methodValidationOptions !== false && !methodValidationOptions) {
              // yes, add the pipe
              UsePipes(new ValidationPipe(classValidationOptions))(
                classTarget.prototype[methodName],
              );
            }
          },
        );
      }
    }
  };
};
