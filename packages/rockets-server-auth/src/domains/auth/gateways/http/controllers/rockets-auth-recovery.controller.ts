import {
  AuthPublic,
  RecoveryOtpInvalidException,
  RecoveryRecoverLoginDto,
  RecoveryRecoverPasswordDto,
  RecoveryUpdatePasswordDto,
  RecoveryValidatePasscodeDto,
  RecoveryService,
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
  UseGuards,
} from '@nestjs/common';
import { Throttle } from '@nestjs/throttler';

import { AuthAccountThrottlerGuard } from '../guards/auth-account-throttler.guard';
import {
  ApiBadRequestResponse,
  ApiBody,
  ApiOkResponse,
  ApiOperation,
  ApiTags,
} from '@nestjs/swagger';
import { getAppContext } from '@concepta/rockets-core';
import type { Request } from 'express';

/** Public, enumeration-safe account recovery endpoints. */
@Controller('recovery')
@AuthPublic({ classLevel: true })
@UseGuards(AuthAccountThrottlerGuard)
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
  @ApiBody({ type: RecoveryRecoverLoginDto })
  @ApiOkResponse({
    description:
      'The request was accepted, whether or not the email belongs to an account.',
  })
  @ApiBadRequestResponse({ description: 'Invalid email format' })
  recoverLogin(
    @Body() dto: RecoveryRecoverLoginDto,
    @Req() req: Request,
  ): void {
    const ctx = getAppContext(req);
    this.dispatchEnumerationSafe('login', () =>
      this.recoveryService.recoverLogin(ctx, dto.email),
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
  @ApiBody({ type: RecoveryRecoverPasswordDto })
  @ApiOkResponse({
    description:
      'The request was accepted, whether or not the email belongs to an account.',
  })
  @ApiBadRequestResponse({ description: 'Invalid email format' })
  recoverPassword(
    @Body() dto: RecoveryRecoverPasswordDto,
    @Req() req: Request,
  ): void {
    const ctx = getAppContext(req);
    this.dispatchEnumerationSafe('password', () =>
      this.recoveryService.recoverPassword(ctx, dto.email),
    );
  }

  @Post('passcode')
  @HttpCode(200)
  @Throttle({ default: { limit: 10, ttl: 60000 } })
  @ApiOperation({
    summary: 'Validate recovery passcode',
    description: 'Checks whether a recovery code is valid and unexpired.',
  })
  @ApiBody({ type: RecoveryValidatePasscodeDto })
  @ApiOkResponse({ description: 'Passcode is valid' })
  @ApiBadRequestResponse({ description: 'Passcode is invalid or expired' })
  async validatePasscode(
    @Body() dto: RecoveryValidatePasscodeDto,
    @Req() req: Request,
  ): Promise<void> {
    const ctx = getAppContext(req);
    const otp = await this.recoveryService.validatePasscode(ctx, dto.passcode);
    if (!otp) throw new RecoveryOtpInvalidException();
  }

  @Patch('password')
  @HttpCode(200)
  @Throttle({ default: { limit: 5, ttl: 60000 } })
  @ApiOperation({
    summary: 'Reset password',
    description: 'Updates an account password using a valid recovery code.',
  })
  @ApiBody({ type: RecoveryUpdatePasswordDto })
  @ApiOkResponse({ description: 'Password updated successfully' })
  @ApiBadRequestResponse({
    description: 'Passcode is invalid or expired, or password is invalid',
  })
  async updatePassword(
    @Body() dto: RecoveryUpdatePasswordDto,
    @Req() req: Request,
  ): Promise<void> {
    const ctx = getAppContext(req);
    const user = await this.recoveryService.updatePassword(
      ctx,
      dto.passcode,
      dto.newPassword,
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
