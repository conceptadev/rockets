import { RuntimeExceptionOptions } from '@concepta/nestjs-exception';
import { HttpStatus } from '@nestjs/common';
import { ReportException } from './report.exception';

export class ReportQueryException extends ReportException {
  constructor(options?: RuntimeExceptionOptions) {
    super({
      message: 'Error while trying to do a query to report',
      httpStatus: HttpStatus.INTERNAL_SERVER_ERROR,
      ...options,
    });

    this.errorCode = 'REPORT_QUERY_ERROR';
  }
}
