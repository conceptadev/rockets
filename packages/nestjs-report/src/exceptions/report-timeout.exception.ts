import { HttpStatus } from '@nestjs/common';
import { RuntimeException } from '@concepta/nestjs-exception';

export class ReportTimeoutException extends RuntimeException {
  constructor(message = 'Report generation timed out.') {
    super({
      message,
      httpStatus: HttpStatus.INTERNAL_SERVER_ERROR,
    });

    this.errorCode = 'REPORT_GENERATION_TIMEOUT';
  }
}
