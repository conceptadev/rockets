import {
  CredentialLookupInterface,
  UserLookupServiceInterface,
} from '@rockts-org/nestjs-authentication';

import { Inject, Injectable } from '@nestjs/common';
import { USER_MODULE_SERVICE_TOKEN } from '../user.constants';
import { UserServiceInterface } from '../interfaces/user-service.interface';

@Injectable()
export class UserLookupService
  implements UserLookupServiceInterface<CredentialLookupInterface>
{
  constructor(
    @Inject(USER_MODULE_SERVICE_TOKEN)
    private userService: UserServiceInterface,
  ) {}

  async getUser(username: string): Promise<CredentialLookupInterface> {
    const user = await this.userService.getUserByUsername(username);

    if (!user) return null;

    return {
      id: user.id,
      username: user.username,
      password: user.password,
      salt: user.salt,
    };
  }
}
