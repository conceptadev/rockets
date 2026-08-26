import {
  AuthPublic,
  AuthenticatedResponseInterface,
  IssueAuthenticatedResponseCommand,
  LocalGuard,
  RefreshGuard,
  authenticationResponseSchema,
} from '@concepta/nestjs-authentication';
import {
  rocketsAuthLocalLoginSchema,
  rocketsAuthRefreshSchema,
} from '../../../infrastructure/schemas/rockets-auth-token.schema';
import { ReferenceIdInterface } from '@concepta/nestjs-core';
import {
  Body,
  Controller,
  HttpCode,
  Post,
  Req,
  StandardSchemaValidationPipe,
  UnauthorizedException,
  UseGuards,
  UsePipes,
} from '@nestjs/common';
import { CommandBus } from '@nestjs/cqrs';
import { Throttle } from '@nestjs/throttler';
import {
  ApiOkResponse,
  ApiOperation,
  ApiTags,
  ApiUnauthorizedResponse,
} from '@nestjs/swagger';
import type { Request } from 'express';
import type { z } from 'zod';
import { getAppContext, rocketsSchemaValidation } from '@concepta/rockets-core';

import { AuthAccountThrottlerGuard } from '../guards/auth-account-throttler.guard';

type RequestWithPassportUser = Request & {
  readonly user?: ReferenceIdInterface;
};

type LocalLoginBody = z.output<typeof rocketsAuthLocalLoginSchema>;
type RefreshBody = z.output<typeof rocketsAuthRefreshSchema>;

/**
 * Password and refresh-token HTTP endpoints. Concepta v8 registers strategies
 * and CQRS handlers in {@link AuthenticationModule}; the routes themselves are
 * composed here (same pattern as {@link RocketsAuthOtpController}).
 *
 * Uses `req.user` after passport guards (not `@AuthUser()`, which resolves
 * before `AuthUserContextOverlay` runs on some Nest versions).
 *
 * The passport guards consume the body before the handler runs; the body
 * params stay declared so the schema still validates and documents them.
 */
@Controller('token')
@AuthPublic({ classLevel: true })
@UseGuards(AuthAccountThrottlerGuard)
@UsePipes(new StandardSchemaValidationPipe(rocketsSchemaValidation))
@ApiTags('Authentication')
export class RocketsAuthTokenController {
  constructor(private readonly commandBus: CommandBus) {}

  @Post('password')
  @HttpCode(200)
  @UseGuards(LocalGuard)
  @Throttle({ default: { limit: 10, ttl: 60000 } })
  @ApiOperation({
    summary: 'Issue tokens with username and password',
    description:
      'Validates credentials with the local strategy and returns access and refresh JWTs.',
  })
  @ApiOkResponse({
    description: 'Tokens issued',
    standardSchema: authenticationResponseSchema,
  })
  @ApiUnauthorizedResponse({ description: 'Invalid credentials' })
  async loginWithPassword(
    @Body({ schema: rocketsAuthLocalLoginSchema }) _loginBody: LocalLoginBody,
    @Req() req: RequestWithPassportUser,
  ): Promise<AuthenticatedResponseInterface> {
    const user = req.user;
    if (!user?.id) {
      throw new UnauthorizedException();
    }
    const ctx = getAppContext(req);
    return this.commandBus.execute(
      new IssueAuthenticatedResponseCommand(ctx, user.id),
    );
  }

  @Post('refresh')
  @HttpCode(200)
  @UseGuards(RefreshGuard)
  @Throttle({ default: { limit: 20, ttl: 60000 } })
  @ApiOperation({
    summary: 'Refresh access token',
    description:
      'Accepts a refresh token (body.refreshToken), validates it, and returns a new token pair.',
  })
  @ApiOkResponse({
    description: 'Tokens issued',
    standardSchema: authenticationResponseSchema,
  })
  @ApiUnauthorizedResponse({ description: 'Invalid or expired refresh token' })
  async refreshTokens(
    @Body({ schema: rocketsAuthRefreshSchema }) _refreshBody: RefreshBody,
    @Req() req: RequestWithPassportUser,
  ): Promise<AuthenticatedResponseInterface> {
    const user = req.user;
    if (!user?.id) {
      throw new UnauthorizedException();
    }
    const ctx = getAppContext(req);
    return this.commandBus.execute(
      new IssueAuthenticatedResponseCommand(ctx, user.id),
    );
  }
}
