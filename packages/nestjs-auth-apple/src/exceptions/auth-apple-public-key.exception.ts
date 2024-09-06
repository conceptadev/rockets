import { RuntimeException } from '@concepta/nestjs-exception';

export class AuthApplePublicKeyException extends RuntimeException {
  constructor(message = 'Apple public key was not able to be retrieved.') {
    super({
      safeMessage: message,
    });
    this.errorCode = 'AUTH_APPLE_PUBLIC_KEY_ERROR';
  }
}
