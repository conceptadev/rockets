import { Type } from 'class-transformer';
import { AuditInterface, ReferenceId } from '@concepta/ts-core';
import { AuditDto } from '@concepta/nestjs-common';

import { AuditEntityFixtureInterface } from '../interface/audit.entity.fixture.interface';

export class AuditEntityFixtureDto implements AuditEntityFixtureInterface {
  id: ReferenceId = '';

  firstName = '';

  lastName = '';

  @Type(() => AuditDto)
  audit!: AuditInterface;
}
