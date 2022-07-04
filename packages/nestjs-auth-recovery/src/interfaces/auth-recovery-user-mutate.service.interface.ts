import { ReferenceIdInterface, UpdateOneInterface } from '@concepta/ts-core';
import { PasswordPlainInterface, UserInterface } from '@concepta/ts-common';

export interface AuthRecoveryUserMutateServiceInterface
  extends UpdateOneInterface<
    ReferenceIdInterface & PasswordPlainInterface,
    UserInterface
  > {}
