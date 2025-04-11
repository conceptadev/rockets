import {
  ReferenceEmailInterface,
  ReferenceIdInterface,
  UpdateOneInterface,
} from '@concepta/nestjs-common';
import { PasswordPlainInterface } from '@concepta/nestjs-common';

export interface AuthRecoveryUserMutateServiceInterface
  extends UpdateOneInterface<
    ReferenceIdInterface & PasswordPlainInterface,
    ReferenceIdInterface & ReferenceEmailInterface
  > {}
