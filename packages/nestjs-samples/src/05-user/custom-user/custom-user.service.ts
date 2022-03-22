import { Injectable } from '@nestjs/common';
import { UserInterface, UserServiceInterface } from '@concepta/nestjs-user';

@Injectable()
export class CustomUserService implements UserServiceInterface {
  /**
   * Dummy property for easily identifying service override.
   */
  hello? = 'world';

  async getUser(username: string): Promise<UserInterface> {
    throw new Error(`Method not implemented, cant get ${username}.`);
  }
}
