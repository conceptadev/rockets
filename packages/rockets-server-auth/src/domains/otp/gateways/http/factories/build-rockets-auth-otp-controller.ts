import {
  Body,
  Controller,
  Patch,
  Post,
  Req,
  UnauthorizedException,
  UseGuards,
} from '@nestjs/common';
import type { Type } from '@nestjs/common';
import { CommandBus } from '@nestjs/cqrs';
import { Throttle } from '@nestjs/throttler';
import {
  ApiBadRequestResponse,
  ApiBody,
  ApiOkResponse,
  ApiOperation,
  ApiTags,
  ApiUnauthorizedResponse,
} from '@nestjs/swagger';
import {
  AuthPublic,
  IssueAuthenticatedResponseCommand,
  authenticationResponseSchema,
  type AuthenticatedResponseInterface,
} from '@concepta/nestjs-authentication';
import { OtpException } from '@concepta/nestjs-otp';
import { getAppContext } from '@concepta/rockets-core';
import type { Request } from 'express';

import { RocketsAuthOtpConfirmDto } from '../../../infrastructure/dto/rockets-auth-otp-confirm.dto';
import { RocketsAuthOtpSendDto } from '../../../infrastructure/dto/rockets-auth-otp-send.dto';
import { RocketsAuthOtpService } from '../../../infrastructure/services/rockets-auth-otp.service';
import type { OtpControllerExtras } from '../../../interfaces/otp-controller-extras.interface';
import { applyControllerExtras } from '../../../../../shared/utils/apply-controller-extras.helper';
import { AuthAccountThrottlerGuard } from '../../../../auth/gateways/http/guards/auth-account-throttler.guard';

/** Build the OTP controller and apply consumer-supplied decorators. */
export function buildRocketsAuthOtpController(
  extras: OtpControllerExtras = {},
): Type<unknown> {
  @Controller('otp')
  @AuthPublic({ classLevel: true })
  @UseGuards(AuthAccountThrottlerGuard)
  @ApiTags('Authentication')
  class RocketsAuthOtpController {
    constructor(
      private readonly commandBus: CommandBus,
      private readonly otpService: RocketsAuthOtpService,
    ) {}

    @ApiOperation({
      summary: 'Send OTP to the provided email',
      description:
        'Generates a one-time passcode and sends it to the specified email address',
    })
    @ApiBody({
      type: RocketsAuthOtpSendDto,
      description: 'Email to receive the OTP',
      examples: {
        standard: {
          value: { email: 'user@example.com' },
          summary: 'Standard OTP request',
        },
      },
    })
    @ApiOkResponse({ description: 'OTP sent successfully' })
    @ApiBadRequestResponse({ description: 'Invalid email format' })
    @Throttle({ default: { limit: 3, ttl: 60000 } })
    @Post()
    async sendOtp(
      @Body() dto: RocketsAuthOtpSendDto,
      @Req() req: Request,
    ): Promise<void> {
      const ctx = getAppContext(req);
      return this.otpService.sendOtp(ctx, dto.email);
    }

    @ApiOperation({
      summary: 'Confirm OTP for a given email and passcode',
      description:
        'Validates the OTP passcode for the specified email and returns authentication tokens on success',
    })
    @ApiBody({
      type: RocketsAuthOtpConfirmDto,
      description: 'Email and passcode for OTP verification',
      examples: {
        standard: {
          value: { email: 'user@example.com', passcode: '123456' },
          summary: 'Standard OTP confirmation',
        },
      },
    })
    @ApiOkResponse({
      description: 'OTP confirmed successfully, authentication tokens provided',
      standardSchema: authenticationResponseSchema,
    })
    @ApiBadRequestResponse({
      description: 'Invalid email format or missing required fields',
    })
    @ApiUnauthorizedResponse({
      description: 'Invalid OTP or expired passcode',
    })
    @Throttle({ default: { limit: 5, ttl: 60000 } })
    @Patch()
    async confirmOtp(
      @Body() dto: RocketsAuthOtpConfirmDto,
      @Req() req: Request,
    ): Promise<AuthenticatedResponseInterface> {
      const ctx = getAppContext(req);
      try {
        const user = await this.otpService.confirmOtp(
          ctx,
          dto.email,
          dto.passcode,
        );
        return this.commandBus.execute(
          new IssueAuthenticatedResponseCommand(ctx, user.id),
        );
      } catch (error) {
        if (error instanceof OtpException) {
          throw new UnauthorizedException();
        }
        throw error;
      }
    }
  }

  applyControllerExtras(RocketsAuthOtpController, extras, {
    send: 'sendOtp',
    confirm: 'confirmOtp',
  });
  return RocketsAuthOtpController;
}
