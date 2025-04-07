import { ValidationError } from 'class-validator';
import {
  RuntimeException,
  RuntimeExceptionOptions,
} from '@concepta/nestjs-common';

export class ReferenceValidationException extends RuntimeException {
  context: RuntimeException['context'] & {
    entityName: string;
    validationErrors: ValidationError[];
  };

  constructor(
    entityName: string,
    validationErrors: ValidationError[],
    options?: RuntimeExceptionOptions,
  ) {
    super({
      message: 'Data for the %s reference is not valid',
      messageParams: [entityName],
      ...options,
    });

    this.context = {
      ...super.context,
      entityName,
      validationErrors,
    };

    this.errorCode = 'REFERENCE_VALIDATION_ERROR';
  }
}
