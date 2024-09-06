import { HttpStatus } from '@nestjs/common';
import { RuntimeException } from '@concepta/nestjs-exception';

export class FileIdMissingException extends RuntimeException {
  constructor(message = 'File id is missing.') {
    super({
      message,
      httpStatus: HttpStatus.BAD_REQUEST,
    });

    this.errorCode = 'FILE_ID_MISSING_ERROR';
  }
}
