import { Controller, Post, Request, UseGuards } from '@nestjs/common';
import { AuthenticationService, StrategyController } from '@rockts-org/nestjs-authentication';
import { GithubAuthGuard } from './github-auth.guard';



/**
 * Sign controller
 */
@Controller('auth/github')
export class GithubStrategyController extends StrategyController {
  /**
   * Constructor
   * @param authService
   */
  constructor(
    protected authService: AuthenticationService
  ) {
    super(authService);
  }

  /**
   * authentication made by Middleware 
   * user is added to Req.user
   * @param req 
   * @returns 
   */
  @Post('login')
  async authenticate(
    @Request() req: any
  ): Promise<any> {
    return req.user;
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
    @Request() req: any
  ): Promise<any> {
    return req.user;
  }
}
