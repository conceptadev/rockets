import {
  AuthPublic,
  RecoveryOtpInvalidException,
  RecoveryService,
  recoveryRecoverLoginSchema,
  recoveryRecoverPasswordSchema,
  recoveryUpdatePasswordSchema,
  recoveryValidatePasscodeSchema,
} from '@concepta/nestjs-authentication';
import {
  Body,
  Controller,
  HttpCode,
  Inject,
  Logger,
  Patch,
  Post,
  Req,
  StandardSchemaValidationPipe,
  UseGuards,
  UsePipes,
} from '@nestjs/common';
import { Throttle } from '@nestjs/throttler';

import { AuthAccountThrottlerGuard } from '../guards/auth-account-throttler.guard';
import {
  ApiBadRequestResponse,
  ApiOkResponse,
  ApiOperation,
  ApiTags,
} from '@nestjs/swagger';
import { getAppContext, rocketsSchemaValidation } from '@concepta/rockets-core';
import type { Request } from 'express';
import type { z } from 'zod';

type RecoverLoginBody = z.output<typeof recoveryRecoverLoginSchema>;
type RecoverPasswordBody = z.output<typeof recoveryRecoverPasswordSchema>;
type ValidatePasscodeBody = z.output<typeof recoveryValidatePasscodeSchema>;
type UpdatePasswordBody = z.output<typeof recoveryUpdatePasswordSchema>;

/** Public, enumeration-safe account recovery endpoints. */
@Controller('recovery')
@AuthPublic({ classLevel: true })
@UseGuards(AuthAccountThrottlerGuard)
@UsePipes(new StandardSchemaValidationPipe(rocketsSchemaValidation))
@ApiTags('Authentication')
export class RocketsAuthRecoveryController {
  private readonly logger = new Logger(RocketsAuthRecoveryController.name);

  constructor(
    @Inject(RecoveryService)
    private readonly recoveryService: RecoveryService,
  ) {}

  @Post('login')
  @HttpCode(200)
  @Throttle({ default: { limit: 5, ttl: 60000 } })
  @ApiOperation({
    summary: 'Recover username',
    description:
      'Sends the username associated with an email address when an account exists.',
  })
  @ApiOkResponse({
    description:
      'The request was accepted, whether or not the email belongs to an account.',
  })
  @ApiBadRequestResponse({ description: 'Invalid email format' })
  recoverLogin(
    @Body({ schema: recoveryRecoverLoginSchema }) body: RecoverLoginBody,
    @Req() req: Request,
  ): void {
    const ctx = getAppContext(req);
    this.dispatchEnumerationSafe('login', () =>
      this.recoveryService.recoverLogin(ctx, body.email),
    );
  }

  @Post('password')
  @HttpCode(200)
  @Throttle({ default: { limit: 5, ttl: 60000 } })
  @ApiOperation({
    summary: 'Request password reset',
    description:
      'Sends a password-recovery code when the supplied account exists.',
  })
  @ApiOkResponse({
    description:
      'The request was accepted, whether or not the email belongs to an account.',
  })
  @ApiBadRequestResponse({ description: 'Invalid email format' })
  recoverPassword(
    @Body({ schema: recoveryRecoverPasswordSchema }) body: RecoverPasswordBody,
    @Req() req: Request,
  ): void {
    const ctx = getAppContext(req);
    this.dispatchEnumerationSafe('password', () =>
      this.recoveryService.recoverPassword(ctx, body.email),
    );
  }

  @Post('passcode')
  @HttpCode(200)
  @Throttle({ default: { limit: 10, ttl: 60000 } })
  @ApiOperation({
    summary: 'Validate recovery passcode',
    description: 'Checks whether a recovery code is valid and unexpired.',
  })
  @ApiOkResponse({ description: 'Passcode is valid' })
  @ApiBadRequestResponse({ description: 'Passcode is invalid or expired' })
  async validatePasscode(
    @Body({ schema: recoveryValidatePasscodeSchema })
    body: ValidatePasscodeBody,
    @Req() req: Request,
  ): Promise<void> {
    const ctx = getAppContext(req);
    const otp = await this.recoveryService.validatePasscode(ctx, body.passcode);
    if (!otp) throw new RecoveryOtpInvalidException();
  }

  @Patch('password')
  @HttpCode(200)
  @Throttle({ default: { limit: 5, ttl: 60000 } })
  @ApiOperation({
    summary: 'Reset password',
    description: 'Updates an account password using a valid recovery code.',
  })
  @ApiOkResponse({ description: 'Password updated successfully' })
  @ApiBadRequestResponse({
    description: 'Passcode is invalid or expired, or password is invalid',
  })
  async updatePassword(
    @Body({ schema: recoveryUpdatePasswordSchema }) body: UpdatePasswordBody,
    @Req() req: Request,
  ): Promise<void> {
    const ctx = getAppContext(req);
    const user = await this.recoveryService.updatePassword(
      ctx,
      body.passcode,
      body.newPassword,
    );
    if (!user) throw new RecoveryOtpInvalidException();
  }

  /**
   * Respond before the work runs: known and unknown accounts cost the same
   * wall-clock time, and a slow mail provider cannot slow the endpoint.
   * Failures are logged with their cause and never surfaced to the caller.
   */
  private dispatchEnumerationSafe(
    operation: 'login' | 'password',
    work: () => Promise<void>,
  ): void {
    void work().catch((error: unknown) => {
      this.logger.error(`Account ${operation} recovery dispatch failed`, {
        operation,
        message: error instanceof Error ? error.message : String(error),
        stack: error instanceof Error ? error.stack : undefined,
      });
    });
  }
}
