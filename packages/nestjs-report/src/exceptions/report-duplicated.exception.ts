import { HttpStatus } from '@nestjs/common';
import { RuntimeException } from '@concepta/nestjs-exception';

export class ReportDuplicateEntryException extends RuntimeException {
  context: RuntimeException['context'] & {
    serviceKey: string;
    reportName: string;
  };

  constructor(
    serviceKey: string,
    reportName: string,
    originalError?: unknown,
    message = 'Duplicate entry detected for service %s with report %s',
  ) {
    super({
      message,
      messageParams: [serviceKey, reportName],
      httpStatus: HttpStatus.CONFLICT,
      originalError,
    });

    this.errorCode = 'REPORT_DUPLICATE_ENTRY_ERROR';

    this.context = {
      ...super.context,
      serviceKey,
      reportName,
    };
  }
}
