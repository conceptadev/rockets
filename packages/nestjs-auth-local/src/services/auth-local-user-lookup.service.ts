import { Injectable } from '@nestjs/common';
import { UserService } from '@concepta/nestjs-user';
import { CredentialLookupInterface } from '@concepta/nestjs-authentication';
import { AuthLocalUserLookupServiceInterface } from '../interfaces/auth-local-user-lookup-service.interface';

@Injectable()
export class AuthLocalUserLookupService
  implements AuthLocalUserLookupServiceInterface
{
  constructor(private userService: UserService) {}

  async getUser(username: string): Promise<CredentialLookupInterface> {
    const user = await this.userService.getUser(username);

    if (!user) return null;

    return {
      id: user.id,
      username: user.username,
      password: user.password,
      salt: user.salt,
    };
  }
}
