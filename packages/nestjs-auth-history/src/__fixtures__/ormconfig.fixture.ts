import { DataSourceOptions } from 'typeorm';
import { AuthHistoryEntityFixture } from './entities/auth-history.entity.fixture';
import { UserEntityFixture } from './entities/user-entity.fixture';

export const ormConfig: DataSourceOptions = {
  type: 'sqlite',
  database: ':memory:',
  synchronize: true,
  entities: [AuthHistoryEntityFixture, UserEntityFixture],
};
