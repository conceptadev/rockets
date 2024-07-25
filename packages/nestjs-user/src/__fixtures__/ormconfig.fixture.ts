import { DataSourceOptions } from 'typeorm';
import { UserEntityFixture } from './user.entity.fixture';
import { UserPasswordHistoryEntityFixture } from './user-password-history.entity.fixture';

export const ormConfig: DataSourceOptions = {
  type: 'sqlite',
  database: ':memory:',
  synchronize: true,
  entities: [UserEntityFixture, UserPasswordHistoryEntityFixture],
};
