import { RuntimeExceptionOptions } from '@concepta/nestjs-exception';
import { HttpStatus } from '@nestjs/common';
import { CrudException } from './crud.exception';
/**
 * Generic crud exception.
 */
export class CrudBadRequestException extends CrudException {
  constructor(options?: RuntimeExceptionOptions) {
    super({
      safeMessage: 'Bad Request',
      httpStatus: HttpStatus.BAD_REQUEST,
      ...options,
    });
    this.errorCode = 'CRUD_BAD_REQUEST_ERROR';
  }
}
