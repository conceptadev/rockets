import { ReferenceIdInterface, UpdateOneInterface } from '@concepta/ts-core';
import { PasswordPlainInterface } from '@concepta/ts-common';

export interface InvitationUserMutateServiceInterface
  extends UpdateOneInterface<
    ReferenceIdInterface & PasswordPlainInterface,
    ReferenceIdInterface
  > {}
