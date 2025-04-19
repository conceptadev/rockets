import {
  ByEmailInterface,
  ByIdInterface,
  ReferenceActiveInterface,
  ReferenceEmail,
  ReferenceEmailInterface,
  ReferenceId,
  ReferenceIdInterface,
  ReferenceUsernameInterface,
  UpdateOneInterface,
} from '@concepta/nestjs-common';

export interface AuthVerifyUserModelServiceInterface
  extends ByIdInterface<ReferenceId, ReferenceIdInterface>,
    ByEmailInterface<
      ReferenceEmail,
      ReferenceIdInterface & ReferenceUsernameInterface
    >,
    UpdateOneInterface<
      ReferenceIdInterface & ReferenceActiveInterface,
      ReferenceIdInterface & ReferenceEmailInterface & ReferenceActiveInterface
    > {}
