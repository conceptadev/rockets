import {
  ReferenceEmailInterface,
  ReferenceIdInterface,
  UpdateOneInterface,
} from '@concepta/nestjs-common';
import { PasswordPlainInterface } from '@concepta/nestjs-common';
import { QueryOptionsInterface } from '@concepta/typeorm-common';

export interface AuthRecoveryUserMutateServiceInterface
  extends UpdateOneInterface<
    ReferenceIdInterface & PasswordPlainInterface,
    ReferenceIdInterface & ReferenceEmailInterface,
    QueryOptionsInterface
  > {}
