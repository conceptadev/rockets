import { format } from 'util';
import { ValidationError } from 'class-validator';
import { ExceptionInterface } from '@concepta/ts-core';

export class ReferenceValidationException
  extends Error
  implements ExceptionInterface
{
  errorCode = 'REFERENCE_VALIDATION_ERROR';

  context: {
    entityName: string;
    validationErrors: ValidationError[];
  };

  constructor(
    entityName: string,
    validationErrors: ValidationError[],
    message = 'Data for the %s reference is not valid',
  ) {
    super(format(message, entityName));
    this.context = {
      entityName,
      validationErrors,
    };
  }
}
