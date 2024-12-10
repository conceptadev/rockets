import {
  RuntimeException,
  RuntimeExceptionOptions,
} from '@concepta/nestjs-exception';
import { HttpStatus } from '@nestjs/common';
import { ReportException } from './report.exception';

export class ReportGeneratorServiceNotFoundException extends ReportException {
  context: RuntimeException['context'] & {
    generatorServiceName: string;
  };

  constructor(generatorServiceName: string, options?: RuntimeExceptionOptions) {
    super({
      message: 'Report generator service %s was not registered to be used.',
      messageParams: [generatorServiceName],
      httpStatus: HttpStatus.NOT_FOUND,
      ...options,
    });

    this.errorCode = 'REPORT_GENERATOR_SERVICE_NOT_FOUND_ERROR';

    this.context = {
      ...super.context,
      generatorServiceName,
    };
  }
}
