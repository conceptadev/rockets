import {
  ByEmailInterface,
  ByIdInterface,
  ReferenceEmail,
  ReferenceEmailInterface,
  ReferenceId,
  ReferenceIdInterface,
  ReferenceUsernameInterface,
} from '@concepta/nestjs-common';

export interface AuthRecoveryUserModelServiceInterface
  extends ByIdInterface<
      ReferenceId,
      ReferenceIdInterface & ReferenceEmailInterface
    >,
    ByEmailInterface<
      ReferenceEmail,
      ReferenceIdInterface & ReferenceUsernameInterface
    > {}
