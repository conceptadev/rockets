import { Type } from 'class-transformer';
import { AuditInterface, ReferenceId } from '@concepta/ts-core';
import { AuditDto } from '@concepta/nestjs-common';

import { TestInterfaceFixture } from '../interface/test-entity.interface.fixture';

export class TestDtoFixture implements TestInterfaceFixture {
  id: ReferenceId = '';

  firstName = '';

  lastName = '';

  @Type(() => AuditDto)
  audit!: AuditInterface;
}
