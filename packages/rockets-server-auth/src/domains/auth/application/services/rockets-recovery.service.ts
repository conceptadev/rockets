import { Logger } from '@nestjs/common';
import { CommandBus } from '@nestjs/cqrs';
import {
  OtpPort,
  PasswordPort,
  RecoveryPolicy,
  type RecoveryNotificationPortSettings,
  UserPort,
} from '@concepta/nestjs-authentication';
import type {
  AppContextLike,
  AssigneeRelationInterface,
  ReferenceIdInterface,
} from '@concepta/nestjs-core';

/** Rockets-owned recovery implementation that never launches detached commands. */
export class RocketsRecoveryService {
  private readonly logger = new Logger(RocketsRecoveryService.name);

  constructor(
    private readonly policy: RecoveryPolicy,
    private readonly otpPort: OtpPort,
    private readonly userPort: UserPort,
    private readonly passwordPort: PasswordPort,
    private readonly notifications: RecoveryNotificationPortSettings,
    private readonly commandBus: CommandBus,
  ) {}

  async recoverLogin(ctx: AppContextLike, email: string): Promise<void> {
    const user = await this.userPort.getByEmail(ctx ?? {}, email);
    if (!user) return;
    const Command = this.notifications.sendRecoverLoginNotificationCommand;
    await this.commandBus.execute(new Command(ctx, email, user.username));
  }

  async recoverPassword(ctx: AppContextLike, email: string): Promise<void> {
    const user = await this.userPort.getByEmail(ctx ?? {}, email);
    if (!user) return;
    const otp = await this.otpPort.create(
      ctx ?? {},
      this.policy.otpNamespace,
      {
        category: this.policy.otpCategory,
        type: this.policy.otpType,
        expiresIn: this.policy.otpExpiresIn,
        assigneeId: user.id,
        rateSeconds: this.policy.otpRateSeconds,
        rateThreshold: this.policy.otpRateThreshold,
      },
      {
        duplicateStrategy: this.policy.otpDuplicateStrategy,
        rateSeconds: this.policy.otpRateSeconds,
        rateThreshold: this.policy.otpRateThreshold,
      },
    );
    const Command = this.notifications.sendRecoverPasswordNotificationCommand;
    await this.commandBus.execute(
      new Command(ctx, email, otp.passcode, otp.expirationDate),
    );
  }

  validatePasscode(
    ctx: AppContextLike,
    passcode: string,
  ): Promise<AssigneeRelationInterface | null> {
    return this.otpPort.validate(ctx ?? {}, this.policy.otpNamespace, {
      category: this.policy.otpCategory,
      passcode,
    });
  }

  async updatePassword(
    ctx: AppContextLike,
    passcode: string,
    newPassword: string,
  ): Promise<ReferenceIdInterface | null> {
    const otp = await this.validatePasscode(ctx, passcode);
    if (!otp) return null;
    const user = await this.userPort.getById(ctx ?? {}, otp.assigneeId);
    if (!user) return null;

    await this.passwordPort.setPassword(ctx ?? {}, newPassword, user.id);
    await this.otpPort.clear(ctx ?? {}, this.policy.otpNamespace, {
      category: this.policy.otpCategory,
      assigneeId: user.id,
    });

    const Command = this.notifications.sendPasswordUpdatedNotificationCommand;
    try {
      await this.commandBus.execute(new Command(ctx, user.email));
    } catch {
      this.logger.error('Password-updated recovery notification failed');
    }
    return user;
  }

  async revokeAllUserPasswordRecoveries(
    ctx: AppContextLike,
    email: string,
  ): Promise<void> {
    const user = await this.userPort.getByEmail(ctx ?? {}, email);
    if (!user) return;
    await this.otpPort.clear(ctx ?? {}, this.policy.otpNamespace, {
      category: this.policy.otpCategory,
      assigneeId: user.id,
    });
  }
}
