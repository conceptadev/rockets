import { AuditInterface, ReferenceIdInterface } from '@concepta/ts-core';
import { UserOwnableInterface } from '@concepta/ts-common';
import { PasswordStorageInterface } from '@concepta/nestjs-password';

export interface UserPasswordHistoryInterface
  extends ReferenceIdInterface,
    PasswordStorageInterface,
    UserOwnableInterface,
    AuditInterface {}
