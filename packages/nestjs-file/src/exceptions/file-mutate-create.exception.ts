import { HttpStatus } from '@nestjs/common';
import { RuntimeException } from '@concepta/nestjs-exception';

export class FileMutateCreateUserException extends RuntimeException {
  constructor(
    message = 'Error while trying to create a file for user',
    originalError: unknown,
  ) {
    super({
      message,
      originalError,
      httpStatus: HttpStatus.INTERNAL_SERVER_ERROR,
    });

    this.errorCode = 'FILE_MUTATE_CREATE_USER_ERROR';
  }
}
