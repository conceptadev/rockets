import { DataSourceOptions } from 'typeorm';
import { AuditEntityFixture } from './audit.entity.fixture';

export const ormConfig: DataSourceOptions = {
  type: 'sqlite',
  database: ':memory:',
  synchronize: true,
  entities: [AuditEntityFixture],
};
