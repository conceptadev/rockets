import {
  ReferenceAuditInterface,
  ReferenceIdInterface,
} from '@concepta/ts-core';

export interface TestInterfaceFixture
  extends ReferenceIdInterface,
    ReferenceAuditInterface {
  firstName: string;
  lastName?: string;
}
