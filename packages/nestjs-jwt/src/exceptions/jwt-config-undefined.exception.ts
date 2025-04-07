import { RuntimeExceptionOptions } from '@concepta/nestjs-common';
import { JwtException } from './jwt.exception';

export class JwtConfigUndefinedException extends JwtException {
  constructor(options?: RuntimeExceptionOptions) {
    super({
      message: 'Config options is not defined',
      ...options,
    });
    this.errorCode = 'JWT_CONFIG_UNDEFINED';
  }
}
