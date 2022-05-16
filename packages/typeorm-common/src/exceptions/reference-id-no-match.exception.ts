import { format } from 'util';
import { ReferenceId, ExceptionInterface } from '@concepta/ts-core';

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
    super(format(message, entityName, id));
    this.context = {
      entityName,
      id,
    };
  }
}
