import { Injectable } from '@nestjs/common';
import { FederatedUserCreateServiceInterface } from '../interfaces/federated-user-create-service.interface';
import { UserService } from '@concepta/nestjs-user';
import { UserCreatableInterface } from '@concepta/nestjs-user/dist/interfaces/user-creatable.interface';
import { UserIdentityInterface } from '@concepta/nestjs-authentication';

@Injectable()
export class FederatedUserCreateService implements FederatedUserCreateServiceInterface
{
  constructor(
    private userService: UserService
  ) {}

  // TODO: add call from userService
  async createUser(user: UserCreatableInterface): Promise<UserIdentityInterface> {
    return null;
    // const federated = await this.userService.create(user);

    // if (!federated) return null;

    // return federated;
  }
  
}
