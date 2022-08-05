import {
  AuditDateCreated,
  AuditDateDeleted,
  AuditDateUpdated,
  AuditVersion,
  ReferenceId,
} from '@concepta/ts-core';
import { Min } from 'class-validator';
import { AuditEntityFixtureInterface } from '../interface/audit.entity.fixture.interface';

export class AuditEntityFixtureDto implements AuditEntityFixtureInterface {
  id: ReferenceId = '';
  dateCreated: AuditDateCreated = new Date();
  dateUpdated: AuditDateUpdated = new Date();
  dateDeleted: AuditDateDeleted = new Date();
  @Min(1)
  version: AuditVersion = 1;
}
