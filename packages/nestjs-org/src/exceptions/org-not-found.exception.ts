import { RuntimeExceptionOptions } from '@concepta/nestjs-exception';
import { OrgException } from './org.exception';
import { HttpStatus } from '@nestjs/common';

export class OrgNotFoundException extends OrgException {
  constructor(options?: RuntimeExceptionOptions) {
    super({
      message: 'The org was not found',
      httpStatus: HttpStatus.NOT_FOUND,
      ...options,
    });

    this.errorCode = 'ORG_NOT_FOUND_ERROR';
  }
}
