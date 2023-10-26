import { ReferenceActiveInterface } from '@concepta/ts-core';

export interface ValidateUserServiceInterface {
  validateUser: <T extends ReferenceActiveInterface>(
    user: T,
  ) => Promise<boolean>;
}
