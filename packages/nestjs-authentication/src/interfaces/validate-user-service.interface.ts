import {
  ReferenceActiveInterface,
  ReferenceIdInterface,
} from '@concepta/ts-core';

export interface ValidateUserServiceInterface<
  T extends unknown[] = unknown[],
  R extends ReferenceIdInterface = ReferenceIdInterface,
> {
  validateUser: (..._: T) => Promise<R>;
  isActive: (user: R & ReferenceActiveInterface) => Promise<boolean>;
}
