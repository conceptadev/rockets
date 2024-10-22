import {
  RuntimeException,
  RuntimeExceptionOptions,
} from '@concepta/nestjs-exception';

export class FileCreateException extends RuntimeException {
  constructor(options?: RuntimeExceptionOptions) {
    super({
      message: 'Error while trying to create a file',
      ...options,
    });

    this.errorCode = 'FILE_CREATE_ERROR';
  }
}
