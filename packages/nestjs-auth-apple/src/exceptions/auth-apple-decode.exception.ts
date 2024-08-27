import { RuntimeException } from '@concepta/nestjs-exception';

export class AuthAppleDecodeException extends RuntimeException {
  constructor(message = 'Apple token was not able to be decoded.') {
    super({
      safeMessage: message,
    });
    this.errorCode = 'AUTH_APPLE_DECODE_ERROR';
  }
}
