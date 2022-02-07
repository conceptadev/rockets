import { Type, UsePipes } from '@nestjs/common';
import { Controller } from '@nestjs/common/interfaces';
import { isObject } from '@nestjs/common/utils/shared.utils';
import { MetadataScanner } from '@nestjs/core';
import { CrudCtrlOptionsInterface } from '../interfaces/crud-ctrl-options.interface';
import { CrudValidationPipe } from '../pipes/crud-validation.pipe';
import { CrudReflectionHelper } from '../util/crud-reflection.helper';

export const CrudControllerValidation =
  (options?: CrudCtrlOptionsInterface): ClassDecorator | MethodDecorator =>
  (classTarget: Type<Controller>) => {
    const metadataScanner = new MetadataScanner();
    const reflectionHelper = new CrudReflectionHelper();

    // TODO: if no methods have an override, use one pipe at the controller level

    // scan all controller methods and add a validation pipe if applicable
    metadataScanner.scanFromPrototype<Controller, void>(
      classTarget,
      classTarget.prototype,
      (methodName) => {
        // get the validation options
        const validationOptions = reflectionHelper.getMergedValidationOptions(
          classTarget.prototype[methodName],
          options?.validation,
        );
        // did we get any options for this method?
        if (
          isObject(validationOptions) &&
          Object.keys(validationOptions).length
        ) {
          // yes, create pipes decorator
          const usePipes = UsePipes(CrudValidationPipe);
          // call the decorator
          usePipes(classTarget.prototype[methodName]);
        }
      },
    );
  };
