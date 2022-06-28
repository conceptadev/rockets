import { Injectable } from '@nestjs/common';
import { UserInterface } from '@concepta/ts-common';
import {
  ReferenceEmail,
  ReferenceId,
  ReferenceSubject,
  ReferenceUsername,
} from '@concepta/ts-core';
import { UserLookupServiceInterface } from '../../interfaces/user-lookup-service.interface';

@Injectable()
export class UserLookupCustomService implements UserLookupServiceInterface {
  /**
   * Dummy property for easily identifying service override.
   */
  hello? = 'world';

  async byId(id: ReferenceId): Promise<UserInterface> {
    throw new Error(`Method not implemented, cant get ${id}.`);
  }

  async byEmail(email: ReferenceEmail): Promise<UserInterface> {
    throw new Error(`Method not implemented, cant get ${email}.`);
  }

  async bySubject(subject: ReferenceSubject): Promise<UserInterface> {
    throw new Error(`Method not implemented, cant get ${subject}.`);
  }

  async byUsername(username: ReferenceUsername): Promise<UserInterface> {
    throw new Error(`Method not implemented, cant get ${username}.`);
  }
}
