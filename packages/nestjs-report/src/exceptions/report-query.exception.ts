import { HttpStatus } from '@nestjs/common';
import { RuntimeException } from '@concepta/nestjs-exception';

export class ReportQueryException extends RuntimeException {
  constructor(
    message = 'Error while trying to do a query to report',
    originalError?: unknown,
  ) {
    super({
      message,
      originalError,
      httpStatus: HttpStatus.INTERNAL_SERVER_ERROR,
    });

    this.errorCode = 'REPORT_QUERY_ERROR';
  }
}
