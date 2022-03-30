import { Injectable } from '@nestjs/common';
import { UserInterface } from '@concepta/nestjs-user';
import { UserLookupServiceInterface } from '@concepta/nestjs-user/src/interfaces/user-lookup-service.interface';

@Injectable()
export class CustomUserLookupService implements UserLookupServiceInterface {
  /**
   * Dummy property for easily identifying service override.
   */
  hello? = 'world';

  async byId(id: string): Promise<UserInterface> {
    throw new Error(`Method not implemented, cant get ${id}.`);
  }

  async byEmail(email: string): Promise<UserInterface> {
    throw new Error(`Method not implemented, cant get ${email}.`);
  }

  async bySubject(subject: string): Promise<UserInterface> {
    throw new Error(`Method not implemented, cant get ${subject}.`);
  }

  async byUsername(username: string): Promise<UserInterface> {
    throw new Error(`Method not implemented, cant get ${username}.`);
  }
}
