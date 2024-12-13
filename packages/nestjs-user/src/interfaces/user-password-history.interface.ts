import { AuditInterface, ReferenceIdInterface } from '@concepta/nestjs-common';
import { UserOwnableInterface } from '@concepta/nestjs-common';
import { PasswordStorageInterface } from '@concepta/nestjs-password';

export interface UserPasswordHistoryInterface
  extends ReferenceIdInterface,
    PasswordStorageInterface,
    UserOwnableInterface,
    AuditInterface {}
