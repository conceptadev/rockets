import {
  AuthLocalUsernameNotFoundException,
  AuthLocalValidateUserInterface,
  AuthLocalValidateUserServiceInterface,
} from '@concepta/nestjs-auth-local';
import { ValidateUserService } from '@concepta/nestjs-authentication';
import { ReferenceIdInterface } from '@concepta/nestjs-common';
import { Injectable } from '@nestjs/common';
import { USER_SUCCESS } from '../constants';

@Injectable()
export class ValidateUserServiceFixture
  extends ValidateUserService<[AuthLocalValidateUserInterface]>
  implements AuthLocalValidateUserServiceInterface
{
  constructor() {
    super();
  }

  async validateUser(
    dto: AuthLocalValidateUserInterface,
  ): Promise<ReferenceIdInterface> {
    if (USER_SUCCESS.username === dto.username) return USER_SUCCESS;

    throw new AuthLocalUsernameNotFoundException(dto.username);
  }
}
