import { RuntimeException } from '@concepta/nestjs-exception';

export class OrgMemberException extends RuntimeException {
  constructor(message: string) {
    super({
      message,
    });
    this.errorCode = 'ORG_MEMBER_ERROR';
  }
}
