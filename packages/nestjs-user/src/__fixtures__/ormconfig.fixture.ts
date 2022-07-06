import { DataSourceOptions } from 'typeorm';
import { UserEntityFixture } from './user.entity.fixture';

export const ormConfig: DataSourceOptions = {
  type: 'sqlite',
  database: ':memory:',
  synchronize: true,
  entities: [UserEntityFixture],
};
