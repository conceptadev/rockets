import { Injectable } from '@nestjs/common';
import { UserIdentityDto } from '../dto/user-identity.dto';
import { UserIdentityInterface } from '../interfaces/user-identity.interface';
import { UserLookupServiceInterface } from '../interfaces/user-lookup-service.interface';

@Injectable()
export class UserLookupService implements UserLookupServiceInterface {
  async getUser(id: string): Promise<UserIdentityInterface> {
    const user = new UserIdentityDto();
    user.id = id;
    return user;
  }
}
