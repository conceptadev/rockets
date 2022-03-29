import {
  IdentityInterface,
  IdentityEmailInterface,
  IdentityUsernameInterface,
} from '@concepta/nestjs-common';
import { UserInterface } from './user.interface';

export interface UserServiceInterface {
  getById(id: IdentityInterface['id']): Promise<UserInterface>;
  getByEmail(email: IdentityEmailInterface['email']): Promise<UserInterface>;
  getByUsername(
    username: IdentityUsernameInterface['username'],
  ): Promise<UserInterface>;
}
