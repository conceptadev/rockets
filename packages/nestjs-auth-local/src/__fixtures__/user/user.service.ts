import { Injectable } from '@nestjs/common';
import { IdentityInterface } from '@concepta/nestjs-common';
import { AuthLocalCredentialsInterface } from '../../interfaces/auth-local-credentials.interface';
import { AuthLocalUserLookupServiceInterface } from '../../interfaces/auth-local-user-lookup-service.interface';

@Injectable()
export class UserService implements AuthLocalUserLookupServiceInterface {
  async getById(id: string): Promise<IdentityInterface> {
    throw new Error(`Method not implemented, cant get ${id}.`);
  }

  async getByUsername(
    username: string,
  ): Promise<AuthLocalCredentialsInterface> {
    throw new Error(`Method not implemented, cant get ${username}.`);
  }
}
