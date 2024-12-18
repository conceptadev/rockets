import { DataSourceOptions } from 'typeorm';
import { UserOtpEntityFixture } from './user/entities/user-otp-entity.fixture';
import { UserEntityFixture } from './user/entities/user-entity.fixture';

const config: DataSourceOptions = {
  type: 'sqlite',
  database: ':memory:',
  synchronize: true,
  entities: [UserEntityFixture, UserOtpEntityFixture],
};

export default config;
