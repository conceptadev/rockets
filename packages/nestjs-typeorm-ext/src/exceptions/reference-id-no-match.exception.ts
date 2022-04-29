import { ReferenceId } from '@concepta/nestjs-common';
import { ExceptionInterface, formatMessage } from '@concepta/nestjs-exception';

export class ReferenceIdNoMatchException
  extends Error
  implements ExceptionInterface
{
  errorCode = 'REFERENCE_ID_NO_MATCH';

  context: {
    entityName: string;
    id: ReferenceId;
  };

  constructor(
    entityName: string,
    id: ReferenceId,
    message = 'No match for %s reference id %s.',
  ) {
    super(formatMessage(message, entityName, id));
    this.context.entityName = entityName;
    this.context.id = id;
  }
}
