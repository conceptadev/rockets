import { RuntimeException } from '@concepta/nestjs-exception';
import { HttpStatus } from '@nestjs/common';

export class AssignmentNotFoundException extends RuntimeException {
  constructor(assignmentName: string) {
    super({
      message: 'Assignment %s was not registered to be used.',
      messageParams: [assignmentName],
      httpStatus: HttpStatus.NOT_FOUND,
    });

    this.errorCode = 'ROLE_ASSIGNMENT_NOT_FOUND_ERROR';

    this.context = {
      assignmentName,
    };
  }
}
