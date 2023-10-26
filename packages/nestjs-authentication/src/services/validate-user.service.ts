import { Injectable } from '@nestjs/common';
import { ReferenceActiveInterface } from '@concepta/ts-core';
import { ValidateUserServiceInterface } from '../interfaces/validate-user-service.interface';

@Injectable()
export class ValidateUserService implements ValidateUserServiceInterface {
  /**
   * Returns true if user is considered valid for authentication purposes.
   */
  async validateUser<
    T extends ReferenceActiveInterface = ReferenceActiveInterface,
  >(user: T): Promise<boolean> {
    return user.active === true;
  }
}
