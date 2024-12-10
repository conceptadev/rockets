import { RuntimeExceptionOptions } from '@concepta/nestjs-exception';
import { HttpStatus } from '@nestjs/common';
import { ReportException } from './report.exception';

export class ReportTimeoutException extends ReportException {
  constructor(options?: RuntimeExceptionOptions) {
    super({
      message: 'Report generation timed out.',
      httpStatus: HttpStatus.INTERNAL_SERVER_ERROR,
      ...options,
    });

    this.errorCode = 'REPORT_GENERATION_TIMEOUT';
  }
}
