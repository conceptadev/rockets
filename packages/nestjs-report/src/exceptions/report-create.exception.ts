import {
  RuntimeException,
  RuntimeExceptionOptions,
} from '@concepta/nestjs-exception';

export class ReportCreateException extends RuntimeException {
  constructor(options?: RuntimeExceptionOptions) {
    super({
      message: 'Error while trying to create a report',
      ...options,
    });

    this.errorCode = 'REPORT_CREATE_ERROR';
  }
}
