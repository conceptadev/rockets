import { Injectable } from '@nestjs/common';
import {
  CredentialLookupInterface,
  UserLookupServiceInterface,
} from '@rockts-org/nestjs-authentication';
import { UserService } from '@rockts-org/nestjs-user';

@Injectable()
export class RefreshUserLookupService
  implements UserLookupServiceInterface<CredentialLookupInterface>
{
  constructor(private userService: UserService) {}

  // TODO: change to get the by userId
  async getUser(userId: string): Promise<CredentialLookupInterface> {
    const user = await this.userService.getUser(userId);

    if (!user) return null;

    return {
      id: user.id,
      username: user.username,
      password: user.password,
      salt: user.salt,
    };
  }
}
