import { Injectable } from '@nestjs/common';
import {
  ReferenceIdInterface,
  ReferenceSubject,
} from '@concepta/nestjs-common';
import { AuthRefreshUserLookupServiceInterface } from '../../interfaces/auth-refresh-user-lookup-service.interface';

@Injectable()
export class UserLookupService
  implements AuthRefreshUserLookupServiceInterface
{
  async bySubject(subject: ReferenceSubject): Promise<ReferenceIdInterface> {
    throw new Error(`Method not implemented, cant get ${subject}.`);
  }
}
