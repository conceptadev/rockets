import { Strategy as PassportStrategy } from 'passport-strategy';
import { Strategy, VerifyCallback } from 'passport-jwt';
import { NotAnErrorException } from '@concepta/ts-core';
import { JwtStrategyOptionsInterface } from './interfaces/jwt-strategy-options.interface';
import { JwtVerifyException } from './exceptions/jwt-verify.exception';

export class JwtStrategy extends PassportStrategy {
  constructor(
    private options: JwtStrategyOptionsInterface,
    private verify: VerifyCallback,
  ) {
    super();

    this.options = options;
    this.verify = verify;
  }

  authenticate(...args: Parameters<Strategy['authenticate']>) {
    const [req] = args;

    const rawToken = this.options.jwtFromRequest(req);

    if (!rawToken) {
      return this.fail('Missing authorization token', 401);
    }

    try {
      return this.options.verifyToken(
        rawToken,
        this.verifyTokenCallback.bind(this),
      );
    } catch (e) {
      const exception = new JwtVerifyException({
        originalError: e,
      });
      return this.error(exception);
    }
  }

  private verifyTokenCallback(e?: Error, decodedToken?: unknown) {
    // TODO: configure JWT module to use different access and refresh secrets

    if (e) {
      return this.error(e);
    }

    try {
      return this.verify(decodedToken, this.isVerifiedCallback.bind(this));
    } catch (e) {
      const exception = e instanceof Error ? e : new NotAnErrorException(e);
      return this.error(exception);
    }
  }

  private isVerifiedCallback(
    error: Error | null,
    user: unknown,
    info: unknown,
  ) {
    if (error) {
      return this.error(error);
    } else if (!user) {
      return this.fail(info, 401);
    } else {
      return this.success(user, info);
    }
  }
}
