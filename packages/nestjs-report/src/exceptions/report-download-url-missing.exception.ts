import { RuntimeExceptionOptions } from '@concepta/nestjs-exception';
import { HttpStatus } from '@nestjs/common';
import { ReportException } from './report.exception';

export class ReportDownloadUrlMissingException extends ReportException {
  constructor(options?: RuntimeExceptionOptions) {
    super({
      message: 'Error trying to generate signed download url',
      httpStatus: HttpStatus.BAD_REQUEST,
      ...options,
    });

    this.errorCode = 'REPORT_DOWNLOAD_URL_ERROR';
  }
}
