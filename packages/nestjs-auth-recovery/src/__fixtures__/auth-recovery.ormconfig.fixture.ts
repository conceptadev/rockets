import { TypeOrmModuleOptions } from '@nestjs/typeorm';
import { ConnectionOptions } from '@jorgebodega/typeorm-seeding';
import { AuthRecoveryUserOtpEntityFixture } from './auth-recovery-user-otp-entity.fixture';
import { AuthRecoveryUserEntityFixture } from './auth-recovery-user-entity.fixture';

const config: TypeOrmModuleOptions & Partial<ConnectionOptions> = {
  type: 'sqlite',
  database: ':memory:',
  synchronize: true,
  entities: [AuthRecoveryUserEntityFixture, AuthRecoveryUserOtpEntityFixture],
};

export default config;
