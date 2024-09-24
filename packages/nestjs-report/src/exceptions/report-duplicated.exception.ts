import { HttpStatus } from '@nestjs/common';
import {
  RuntimeException,
  RuntimeExceptionOptions,
} from '@concepta/nestjs-exception';

export class ReportDuplicateEntryException extends RuntimeException {
  context: RuntimeException['context'] & {
    serviceKey: string;
    reportName: string;
  };

  constructor(
    serviceKey: string,
    reportName: string,
    options?: RuntimeExceptionOptions,
  ) {
    super({
      message: 'Duplicate entry detected for service %s with report %s',
      httpStatus: HttpStatus.CONFLICT,
      messageParams: [serviceKey, reportName],
      ...options,
    });

    this.errorCode = 'REPORT_DUPLICATE_ENTRY_ERROR';

    this.context = {
      ...super.context,
      serviceKey,
      reportName,
    };
  }
}
