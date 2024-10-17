import {
  RuntimeException,
  RuntimeExceptionOptions,
} from '@concepta/nestjs-exception';

export class OrgMemberException extends RuntimeException {
  constructor(
    message: string,
    options?: Omit<RuntimeExceptionOptions, 'message'>,
  ) {
    super({
      message,
      ...options,
    });
    this.errorCode = 'ORG_MEMBER_ERROR';
  }
}
