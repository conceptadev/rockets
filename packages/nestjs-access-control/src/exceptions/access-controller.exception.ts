import {
  RuntimeException,
  RuntimeExceptionOptions,
} from '@concepta/nestjs-exception';

export class AccessControllerException extends RuntimeException {
  constructor(message: string, options?: RuntimeExceptionOptions) {
    super({
      message,
      ...options,
    });
    this.errorCode = 'ACCESS_CONTROLLER_ERROR';
  }
}
