import { HttpStatus } from '@nestjs/common';
import { RuntimeException } from '@concepta/nestjs-exception';

export class FileCreateException extends RuntimeException {
  constructor(
    message = 'Error while trying to create a file',
    originalError: unknown,
  ) {
    super({
      message,
      originalError,
      httpStatus: HttpStatus.INTERNAL_SERVER_ERROR,
    });

    this.errorCode = 'FILE_CREATE_ERROR';
  }
}
