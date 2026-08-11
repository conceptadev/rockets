import { Logger } from '@nestjs/common';
import { CommandBus } from '@nestjs/cqrs';
import {
  OtpPort,
  PasswordPort,
  RecoveryPolicy,
  type RecoveryNotificationPortSettings,
  type RecoveryService,
  UserPort,
} from '@concepta/nestjs-authentication';
import type {
  AppContextLike,
  AssigneeRelationInterface,
  ReferenceIdInterface,
} from '@concepta/nestjs-core';

/**
 * This class is registered under the upstream `RecoveryService` DI token, so it
 * must stay substitutable for its public surface — otherwise an upstream caller
 * hits `TypeError: not a function` at runtime. `Pick<…, keyof …>` projects only
 * the public members; a plain `implements RecoveryService` cannot work because
 * upstream declares its ports `private`.
 */
type RecoveryServiceContract = Pick<RecoveryService, keyof RecoveryService>;

/** Rockets-owned recovery implementation that never launches detached commands. */
export class RocketsRecoveryService implements RecoveryServiceContract {
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
    const appCtx = ctx ?? {};
    const user = await this.userPort.getByEmail(appCtx, email);
    if (!user) return;
    const Command = this.notifications.sendRecoverLoginNotificationCommand;
    await this.commandBus.execute(new Command(appCtx, email, user.username));
  }

  async recoverPassword(ctx: AppContextLike, email: string): Promise<void> {
    const appCtx = ctx ?? {};
    const user = await this.userPort.getByEmail(appCtx, email);
    if (!user) return;
    const otp = await this.otpPort.create(
      appCtx,
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
      new Command(appCtx, email, otp.passcode, otp.expirationDate),
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
    const appCtx = ctx ?? {};
    const otp = await this.validatePasscode(appCtx, passcode);
    if (!otp) return null;
    const user = await this.userPort.getById(appCtx, otp.assigneeId);
    if (!user) return null;

    await this.passwordPort.setPassword(appCtx, newPassword, user.id);
    // Revoke before notifying: a failed mail must not leave a live passcode.
    await this.otpPort.clear(appCtx, this.policy.otpNamespace, {
      category: this.policy.otpCategory,
      assigneeId: user.id,
    });

    const Command = this.notifications.sendPasswordUpdatedNotificationCommand;
    try {
      await this.commandBus.execute(new Command(appCtx, user.email));
    } catch (error: unknown) {
      this.logger.error('Password-updated recovery notification failed', {
        userId: user.id,
        message: error instanceof Error ? error.message : String(error),
        stack: error instanceof Error ? error.stack : undefined,
      });
    }
    return user;
  }

  async revokeAllUserPasswordRecoveries(
    ctx: AppContextLike,
    email: string,
  ): Promise<void> {
    const appCtx = ctx ?? {};
    const user = await this.userPort.getByEmail(appCtx, email);
    if (!user) return;
    await this.otpPort.clear(appCtx, this.policy.otpNamespace, {
      category: this.policy.otpCategory,
      assigneeId: user.id,
    });
  }
}
