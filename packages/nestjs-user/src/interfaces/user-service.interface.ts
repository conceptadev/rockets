import { UserInterface } from './user.interface';

export interface UserServiceInterface {
  getUser(...args: string[]): Promise<UserInterface>;
  // getUserByUsername?(username: string): Promise<UserInterface>;
  // getUserByUserId?(id: string): Promise<UserInterface>;
}
