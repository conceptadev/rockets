import { HttpStatus } from '@nestjs/common';
import {
  RuntimeException,
  RuntimeExceptionOptions,
} from '@concepta/nestjs-exception';

export class ReportTimeoutException extends RuntimeException {
  constructor(options?: RuntimeExceptionOptions) {
    super({
      message: 'Report generation timed out.',
      httpStatus: HttpStatus.INTERNAL_SERVER_ERROR,
      ...options,
    });

    this.errorCode = 'REPORT_GENERATION_TIMEOUT';
  }
}
