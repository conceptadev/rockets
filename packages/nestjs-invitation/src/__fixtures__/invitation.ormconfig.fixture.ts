import { DataSourceOptions } from 'typeorm';
import { InvitationUserOtpEntityFixture } from './invitation-user-otp-entity.fixture';
import { InvitationUserEntityFixture } from './invitation-user-entity.fixture';

const config: DataSourceOptions = {
  type: 'sqlite',
  database: ':memory:',
  synchronize: true,
  entities: [InvitationUserEntityFixture, InvitationUserOtpEntityFixture],
};

export default config;
