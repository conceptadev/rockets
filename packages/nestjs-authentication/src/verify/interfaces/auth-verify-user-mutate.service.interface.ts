import {
  ReferenceActiveInterface,
  ReferenceEmailInterface,
  ReferenceIdInterface,
  UpdateOneInterface,
} from '@concepta/nestjs-common';
import { QueryOptionsInterface } from '@concepta/typeorm-common';

export interface AuthVerifyUserMutateServiceInterface
  extends UpdateOneInterface<
    ReferenceIdInterface & ReferenceActiveInterface,
    ReferenceIdInterface & ReferenceEmailInterface & ReferenceActiveInterface,
    QueryOptionsInterface
  > {}
