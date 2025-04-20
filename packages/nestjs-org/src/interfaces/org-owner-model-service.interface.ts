import {
  ByIdInterface,
  ReferenceId,
  ReferenceIdInterface,
} from '@concepta/nestjs-common';

export interface OrgOwnerModelServiceInterface
  extends ByIdInterface<ReferenceId, ReferenceIdInterface> {}
