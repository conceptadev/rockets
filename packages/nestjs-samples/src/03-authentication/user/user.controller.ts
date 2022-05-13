import { Controller, Get, UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from '@concepta/nestjs-auth-jwt';
import { ReferenceUsername } from '@concepta/ts-core';

export class UserDto {
  constructor(username: ReferenceUsername) {
    this.username = username;
  }
  username: ReferenceUsername;
}

/**
 * Custom User controller
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
