import { Body, ValidationPipe } from '@nestjs/common';
import { CrudReflectionService } from '../../services/crud-reflection.service';

/**
 * Crud initialize validation decorator.
 *
 * Add a ValidationPipe to every parameter called with the `CrudBody` decorator.
 */
export const CrudInitValidation =
  (): ClassDecorator =>
  (...args: Parameters<ClassDecorator>) => {
    // get the args
    const [classTarget] = args;

    // reflection service
    const reflectionService = new CrudReflectionService();

    // get the param options
    const bodyParamMetadata = reflectionService.getBodyParamOptions(
      classTarget.prototype,
    );

    // get the fallback validation options
    const fallbackOptions = reflectionService.getValidationOptions(classTarget);

    // do we have param validation metada?
    if (Array.isArray(bodyParamMetadata)) {
      // yes, loop all metadatas and set up the pipe
      bodyParamMetadata.map((metadata) => {
        // break out the args
        let { pipes = [] } = metadata;
        const { validation = fallbackOptions } = metadata;

        // are we injecting validation?
        if (
          validation !== false &&
          (typeof validation === 'object' || typeof validation === 'undefined')
        ) {
          // yes, put our validation pipe first
          pipes = [new ValidationPipe(validation), ...pipes];
        }

        // create the body decorator
        Body(...pipes)(
          classTarget.prototype,
          metadata.propertyKey,
          metadata.parameterIndex,
        );
      });
    }
  };
