import { Controller, Inject } from '@nestjs/common';
import { UserServiceInterface } from './interfaces/user-service.interface';
import { USER_MODULE_SERVICE_TOKEN } from './user.constants';

@Controller()
export class UserController {
  constructor(
    @Inject(USER_MODULE_SERVICE_TOKEN)
    private userService: UserServiceInterface,
  ) {}
}
