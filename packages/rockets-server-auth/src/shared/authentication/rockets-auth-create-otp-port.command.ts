import type { PlainLiteralObject } from '@nestjs/common';
import { Command } from '@nestjs/cqrs';
import type {
  AuthenticationOtpCreatableInterface,
  AuthenticationOtpInterface,
  CreateOtpCommandInterface,
} from '@concepta/nestjs-authentication';

/**
 * Bridges an upstream contract mismatch: authentication expects an `otp`
 * field while `CreateOtpCommand` stores the same payload as `dto`. Remove this
 * command when those contracts align.
 */
export class RocketsAuthCreateOtpPortCommand
  extends Command<AuthenticationOtpInterface>
  implements CreateOtpCommandInterface
{
  readonly ctx: PlainLiteralObject;

  readonly namespace: string;

  readonly otp: AuthenticationOtpCreatableInterface;

  readonly duplicateStrategy?: 'ALLOW' | 'DEACTIVATE';

  readonly rateSeconds?: number;

  readonly rateThreshold?: number;

  constructor(
    ctx: PlainLiteralObject,
    namespace: string,
    otp: AuthenticationOtpCreatableInterface,
    options?: {
      duplicateStrategy?: 'ALLOW' | 'DEACTIVATE';
      rateSeconds?: number;
      rateThreshold?: number;
    },
  ) {
    super();
    this.ctx = ctx;
    this.namespace = namespace;
    this.otp = otp;
    this.duplicateStrategy = options?.duplicateStrategy;
    this.rateSeconds = options?.rateSeconds;
    this.rateThreshold = options?.rateThreshold;
  }
}
