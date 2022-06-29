import { ReferenceIdInterface, UpdateOneInterface } from '@concepta/ts-core';
import { PasswordPlainInterface } from '@concepta/ts-common';
import { UserEntityInterface } from './user-entity.interface';

export interface AuthRecoveryUserMutateServiceInterface
  extends UpdateOneInterface<
    ReferenceIdInterface & PasswordPlainInterface,
    UserEntityInterface
  > {}
