import type { PlainLiteralObject, Type } from '@nestjs/common';
import { Command, CommandBus, QueryBus } from '@nestjs/cqrs';
import { OtpPort, type OtpPortSettings } from '@concepta/nestjs-authentication';
import type { AssigneeRelationInterface } from '@concepta/nestjs-core';

export interface RocketsAuthConsumeOtpCommandInterface
  extends Command<AssigneeRelationInterface | null> {
  readonly ctx: PlainLiteralObject;
  readonly namespace: string;
  readonly otp: Readonly<{ category: string; passcode: string }>;
}

export interface RocketsAuthOtpPortSettings extends OtpPortSettings {
  readonly consumeCommand: Type<RocketsAuthConsumeOtpCommandInterface>;
}

/** Authentication OTP port plus the atomic consume operation recovery needs. */
export class RocketsAuthRecoveryOtpPort extends OtpPort {
  constructor(
    private readonly rocketsSettings: RocketsAuthOtpPortSettings,
    private readonly rocketsCommandBus: CommandBus,
    queryBus: QueryBus,
  ) {
    super(rocketsSettings, rocketsCommandBus, queryBus);
  }

  consume(
    ctx: PlainLiteralObject,
    namespace: string,
    otp: Readonly<{ category: string; passcode: string }>,
  ): Promise<AssigneeRelationInterface | null> {
    const CommandClass = this.rocketsSettings.consumeCommand;
    return this.rocketsCommandBus.execute(
      new CommandClass(ctx, namespace, otp),
    );
  }
}
