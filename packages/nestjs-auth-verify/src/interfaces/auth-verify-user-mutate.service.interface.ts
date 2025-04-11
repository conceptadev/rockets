import {
  ReferenceActiveInterface,
  ReferenceEmailInterface,
  ReferenceIdInterface,
  UpdateOneInterface,
} from '@concepta/nestjs-common';

export interface AuthVerifyUserMutateServiceInterface
  extends UpdateOneInterface<
    ReferenceIdInterface & ReferenceActiveInterface,
    ReferenceIdInterface & ReferenceEmailInterface & ReferenceActiveInterface
  > {}
