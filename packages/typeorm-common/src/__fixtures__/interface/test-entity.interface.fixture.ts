import { AuditInterface, ReferenceIdInterface } from '@concepta/ts-core';

export interface TestInterfaceFixture
  extends ReferenceIdInterface,
    AuditInterface {
  firstName: string;
  lastName?: string;
}
