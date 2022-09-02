import { DataSourceOptions } from 'typeorm';
import { UserOtpEntityFixture } from './entities/user-otp.entity.fixture';
import { UserEntityFixture } from './entities/user.entity.fixture';
import { InvitationEntityFixture } from './entities/invitation.entity.fixture';

const config: DataSourceOptions = {
  type: 'sqlite',
  database: ':memory:',
  synchronize: true,
  entities: [InvitationEntityFixture, UserEntityFixture, UserOtpEntityFixture],
};

export default config;
