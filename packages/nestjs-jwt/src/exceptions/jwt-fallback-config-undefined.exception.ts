import { RuntimeExceptionOptions } from '@concepta/nestjs-common';
import { JwtException } from './jwt.exception';

export class JwtFallbackConfigUndefinedException extends JwtException {
  constructor(options?: RuntimeExceptionOptions) {
    super({
      message: 'Fallback options is not defined',
      ...options,
    });
    this.errorCode = 'JWT_FALLBACK_CONFIG_UNDEFINED';
  }
}
