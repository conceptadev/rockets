import { HttpStatus } from '@nestjs/common';
import {
  RuntimeException,
  RuntimeExceptionOptions,
} from '@concepta/nestjs-exception';

export class ReportIdMissingException extends RuntimeException {
  constructor(options?: RuntimeExceptionOptions) {
    super({
      message: 'Report id is missing.',
      httpStatus: HttpStatus.BAD_REQUEST,
      ...options,
    });

    this.errorCode = 'REPORT_ID_MISSING_ERROR';
  }
}
