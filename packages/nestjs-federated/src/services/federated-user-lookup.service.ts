import { Injectable } from '@nestjs/common';
import { UserService } from '@concepta/nestjs-user';
import { CredentialLookupInterface } from '@concepta/nestjs-authentication';
import { FederatedUserLookupServiceInterface } from '../interfaces/federated-user-lookup-service.interface';

@Injectable()
export class FederatedUserLookupService
  implements FederatedUserLookupServiceInterface
{
  constructor(private userService: UserService) {}

  async getUser(id: string): Promise<CredentialLookupInterface> {
    const user = await this.userService.getUser(id);

    if (!user) return null;

    return {
      id: user.id,
      username: user.username,
      password: user.password,
      salt: user.salt,
    };
  }

  // TODO: update to get it by email
  async getUserByEmail(email: string): Promise<CredentialLookupInterface> {
    const user = await this.userService.getUser(email);

    if (!user) return null;

    return {
      id: user.id,
      username: user.username,
      password: user.password,
      salt: user.salt,
    };
  }
  
}
