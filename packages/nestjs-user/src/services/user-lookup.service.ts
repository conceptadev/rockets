import {
  CredentialLookupInterface,
  GetUserServiceInterface,
} from '@rockts-org/nestjs-authentication';

import { Injectable } from '@nestjs/common';
import { UserService } from '../services/user.service';

@Injectable()
export class UserLookupService
  implements GetUserServiceInterface<CredentialLookupInterface>
{
  constructor(private userService: UserService) {}

  async getUser(username: string): Promise<CredentialLookupInterface> {
    const user = await this.userService.getUserByUsername(username);

    if (!user) return null;

    return {
      username: user.username,
      password: user.password,
      salt: user.salt,
    } as CredentialLookupInterface;
  }
}
