import { Injectable } from '@nestjs/common';
import {
  UserCreatableInterface,
  UserUpdatableInterface,
  UserReplaceableInterface,
} from '@concepta/nestjs-common';
import { UserModelServiceInterface } from '../../interfaces/user-model-service.interface';
import { UserEntityInterface } from '@concepta/nestjs-common';

@Injectable()
export class UserCrudModelServiceFixture
  implements UserModelServiceInterface<UserEntityInterface>
{
  async byId(_id: string): Promise<UserEntityInterface | null> {
    return null; // No-op
  }

  async byEmail(_email: string): Promise<UserEntityInterface | null> {
    return null; // No-op
  }

  async bySubject(_subject: string): Promise<UserEntityInterface | null> {
    return null; // No-op
  }

  async byUsername(_username: string): Promise<UserEntityInterface | null> {
    return null; // No-op
  }

  async create(_data: UserCreatableInterface): Promise<UserEntityInterface> {
    return {} as UserEntityInterface; // No-op
  }

  async update(_data: UserUpdatableInterface): Promise<UserEntityInterface> {
    return {} as UserEntityInterface; // No-op
  }

  async replace(_data: UserReplaceableInterface): Promise<UserEntityInterface> {
    return {} as UserEntityInterface; // No-op
  }

  async remove(
    _data: Pick<UserEntityInterface, 'id'>,
  ): Promise<UserEntityInterface> {
    return {} as UserEntityInterface; // No-op
  }
}
