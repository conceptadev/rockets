import { HttpStatus } from '@nestjs/common';
import { RuntimeException } from '@concepta/nestjs-exception';

export class CacheAssignmentNotFoundException extends RuntimeException {
  context: RuntimeException['context'] & {
    assignmentName: string;
  };

  constructor(
    assignmentName: string,
    message = 'Assignment %s was not registered to be used.',
  ) {
    super({
      message,
      messageParams: [assignmentName],
      httpStatus: HttpStatus.NOT_FOUND,
    });

    this.errorCode = 'CACHE_ASSIGNMENT_NOT_FOUND_ERROR';

    this.context = {
      ...super.context,
      assignmentName,
    };
  }
}
