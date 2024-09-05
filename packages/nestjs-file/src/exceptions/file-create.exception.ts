import { HttpStatus } from '@nestjs/common';
import { RuntimeException } from '@concepta/nestjs-exception';

export class FileCreateException extends RuntimeException {
  context: RuntimeException['context'] & {
    originalError: Error;
  };

  constructor(
    originalError: Error,
    message = 'Error while trying to create a file',
  ) {
    super({
      message,
      originalError,
      httpStatus: HttpStatus.INTERNAL_SERVER_ERROR,
    });

    this.errorCode = 'FILE_CREATE_ERROR';

    this.context = {
      ...super.context,
      originalError,
    };
  }
}
