import { RuntimeExceptionOptions } from '@concepta/nestjs-exception';
import { OrgException } from './org.exception';

export class OrgMemberException extends OrgException {
  constructor(options?: RuntimeExceptionOptions) {
    super(options);
    this.errorCode = 'ORG_MEMBER_ERROR';
  }
}
