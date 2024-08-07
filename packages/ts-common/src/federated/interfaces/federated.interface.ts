import { AuditInterface, ReferenceIdInterface } from '@concepta/ts-core';

export interface FederatedInterface
  extends ReferenceIdInterface,
    AuditInterface {
  /**
   * Provider name (github, facebook, etc)
   */
  provider: string;

  /**
   * The reference identification for provider
   *
   * TODO: rename to `sub` via ReferenceSubjectInterface
   */
  subject: string;

  /**
   * The user federated will be associated to
   */
  user: ReferenceIdInterface;
}
