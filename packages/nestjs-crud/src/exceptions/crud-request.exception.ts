import { HttpStatus } from '@nestjs/common';
import { RuntimeExceptionOptions } from '@concepta/nestjs-common';
import { CrudException } from './crud.exception';
/**
 * Generic crud exception.
 */
export class CrudRequestException extends CrudException {
  constructor(options?: RuntimeExceptionOptions) {
    super({
      safeMessage: 'Error on crud request',
      httpStatus: HttpStatus.BAD_REQUEST,
      ...options,
    });
    this.errorCode = 'CRUD_REQUEST_ERROR';
  }
}
