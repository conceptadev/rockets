import { AuditEntityCreatableFixtureInterface } from '../interface/audit.entity.creatable.fixture.interface';
import { AuditEntityFixtureDto } from './audit-entity-fixture.dto';

export class AuditEntityCreateFixtureDto
  extends AuditEntityFixtureDto
  implements AuditEntityCreatableFixtureInterface {}
