import { format } from 'util';
import { ExceptionInterface, NotAnErrorException } from '@concepta/ts-core';
import { t } from '@concepta/i18n';
import { REFERENCE_MUTATE_ERROR } from '../constants';

export class ReferenceMutateException
  extends Error
  implements ExceptionInterface
{
  errorCode = REFERENCE_MUTATE_ERROR;

  context: {
    entityName: string;
    originalError: Error;
  };

  constructor(
    entityName: string,
    originalError: unknown,
    message?: string,
  ) {
    super(format(message
      ?? t({
        key: REFERENCE_MUTATE_ERROR,
        defaultMessage: 'Error Default while trying to mutate a %s reference'
      })
    , entityName));
    this.context = {
      entityName,
      originalError:
        originalError instanceof Error
          ? originalError
          : new NotAnErrorException(originalError),
    };
  }
}
