import { Controller, Get, UseGuards } from '@nestjs/common';
import { AuthJwtGuard } from '../../auth-jwt.guard';

@Controller('user')
@UseGuards(AuthJwtGuard)
export class UserControllerFixtures {
  /**
   * Status
   */
  @Get('status')
  getStatus(): boolean {
    return true;
  }
}
