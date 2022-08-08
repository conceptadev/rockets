import { AuditEntityFixtureInterface } from './audit.entity.fixture.interface';

export interface AuditEntityCreatableFixtureInterface
  extends Pick<AuditEntityFixtureInterface, 'firstName' | 'lastName'> {}
