import {
  Body,
  Controller,
  HttpCode,
  Patch,
  Req,
  StandardSchemaValidationPipe,
  UseGuards,
  UsePipes,
} from '@nestjs/common';
import type { Type } from '@nestjs/common';
import { CommandBus } from '@nestjs/cqrs';
import { Throttle } from '@nestjs/throttler';
import {
  ApiBadRequestResponse,
  ApiBearerAuth,
  ApiOkResponse,
  ApiOperation,
  ApiTags,
  ApiUnauthorizedResponse,
} from '@nestjs/swagger';
import { AuthUser, JwtGuard } from '@concepta/nestjs-authentication';
import { getAppContext, rocketsSchemaValidation } from '@concepta/rockets-core';
import type { Request } from 'express';
import type { z } from 'zod';

import { ChangeMyPasswordCommand } from '../../../application/commands/impl/change-my-password.command';
import { rocketsAuthChangePasswordSchema } from '../../../infrastructure/schemas/rockets-auth-change-password.schema';
import type { MePasswordControllerExtras } from '../../../interfaces/me-password-controller-extras.interface';
import type { RocketsAuthUserInterface } from '../../../../user/interfaces/rockets-auth-user.interface';
import { applyControllerExtras } from '../../../../../shared/utils/apply-controller-extras.helper';
import { AuthAccountThrottlerGuard } from '../guards/auth-account-throttler.guard';

type ChangePasswordBody = z.output<typeof rocketsAuthChangePasswordSchema>;

/** Build the password-change controller and apply consumer decorators. */
export function buildMePasswordController(
  extras: MePasswordControllerExtras = {},
): Type<unknown> {
  @Controller('me')
  @ApiTags('Me')
  @ApiBearerAuth()
  @UseGuards(JwtGuard, AuthAccountThrottlerGuard)
  @UsePipes(new StandardSchemaValidationPipe(rocketsSchemaValidation))
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
    @ApiOkResponse({ description: 'Password changed successfully' })
    @ApiUnauthorizedResponse({
      description: 'Invalid current password or authentication token',
    })
    @ApiBadRequestResponse({
      description: 'New password does not meet requirements',
    })
    async changePassword(
      @AuthUser() user: RocketsAuthUserInterface,
      @Body({ schema: rocketsAuthChangePasswordSchema })
      body: ChangePasswordBody,
      @Req() req: Request,
    ): Promise<void> {
      const ctx = getAppContext(req);
      await this.commandBus.execute(
        new ChangeMyPasswordCommand(
          ctx,
          user.id,
          body.currentPassword,
          body.newPassword,
        ),
      );
    }
  }

  applyControllerExtras(MePasswordController, extras, {
    changePassword: 'changePassword',
  });
  return MePasswordController;
}
