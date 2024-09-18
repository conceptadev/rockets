import { HttpStatus } from '@nestjs/common';
import {
  RuntimeException,
  RuntimeExceptionOptions,
} from '@concepta/nestjs-exception';

export class FileUploadUrlMissingException extends RuntimeException {
  constructor(options?: RuntimeExceptionOptions) {
    super({
      message: 'Error trying to generate signed upload url',
      httpStatus: HttpStatus.BAD_REQUEST,
      ...options,
    });

    this.errorCode = 'FILE_UPLOAD_URL_ERROR';
  }
}
