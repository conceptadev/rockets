import {
  BadRequestException,
  Controller,
  Get,
  UseGuards,
} from '@nestjs/common';

import { JwtAuthGuard } from '@rockts-org/nestjs-auth-jwt';
import { NotFoundRocketsException } from '@rockts-org/nestjs-common';

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

  @Get('error')
  getError(): void {
    throw new BadRequestException('Bad Request');
  }

  @Get('error/not-found')
  getErrorNotFound(): void {
    throw new NotFoundRocketsException();
  }
}
