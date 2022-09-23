import { Controller, Get, UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from '../../decorator/auth-jwt.guard';

@Controller('user')
export class UserControllerFixtures {
  /**
   * Status
   */
  @UseGuards(JwtAuthGuard)
  @Get('status')
  getStatus(): boolean {
    return true;
  }
}
