import { RuntimeException } from '@concepta/nestjs-exception';
import { HttpStatus } from '@nestjs/common';
import { CacheException } from './cache.exception';

export class CacheAssignmentNotFoundException extends CacheException {
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
