import { Injectable } from '@nestjs/common';
import { ReferenceIdInterface } from '@concepta/ts-core';
import { PasswordPlainInterface } from '@concepta/ts-common';

import { AuthRecoveryUserMutateServiceInterface } from '../../interfaces/auth-recovery-user-mutate.service.interface';

@Injectable()
export class UserMutateServiceFixture
  implements AuthRecoveryUserMutateServiceInterface
{
  update(
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    object: ReferenceIdInterface<string> & PasswordPlainInterface,
  ): ReturnType<AuthRecoveryUserMutateServiceInterface['update']> {
    throw new Error('Method not implemented');
  }
}
