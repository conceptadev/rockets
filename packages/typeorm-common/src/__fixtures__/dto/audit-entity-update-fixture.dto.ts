import { AuditEntityUpdatableFixtureInterface } from '../interface/audit.entity.updatable.fixture.interface';
import { AuditEntityFixtureDto } from './audit-entity-fixture.dto';

export class AuditEntityUpdateFixtureDto
  extends AuditEntityFixtureDto
  implements AuditEntityUpdatableFixtureInterface {}
