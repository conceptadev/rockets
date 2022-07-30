import { DataSourceOptions } from 'typeorm';
import { InvitationUserOtpEntityFixture } from './invitation-user-otp-entity.fixture';
import { InvitationUserEntityFixture } from './invitation-user-entity.fixture';
import { InvitationEntityFixture } from './invitation.entity.fixture';

const config: DataSourceOptions = {
  type: 'sqlite',
  database: ':memory:',
  synchronize: true,
  entities: [
    InvitationEntityFixture,
    InvitationUserEntityFixture,
    InvitationUserOtpEntityFixture,
  ],
};

export default config;
