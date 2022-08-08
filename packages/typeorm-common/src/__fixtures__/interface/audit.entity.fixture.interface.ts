import {
  ReferenceAuditInterface,
  ReferenceIdInterface,
} from '@concepta/ts-core';

export interface AuditEntityFixtureInterface
  extends ReferenceIdInterface,
    ReferenceAuditInterface {
  firstName: string;
  lastName?: string;
}
