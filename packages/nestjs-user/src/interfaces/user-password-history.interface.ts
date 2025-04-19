import {
  AuditInterface,
  ReferenceIdInterface,
  UserOwnableInterface,
  PasswordStorageInterface,
} from '@concepta/nestjs-common';

export interface UserPasswordHistoryInterface
  extends ReferenceIdInterface,
    PasswordStorageInterface,
    UserOwnableInterface,
    AuditInterface {}
