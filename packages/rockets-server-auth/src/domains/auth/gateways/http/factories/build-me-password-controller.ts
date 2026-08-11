import {
  Body,
  Controller,
  HttpCode,
  Patch,
  Req,
  UseGuards,
} from '@nestjs/common';
import type { Type } from '@nestjs/common';
import { CommandBus } from '@nestjs/cqrs';
import { Throttle } from '@nestjs/throttler';
import {
  ApiBadRequestResponse,
  ApiBearerAuth,
  ApiBody,
  ApiOkResponse,
  ApiOperation,
  ApiTags,
  ApiUnauthorizedResponse,
} from '@nestjs/swagger';
import { AuthUser, JwtGuard } from '@concepta/nestjs-authentication';
import { getAppContext } from '@concepta/nestjs-core';
import type { Request } from 'express';

import { ChangeMyPasswordCommand } from '../../../application/commands/impl/change-my-password.command';
import { RocketsAuthChangePasswordDto } from '../../../infrastructure/dto/rockets-auth-change-password.dto';
import type { MePasswordControllerExtras } from '../../../interfaces/me-password-controller-extras.interface';
import type { RocketsAuthUserInterface } from '../../../../user/interfaces/rockets-auth-user.interface';
import { applyControllerExtras } from '../../../../../shared/utils/apply-controller-extras.helper';
import { AuthAccountThrottlerGuard } from '../guards/auth-account-throttler.guard';

/** Build the password-change controller and apply consumer decorators. */
export function buildMePasswordController(
  extras: MePasswordControllerExtras = {},
): Type<unknown> {
  @Controller('me')
  @ApiTags('Me')
  @ApiBearerAuth()
  @UseGuards(JwtGuard, AuthAccountThrottlerGuard)
  class MePasswordController {
    constructor(private readonly commandBus: CommandBus) {}

    @Patch('password')
    @HttpCode(200)
    @Throttle({ default: { limit: 5, ttl: 60000 } })
    @ApiOperation({
      summary: 'Change password',
      description:
        'Allows authenticated user to change their own password by providing current and new password',
      operationId: 'changeMyPassword',
    })
    @ApiBody({
      type: RocketsAuthChangePasswordDto,
      description: 'Current and new password',
      examples: {
        standard: {
          value: {
            currentPassword: 'CurrentP@ssw0rd',
            newPassword: 'NewSecureP@ssw0rd',
          },
          summary: 'Standard password change',
        },
      },
    })
    @ApiOkResponse({ description: 'Password changed successfully' })
    @ApiUnauthorizedResponse({
      description: 'Invalid current password or authentication token',
    })
    @ApiBadRequestResponse({
      description: 'New password does not meet requirements',
    })
    async changePassword(
      @AuthUser() user: RocketsAuthUserInterface,
      @Body() dto: RocketsAuthChangePasswordDto,
      @Req() req: Request,
    ): Promise<void> {
      const ctx = getAppContext(req);
      await this.commandBus.execute(
        new ChangeMyPasswordCommand(
          ctx,
          user.id,
          dto.currentPassword,
          dto.newPassword,
        ),
      );
    }
  }

  applyControllerExtras(MePasswordController, extras, {
    changePassword: 'changePassword',
  });
  return MePasswordController;
}
