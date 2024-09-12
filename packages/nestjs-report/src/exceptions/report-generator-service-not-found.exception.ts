import { HttpStatus } from '@nestjs/common';
import { RuntimeException } from '@concepta/nestjs-exception';

export class ReportGeneratorServiceNotFoundException extends RuntimeException {
  context: RuntimeException['context'] & {
    generatorServiceName: string;
  };

  constructor(
    assignmentName: string,
    message = 'Report generator service %s was not registered to be used.',
  ) {
    super({
      message,
      messageParams: [assignmentName],
      httpStatus: HttpStatus.NOT_FOUND,
    });

    this.errorCode = 'REPORT_GENERATOR_SERVICE_NOT_FOUND_ERROR';

    this.context = {
      ...super.context,
      generatorServiceName: assignmentName,
    };
  }
}
