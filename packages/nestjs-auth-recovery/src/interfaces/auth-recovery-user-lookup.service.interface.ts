import {
  ByEmailInterface,
  ByIdInterface,
  ReferenceEmail,
  ReferenceId,
  ReferenceIdInterface,
  ReferenceUsernameInterface,
} from '@concepta/nestjs-common';

export interface AuthRecoveryUserLookupServiceInterface
  extends ByIdInterface<ReferenceId, ReferenceIdInterface>,
    ByEmailInterface<
      ReferenceEmail,
      ReferenceIdInterface & ReferenceUsernameInterface
    > {}
