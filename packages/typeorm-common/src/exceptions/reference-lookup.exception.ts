import { format } from 'util';
import { ExceptionInterface, NotAnErrorException } from '@concepta/ts-core';
import { t } from '@concepta/i18n';
import { REFERENCE_LOOKUP_ERROR } from '../constants';


export class ReferenceLookupException
  extends Error
  implements ExceptionInterface
{
  errorCode = REFERENCE_LOOKUP_ERROR;

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
        key: REFERENCE_LOOKUP_ERROR,
        defaultMessage: 'Error while trying to lookup a %s reference'
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
