import { Controller, Inject, Post, UseGuards } from '@nestjs/common';
import { RefreshTokenServiceService } from '.';
import { RefreshTokenServiceInterface } from './interfaces/refresh-token-service.interface';

/**
 * Auth Local controller
 */
@Controller('refresh/token')
export class RefreshTokenController {
  constructor(
    @Inject(RefreshTokenServiceService)
    private refreshTokenService: RefreshTokenServiceInterface,
  ) {}


  //TODO: i should not get form the guard because token may be expired already?
  //@UseGuards(JwtAuthGuard)
  @Post()
  async refreshToken(refreshToken: string): Promise<string> {
    return this.refreshTokenService.refreshToken(refreshToken);
  }
}
