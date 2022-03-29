import { Injectable } from '@nestjs/common';
import { IdentityInterface } from '@concepta/nestjs-common';
import { AuthRefreshUserLookupServiceInterface } from '../../interfaces/auth-refresh-user-lookup-service.interface';

@Injectable()
export class UserService implements AuthRefreshUserLookupServiceInterface {
  async getById(id: string): Promise<IdentityInterface> {
    throw new Error(`Method not implemented, cant get ${id}.`);
  }
}
