import { Controller, Post, Request, UseGuards } from '@nestjs/common';
import { AuthenticationJwtResponseInterface } from '@concepta/nestjs-authentication';
import { GithubAuthGuard } from './github-auth.guard';

/**
 * Sign controller
 */
@Controller('auth/github')
export class GithubStrategyController {
  /**
   * Authenticate using guard
   * User is added to Req.user
   * @param dto Body
   * @returns
   */
  @UseGuards(GithubAuthGuard)
  @Post('login')
  async authenticateWithGuard(
    @Request() req: Request,
  ): Promise<AuthenticationJwtResponseInterface> {
    return req['user'] as AuthenticationJwtResponseInterface;
  }
}
