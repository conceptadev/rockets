import {
  ReferenceActiveInterface,
  ReferenceIdInterface,
} from '@concepta/nestjs-common';

export interface ValidateUserServiceInterface<
  T extends unknown[] = unknown[],
  R extends ReferenceIdInterface = ReferenceIdInterface,
> {
  validateUser: (..._: T) => Promise<R>;
  isActive: (user: R & ReferenceActiveInterface) => Promise<boolean>;
}
