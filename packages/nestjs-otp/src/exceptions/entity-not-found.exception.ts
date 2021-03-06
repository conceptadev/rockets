import { format } from 'util';
import { ExceptionInterface } from '@concepta/ts-core';

export class EntityNotFoundException
  extends Error
  implements ExceptionInterface
{
  errorCode = 'OTP_ENTITY_NOT_FOUND_ERROR';

  context: {
    entityName: string;
  };

  constructor(
    entityName: string,
    message = 'Entity %s was not registered to be used.',
  ) {
    super(format(message, entityName));
    this.context = {
      entityName,
    };
  }
}
