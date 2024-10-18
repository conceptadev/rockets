import {
  RuntimeException,
  RuntimeExceptionOptions,
} from '@concepta/nestjs-exception';

export class AuthApplePublicKeyException extends RuntimeException {
  constructor(options?: RuntimeExceptionOptions) {
    super({
      safeMessage: 'Apple public key was not able to be retrieved.',
      ...options,
    });

    this.errorCode = 'AUTH_APPLE_PUBLIC_KEY_ERROR';
  }
}
