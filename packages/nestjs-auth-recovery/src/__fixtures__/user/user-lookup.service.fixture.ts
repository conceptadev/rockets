import { Injectable } from '@nestjs/common';

import { AuthRecoveryUserLookupServiceInterface } from '../../interfaces/auth-recovery-user-lookup.service.interface';

@Injectable()
export class UserLookupServiceFixture
  implements AuthRecoveryUserLookupServiceInterface
{
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  byId(id: string): ReturnType<AuthRecoveryUserLookupServiceInterface['byId']> {
    throw new Error('Method not implemented');
  }

  byEmail(
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    email: string,
  ): ReturnType<AuthRecoveryUserLookupServiceInterface['byEmail']> {
    throw new Error('Method not implemented');
  }
}
