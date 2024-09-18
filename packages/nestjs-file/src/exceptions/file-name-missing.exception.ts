import { HttpStatus } from '@nestjs/common';
import {
  RuntimeException,
  RuntimeExceptionOptions,
} from '@concepta/nestjs-exception';

export class FilenameMissingException extends RuntimeException {
  constructor(options?: RuntimeExceptionOptions) {
    super({
      message: 'Filename is missing.',
      httpStatus: HttpStatus.BAD_REQUEST,
      ...options,
    });

    this.errorCode = 'FILENAME_MISSING_ERROR';
  }
}
