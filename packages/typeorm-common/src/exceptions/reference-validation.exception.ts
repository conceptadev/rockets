import { ValidationError } from 'class-validator';
import {
  RuntimeException,
  RuntimeExceptionOptions,
} from '@concepta/nestjs-exception';
import { t } from '@concepta/i18n';
import { REFERENCE_VALIDATION_ERROR } from '../constants';

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
      message: t({
        key: REFERENCE_VALIDATION_ERROR,
        defaultMessage: 'Data for the %s reference is not valid',
      }),
      messageParams: [entityName],
      ...options,
    });

    this.context = {
      ...super.context,
      entityName,
      validationErrors,
    };

    this.errorCode = REFERENCE_VALIDATION_ERROR;
  }
}
