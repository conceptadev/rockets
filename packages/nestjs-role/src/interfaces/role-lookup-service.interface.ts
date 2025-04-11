import {
  ByIdInterface,
  ReferenceId,
  ReferenceIdInterface,
} from '@concepta/nestjs-common';

export interface RoleLookupServiceInterface
  extends ByIdInterface<ReferenceId, ReferenceIdInterface> {}
