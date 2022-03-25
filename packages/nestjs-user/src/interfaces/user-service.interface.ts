import { UserCreatableInterface } from './user-creatable.interface';
import { UserEntityInterface } from './user-entity.interface';
import { UserInterface } from './user.interface';

export interface UserServiceInterface {
  getUser(...args: string[]): Promise<UserInterface>;
  create?(user: UserCreatableInterface): Promise<UserEntityInterface> 
  // getUserByUsername?(username: string): Promise<UserInterface>;
  // getUserByUserId?(id: string): Promise<UserInterface>;
}
