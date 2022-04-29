import { ExceptionInterface, formatMessage } from '@concepta/nestjs-exception';

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
    originalError: Error,
    message = 'Error while trying to lookup a %s reference',
  ) {
    super(formatMessage(message, entityName));
    this.context.entityName = entityName;
    this.context.originalError = originalError;
  }
}
