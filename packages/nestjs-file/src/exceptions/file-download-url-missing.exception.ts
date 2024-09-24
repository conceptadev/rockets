import { HttpStatus } from '@nestjs/common';
import {
  RuntimeException,
  RuntimeExceptionOptions,
} from '@concepta/nestjs-exception';

export class FileDownloadUrlMissingException extends RuntimeException {
  constructor(options?: RuntimeExceptionOptions) {
    super({
      message: 'Error trying to generate signed download url',
      httpStatus: HttpStatus.BAD_REQUEST,
      ...options,
    });

    this.errorCode = 'FILE_DOWNLOAD_URL_ERROR';
  }
}
