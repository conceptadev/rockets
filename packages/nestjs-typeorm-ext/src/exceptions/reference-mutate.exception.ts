import { ExceptionInterface, formatMessage } from '@concepta/nestjs-exception';

export class ReferenceMutateException
  extends Error
  implements ExceptionInterface
{
  errorCode = 'REFERENCE_MUTATE_ERROR';

  context: {
    entityName: string;
    originalError: Error;
  };

  constructor(
    entityName: string,
    originalError: Error,
    message = 'Error while trying to mutate a %s reference',
  ) {
    super(formatMessage(message, entityName));
    this.context.entityName = entityName;
    this.context.originalError = originalError;
  }
}
