import { HttpStatus } from '@nestjs/common';
import { RuntimeException } from '@concepta/nestjs-exception';

export class ReportIdMissingException extends RuntimeException {
  constructor(message = 'Report id is missing.') {
    super({
      message,
      httpStatus: HttpStatus.BAD_REQUEST,
    });

    this.errorCode = 'REPORT_ID_MISSING_ERROR';
  }
}
