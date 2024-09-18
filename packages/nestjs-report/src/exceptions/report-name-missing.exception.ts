import { HttpStatus } from '@nestjs/common';
import {
  RuntimeException,
  RuntimeExceptionOptions,
} from '@concepta/nestjs-exception';

export class ReportnameMissingException extends RuntimeException {
  constructor(options?: RuntimeExceptionOptions) {
    super({
      message: 'Reportname is missing.',
      httpStatus: HttpStatus.BAD_REQUEST,
      ...options,
    });

    this.errorCode = 'REPORTNAME_MISSING_ERROR';
  }
}
