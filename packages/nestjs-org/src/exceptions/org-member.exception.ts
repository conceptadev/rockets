import { RuntimeExceptionOptions } from '@concepta/nestjs-exception';
import { OrgException } from './org.exception';
import { HttpStatus } from '@nestjs/common';

export class OrgMemberException extends OrgException {
  constructor(options?: RuntimeExceptionOptions) {
    super({
      safeMessage: 'Org member exception',
      httpStatus: HttpStatus.BAD_REQUEST,
      ...options,
    });
    this.errorCode = 'ORG_MEMBER_ERROR';
  }
}
