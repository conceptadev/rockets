import { ReferenceIdInterface } from '@concepta/ts-core';

export interface FederatedEntityInterface extends ReferenceIdInterface {
  provider: string;
  // TODO: rename to `sub` via ReferenceSubjectInterface
  subject: string;
  userId: string;
}
