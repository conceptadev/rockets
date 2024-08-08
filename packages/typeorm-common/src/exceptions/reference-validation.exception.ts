import { format } from 'util';
import { ValidationError } from 'class-validator';
import { t } from '@concepta/i18n';
import { ExceptionInterface } from '@concepta/ts-core';
import { REFERENCE_VALIDATION_ERROR } from '../constants';

export class ReferenceValidationException
  extends Error
  implements ExceptionInterface
{
  errorCode = REFERENCE_VALIDATION_ERROR;

  context: {
    entityName: string;
    validationErrors: ValidationError[];
  };

  constructor(
    entityName: string,
    validationErrors: ValidationError[],
    message?: string,
  ) {
    super(format(message
      ?? t({
        key: REFERENCE_VALIDATION_ERROR,
        defaultMessage: 'Data for the %s reference is not valid',
      })
    , entityName));
    this.context = {
      entityName,
      validationErrors,
    };
  }
}
