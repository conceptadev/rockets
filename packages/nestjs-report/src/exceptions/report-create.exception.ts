import { HttpStatus } from '@nestjs/common';
import { RuntimeException } from '@concepta/nestjs-exception';

export class ReportCreateException extends RuntimeException {
  constructor(
    message = 'Error while trying to create a report',
    originalError: unknown,
  ) {
    super({
      message,
      originalError,
      httpStatus: HttpStatus.INTERNAL_SERVER_ERROR,
    });

    this.errorCode = 'REPORT_CREATE_ERROR';
  }
}
