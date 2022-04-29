import { ValidationError } from 'class-validator';
import { ExceptionInterface, formatMessage } from '@concepta/nestjs-exception';

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
    super(formatMessage(message, entityName));
    this.context.entityName = entityName;
    this.context.validationErrors = validationErrors;
  }
}
