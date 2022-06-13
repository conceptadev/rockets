import { format } from 'util';
import { ExceptionInterface, NotAnErrorException } from '@concepta/ts-core';

export class ReferenceLookupException
  extends Error
  implements ExceptionInterface
{
  errorCode = 'REFERENCE_LOOKUP_ERROR';

  context: {
    entityName: string;
    originalError: Error;
  };

  constructor(
    entityName: string,
    originalError: unknown,
    message = 'Error while trying to lookup a %s reference',
  ) {
    super(format(message, entityName));
    this.context = {
      entityName,
      originalError:
        originalError instanceof Error
          ? originalError
          : new NotAnErrorException(originalError),
    };
  }
}
