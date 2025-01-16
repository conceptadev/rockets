import { Injectable } from '@nestjs/common';
import { UserInterface } from '@concepta/nestjs-common';
import {
  ReferenceEmail,
  ReferenceId,
  ReferenceSubject,
  ReferenceUsername,
} from '@concepta/nestjs-common';
import { AuthJwtUserLookupServiceInterface } from '@concepta/nestjs-auth-jwt/dist/interfaces/auth-jwt-user-lookup-service.interface';

@Injectable()
export class UserLookupCustomService
  implements AuthJwtUserLookupServiceInterface
{
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
