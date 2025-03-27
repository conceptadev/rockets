import { DataSourceOptions } from 'typeorm';
import { UserEntityFixture } from './user.entity.fixture';
import { UserProfileEntityFixture } from './user-profile.entity.fixture';
import { UserPasswordHistoryEntityFixture } from './user-password-history.entity.fixture';

export const ormConfig: DataSourceOptions = {
  type: 'sqlite',
  database: ':memory:',
  synchronize: true,
  entities: [
    UserEntityFixture,
    UserProfileEntityFixture,
    UserPasswordHistoryEntityFixture,
  ],
};
