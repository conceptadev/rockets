import {
  AuthPublic,
  RecoveryOtpInvalidException,
  RecoveryRecoverLoginDto,
  RecoveryRecoverPasswordDto,
  RecoveryService,
  RecoveryUpdatePasswordDto,
} from '@concepta/nestjs-authentication';
import {
  Body,
  Controller,
  Get,
  HttpCode,
  Inject,
  Logger,
  Param,
  Patch,
  Post,
} from '@nestjs/common';
import { Throttle } from '@nestjs/throttler';
import {
  ApiBadRequestResponse,
  ApiBody,
  ApiOkResponse,
  ApiOperation,
  ApiParam,
  ApiTags,
} from '@nestjs/swagger';

/** Public, enumeration-safe account recovery endpoints. */
@Controller('recovery')
@AuthPublic({ classLevel: true })
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
  async recoverLogin(@Body() dto: RecoveryRecoverLoginDto): Promise<void> {
    await this.runEnumerationSafe('login', () =>
      this.recoveryService.recoverLogin({}, dto.email),
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
  async recoverPassword(
    @Body() dto: RecoveryRecoverPasswordDto,
  ): Promise<void> {
    await this.runEnumerationSafe('password', () =>
      this.recoveryService.recoverPassword({}, dto.email),
    );
  }

  @Get('passcode/:passcode')
  @HttpCode(200)
  @Throttle({ default: { limit: 10, ttl: 60000 } })
  @ApiOperation({
    summary: 'Validate recovery passcode',
    description: 'Checks whether a recovery code is valid and unexpired.',
  })
  @ApiParam({ name: 'passcode', description: 'Recovery passcode' })
  @ApiOkResponse({ description: 'Passcode is valid' })
  @ApiBadRequestResponse({ description: 'Passcode is invalid or expired' })
  async validatePasscode(@Param('passcode') passcode: string): Promise<void> {
    const otp = await this.recoveryService.validatePasscode({}, passcode);
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
  async updatePassword(@Body() dto: RecoveryUpdatePasswordDto): Promise<void> {
    const user = await this.recoveryService.updatePassword(
      {},
      dto.passcode,
      dto.newPassword,
    );
    if (!user) throw new RecoveryOtpInvalidException();
  }

  private async runEnumerationSafe(
    operation: 'login' | 'password',
    work: () => Promise<void>,
  ): Promise<void> {
    try {
      await work();
    } catch (error) {
      const detail = error instanceof Error ? error.stack : String(error);
      this.logger.error(`Account ${operation} recovery failed`, detail);
      // A uniform success response prevents account-existence disclosure.
    }
  }
}
