import {
  ReferenceAuditInterface,
  ReferenceIdInterface,
} from '@concepta/ts-core';

export interface FederatedInterface
  extends ReferenceIdInterface,
    ReferenceAuditInterface {
  /**
   * Provider name (github, facebook, etc)
   */
  provider: string;

  /**
   * The reference identification for provider
   * @todo rename to `sub` via ReferenceSubjectInterface
   */
  subject: string;

  /**
   * The user federated will be associated to
   */
  user: ReferenceIdInterface;
}
