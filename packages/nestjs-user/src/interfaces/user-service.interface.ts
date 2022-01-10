import { UserInterface } from './user.interface';

export interface UserServiceInterface {
  getUserByUsername(username: string): Promise<UserInterface>;
}
