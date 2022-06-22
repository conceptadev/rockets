import { TypeOrmModuleOptions } from '@nestjs/typeorm';
import { ConnectionOptions } from '@jorgebodega/typeorm-seeding';
import { UserEntityFixture } from './user.entity.fixture';
import { UserOtpEntityFixture } from './user-otp-entity.fixture';

const config: TypeOrmModuleOptions & Partial<ConnectionOptions> = {
  type: 'sqlite',
  database: ':memory:',
  synchronize: true,
  entities: [UserEntityFixture, UserOtpEntityFixture],
};

export default config;
