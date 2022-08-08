import { AuditEntityFixtureInterface } from './audit.entity.fixture.interface';

export interface AuditEntityUpdatableFixtureInterface
  extends Partial<
    Pick<AuditEntityFixtureInterface, 'firstName' | 'lastName'>
  > {}
