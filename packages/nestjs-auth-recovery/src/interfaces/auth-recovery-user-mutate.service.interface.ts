import { ReferenceIdInterface, UpdateOneInterface } from '@concepta/ts-core';
import { PasswordPlainInterface } from '@concepta/ts-common';

export interface AuthRecoveryUserMutateServiceInterface
  extends UpdateOneInterface<
    ReferenceIdInterface & PasswordPlainInterface,
    ReferenceIdInterface
  > {}
