import { Controller, Post, Request, UseGuards } from '@nestjs/common';
import {
  AuthenticationResponseInterface,
  StrategyController,
} from '@rockts-org/nestjs-authentication';
import { GithubAuthGuard } from './github-auth.guard';

/**
 * Sign controller
 */
@Controller('auth/github')
export class GithubStrategyController extends StrategyController {
  constructor() {
    super();
  }

  /**
   * authentication made by Middleware
   * user is added to Req.user
   * @param req
   * @returns
   */
  @Post('login')
  async authenticate(
    @Request() req: Request,
  ): Promise<AuthenticationResponseInterface> {
    return req['user'] as AuthenticationResponseInterface;
  }

  /**
   * Authenticate using guard
   * User is added to Req.user
   * @param dto Body
   * @returns
   */
  @UseGuards(GithubAuthGuard)
  @Post('guard/login')
  async authenticateWithGuard(
    @Request() req: Request,
  ): Promise<AuthenticationResponseInterface> {
    return req['user'] as AuthenticationResponseInterface;
  }
}
