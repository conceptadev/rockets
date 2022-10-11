import { ExceptionInterface } from '@concepta/ts-core';

export class OrgMemberException extends Error implements ExceptionInterface {
  errorCode = 'ORG_MEMBER_ERROR';

  constructor(message: string) {
    super(message);
  }
}
