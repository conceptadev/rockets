import {
  CredentialLookupInterface,
  UserLookupServiceInterface,
} from '@rockts-org/nestjs-authentication';

import { Injectable } from '@nestjs/common';
import { UserService } from '@rockts-org/nestjs-user';

@Injectable()
export class UserLookupService
  implements UserLookupServiceInterface<CredentialLookupInterface>
{
  constructor(private userService: UserService) {}

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
