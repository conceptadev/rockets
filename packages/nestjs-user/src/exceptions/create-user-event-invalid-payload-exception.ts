import { ExceptionInterface } from '@concepta/ts-core';

export class CreateUserEventInvalidPayloadException
  extends Error
  implements ExceptionInterface
{
  errorCode = 'INVALID_EVENT_PAYLOAD_ERROR';

  constructor(
    message = 'The event payload received has invalid content. The payload must have "userId" and "newPassword"',
  ) {
    super(message);
  }
}
