import {
  ReferenceAssigneeInterface,
  ReferenceIdInterface,
} from '@concepta/nestjs-common';
import { QueryOptionsInterface } from '@concepta/typeorm-common';

export interface AuthRecoveryServiceInterface {
  recoverLogin(
    email: string,
    queryOptions?: QueryOptionsInterface,
  ): Promise<void>;
  recoverPassword(
    email: string,
    queryOptions?: QueryOptionsInterface,
  ): Promise<void>;
  validatePasscode(
    passcode: string,
    deleteIfValid?: boolean,
    queryOptions?: QueryOptionsInterface,
  ): Promise<ReferenceAssigneeInterface | null>;
  updatePassword(
    passcode: string,
    newPassword: string,
    queryOptions?: QueryOptionsInterface,
  ): Promise<ReferenceIdInterface | null>;
  revokeAllUserPasswordRecoveries(
    email: string,
    queryOptions?: QueryOptionsInterface,
  ): Promise<void>;
}
