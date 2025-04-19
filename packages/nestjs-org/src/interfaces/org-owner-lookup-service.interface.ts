import {
  ByIdInterface,
  ReferenceId,
  ReferenceIdInterface,
} from '@concepta/nestjs-common';

export interface OrgOwnerLookupServiceInterface
  extends ByIdInterface<ReferenceId, ReferenceIdInterface> {}
