import { ExceptionInterface } from '@concepta/ts-core';

export class OrgNotFoundException extends Error implements ExceptionInterface {
  errorCode = 'ORG_NOT_FOUND_ERROR';

  constructor(message = 'The org was not found') {
    super(message);
  }
}
