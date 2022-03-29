import { IdentityInterface } from '@concepta/nestjs-common';
import { Injectable } from '@nestjs/common';
import { AuthJwtUserLookupServiceInterface } from '../../interfaces/auth-jwt-user-lookup-service.interface';

@Injectable()
export class UserService implements AuthJwtUserLookupServiceInterface {
  async getById(id: string): Promise<IdentityInterface> {
    throw new Error(`Method not implemented, cant get ${id}.`);
  }
}
