import { Injectable } from '@nestjs/common';
import { ReferenceIdInterface, ReferenceSubject } from '@concepta/ts-core';
import { AuthRefreshUserLookupServiceInterface } from '../../interfaces/auth-refresh-user-lookup-service.interface';

@Injectable()
export class UserLookupServiceFixture
  implements AuthRefreshUserLookupServiceInterface
{
  async bySubject(subject: ReferenceSubject): Promise<ReferenceIdInterface> {
    throw new Error(`Method not implemented, cant get ${subject}.`);
  }
}
