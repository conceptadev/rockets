import { ValidationError } from 'class-validator';
import {
  RuntimeException,
  RuntimeExceptionOptions,
} from '@concepta/nestjs-exception';

export class ReferenceValidationException extends RuntimeException {
  context: RuntimeException['context'] & {
    entityName: string;
    validationErrors: ValidationError[];
  };

  constructor(
    entityName: string,
    validationErrors: ValidationError[],
    message = 'Data for the %s reference is not valid',
    options?: RuntimeExceptionOptions,
  ) {
    super({
      message,
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
