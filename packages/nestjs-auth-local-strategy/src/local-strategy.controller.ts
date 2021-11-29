import { Controller, Post, Request, UseGuards } from '@nestjs/common';
import {
  AuthenticationResponseInterface,
  StrategyController,
} from '@rockts-org/nestjs-authentication';
import { LocalAuthGuard } from './local-auth.guard';

/**
 * Sign controller
 */
@Controller('auth')
export class LocalStrategyController extends StrategyController {
  constructor() {
    super();
  }

  /**
   * Authenticate using guard
   * @param dto Body
   * @returns
   */
  @UseGuards(LocalAuthGuard)
  @Post('login')
  async authenticateWithGuard(
    @Request() req: Request,
  ): Promise<AuthenticationResponseInterface> {
    return req['user'];
  }
}
