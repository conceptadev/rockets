import {
  RuntimeException,
  RuntimeExceptionOptions,
} from '@concepta/nestjs-exception';
import { HttpStatus } from '@nestjs/common';
/**
 * Generic crud exception.
 */
export class CrudBadRequestException extends RuntimeException {
  constructor(options?: RuntimeExceptionOptions) {
    super({
      httpStatus: HttpStatus.BAD_REQUEST,
      ...options,
    });
    this.errorCode = 'CRUD_BAD_REQUEST_ERROR';
  }
}
