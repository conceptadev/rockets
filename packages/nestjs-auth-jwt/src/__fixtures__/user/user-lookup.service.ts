import { Injectable } from '@nestjs/common';
import {
  IdentityReferenceInterface,
  IdentitySubject,
} from '@concepta/nestjs-common';
import { AuthJwtUserLookupServiceInterface } from '../../interfaces/auth-jwt-user-lookup-service.interface';

@Injectable()
export class UserLookupService implements AuthJwtUserLookupServiceInterface {
  async bySubject(
    subject: IdentitySubject,
  ): Promise<IdentityReferenceInterface> {
    throw new Error(`Method not implemented, cant get ${subject}.`);
  }
}
