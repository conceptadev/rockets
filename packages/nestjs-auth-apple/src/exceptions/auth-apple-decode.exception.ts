import {
  RuntimeException,
  RuntimeExceptionOptions,
} from '@concepta/nestjs-exception';

export class AuthAppleDecodeException extends RuntimeException {
  constructor(options?: RuntimeExceptionOptions) {
    super({
      safeMessage: 'Apple token was not able to be decoded.',
      ...options,
    });

    this.errorCode = 'AUTH_APPLE_DECODE_ERROR';
  }
}
