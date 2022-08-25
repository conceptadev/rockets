import { ExceptionInterface } from '@concepta/ts-core';

export class UserNotFoundException extends Error implements ExceptionInterface {
  errorCode = 'USER_NOT_FOUND_ERROR';

  constructor(message = 'the request user was not found') {
    super(message);
  }
}
