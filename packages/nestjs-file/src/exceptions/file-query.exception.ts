import { HttpStatus } from '@nestjs/common';
import { RuntimeException } from '@concepta/nestjs-exception';

export class FileQueryException extends RuntimeException {
  constructor(message = 'Error while trying to do a query to file') {
    super({
      message,
      httpStatus: HttpStatus.INTERNAL_SERVER_ERROR,
    });

    this.errorCode = 'FILE_QUERY_ERROR';
  }
}
