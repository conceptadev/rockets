import { BadRequestException, Controller, Get, HttpStatus, UseFilters, UseGuards } from '@nestjs/common';

import { JwtAuthGuard } from '@rockts-org/nestjs-auth-jwt';
import { HttpExceptionFilter, RocketsException, RocketsCodeEnum } from '@rockts-org/nestjs-common';



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
    throw new RocketsException(RocketsCodeEnum.SAMPLE, new BadRequestException('Bad Request'));
    //throw new RocketsException(RocketsCodeEnum.SAMPLE, 'Bad Request', HttpStatus.BAD_REQUEST);
  }
}
