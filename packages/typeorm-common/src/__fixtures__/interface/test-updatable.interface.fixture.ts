import { TestInterfaceFixture } from './test-entity.interface.fixture';

export interface TestUpdatableInterfaceFixture
  extends Partial<Pick<TestInterfaceFixture, 'firstName' | 'lastName'>> {}
