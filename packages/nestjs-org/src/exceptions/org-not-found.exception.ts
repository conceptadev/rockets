import { RuntimeExceptionOptions } from '@concepta/nestjs-exception';
import { OrgException } from './org.exception';

export class OrgNotFoundException extends OrgException {
  constructor(options?: RuntimeExceptionOptions) {
    super({
      message: 'The org was not found',
      ...options,
    });

    this.errorCode = 'ORG_NOT_FOUND_ERROR';
  }
}
