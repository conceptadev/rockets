import {
  ReferenceEmailInterface,
  ReferenceIdInterface,
  UpdateOneInterface,
} from '@concepta/ts-core';
import { PasswordPlainInterface } from '@concepta/ts-common';
import { QueryOptionsInterface } from '@concepta/typeorm-common';

export interface AuthRecoveryUserMutateServiceInterface
  extends UpdateOneInterface<
    ReferenceIdInterface & PasswordPlainInterface,
    ReferenceIdInterface & ReferenceEmailInterface,
    QueryOptionsInterface
  > {}
