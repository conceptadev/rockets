import {
  RuntimeException,
  RuntimeExceptionOptions,
} from '@concepta/nestjs-exception';
import { HttpStatus } from '@nestjs/common';

export class AssignmentNotFoundException extends RuntimeException {
  context: RuntimeException['context'] & { assignmentName: string };

  constructor(assignmentName: string, options?: RuntimeExceptionOptions) {
    super({
      message: 'Assignment %s was not registered to be used.',
      messageParams: [assignmentName],
      httpStatus: HttpStatus.NOT_FOUND,
      ...options,
    });

    this.errorCode = 'ROLE_ASSIGNMENT_NOT_FOUND_ERROR';

    this.context = {
      ...super.context,
      assignmentName,
    };
  }
}
