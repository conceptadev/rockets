import { ExceptionInterface } from '@concepta/ts-core';

export class UserException extends Error implements ExceptionInterface {
  errorCode = 'USER_ERROR';

  constructor(message: string) {
    super(message);
  }
}
