import { Injectable } from '@nestjs/common';
import {
  IdentityReferenceInterface,
  IdentitySubject,
} from '@concepta/nestjs-common';
import { AuthRefreshUserLookupServiceInterface } from '../../interfaces/auth-refresh-user-lookup-service.interface';

@Injectable()
export class UserLookupService
  implements AuthRefreshUserLookupServiceInterface
{
  async bySubject(
    subject: IdentitySubject,
  ): Promise<IdentityReferenceInterface> {
    throw new Error(`Method not implemented, cant get ${subject}.`);
  }
}
