import { HttpStatus } from '@nestjs/common';
import { RuntimeException, RuntimeExceptionOptions } from '@concepta/nestjs-exception';

export class FileQueryException extends RuntimeException {
  constructor(options?: RuntimeExceptionOptions) {
    super({
      message: 'Error while trying to do a query to file',
      httpStatus: HttpStatus.INTERNAL_SERVER_ERROR,
      ...options,
    });

    this.errorCode = 'FILE_QUERY_ERROR';
  }
}
