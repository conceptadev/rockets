import { Controller, Post, Request, UseGuards } from '@nestjs/common';
import { AuthenticationService, StrategyController } from '@rockts-org/nestjs-authentication';
import { LocalAuthGuard } from './local-auth.guard';


/**
 * Sign controller
 */
@Controller('auth')
export class LocalStrategyController extends StrategyController {
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
   * Middleware 
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
   * @param dto Body
   * @returns 
   */
  @UseGuards(LocalAuthGuard)
  @Post('guard/login')
  async authenticateWithGuard(
    @Request() req: any
  ): Promise<any> {
    return req.user;
  }
}
