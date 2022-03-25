import {
  UserIdentityInterface,
} from '@concepta/nestjs-authentication';
import { UserCreatableInterface } from '@concepta/nestjs-user/dist/interfaces/user-creatable.interface';

export interface FederatedUserCreateServiceInterface {
  createUser(user: UserCreatableInterface): Promise<UserIdentityInterface>;
}
