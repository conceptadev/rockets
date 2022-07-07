import { DataSourceOptions } from 'typeorm';
import { AuthRecoveryUserOtpEntityFixture } from './auth-recovery-user-otp-entity.fixture';
import { AuthRecoveryUserEntityFixture } from './auth-recovery-user-entity.fixture';

const config: DataSourceOptions = {
  type: 'sqlite',
  database: ':memory:',
  synchronize: true,
  entities: [AuthRecoveryUserEntityFixture, AuthRecoveryUserOtpEntityFixture],
};

export default config;
