import {
  RuntimeException,
  RuntimeExceptionOptions,
} from '@concepta/nestjs-exception';

export class OrgNotFoundException extends RuntimeException {
  constructor(options?: RuntimeExceptionOptions) {
    super({
      message: 'The org was not found',
      ...options,
    });

    this.errorCode = 'ORG_NOT_FOUND_ERROR';
  }
}
