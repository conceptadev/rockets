import { Controller, Get, UseGuards } from '@nestjs/common';

import { JwtAuthGuard } from '@rockts-org/nestjs-auth-jwt';

export class UserDto {
  constructor(username: string) {
    this.username = username;
  }
  username: string;
}
/**
 * Auth Local controller
 */
@Controller('custom/user')
export class CustomUserController {
  /**
   * Login
   */
  @UseGuards(JwtAuthGuard)
  @Get('all')
  get(): UserDto[] {
    return [new UserDto('user1'), new UserDto('user2')];
  }
}
