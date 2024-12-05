import { ReferenceIdInterface } from '@concepta/nestjs-common';
import { ValidateUserServiceInterface } from '@concepta/nestjs-authentication';
import { AuthLocalValidateUserInterface } from './auth-local-validate-user.interface';

export interface AuthLocalValidateUserServiceInterface
  extends ValidateUserServiceInterface<[AuthLocalValidateUserInterface]> {
  validateUser: (
    dto: AuthLocalValidateUserInterface,
  ) => Promise<ReferenceIdInterface>;
}
