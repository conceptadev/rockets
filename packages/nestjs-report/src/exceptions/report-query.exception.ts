import { HttpStatus } from '@nestjs/common';
import {
  RuntimeException,
  RuntimeExceptionOptions,
} from '@concepta/nestjs-exception';

export class ReportQueryException extends RuntimeException {
  constructor(options?: RuntimeExceptionOptions) {
    super({
      message: 'Error while trying to do a query to report',
      httpStatus: HttpStatus.INTERNAL_SERVER_ERROR,
      ...options,
    });

    this.errorCode = 'REPORT_QUERY_ERROR';
  }
}
