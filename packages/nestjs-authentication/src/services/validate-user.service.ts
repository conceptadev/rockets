import { Injectable } from '@nestjs/common';
import {
  ReferenceActiveInterface,
  ReferenceIdInterface,
  ReferenceLockStatusInterface,
} from '@concepta/nestjs-common';
import { ValidateUserServiceInterface } from '../interfaces/validate-user-service.interface';

@Injectable()
export abstract class ValidateUserService<
  T extends unknown[] = unknown[],
  R extends ReferenceIdInterface = ReferenceIdInterface,
> implements ValidateUserServiceInterface<T, R>
{
  /**
   * Returns validated user
   */
  abstract validateUser(...rest: T): Promise<R>;

  /**
   * Returns true if user is considered valid for authentication purposes.
   */
  async isActive(
    user: ReferenceIdInterface & ReferenceActiveInterface,
  ): Promise<boolean> {
    return user.active === true;
  }

  async isLocked(
    user: ReferenceLockStatusInterface,
    maxAttempts: number,
  ): Promise<boolean> {
    return (
      user.loginAttempts !== undefined && user.loginAttempts >= maxAttempts
    );
  }
}
