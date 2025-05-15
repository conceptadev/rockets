import { Entity, OneToOne } from 'typeorm';
import { UserSqliteEntity } from '@concepta/nestjs-typeorm-ext';
import { UserProfileEntityFixture } from './user-profile.entity.fixture';

@Entity()
export class UserEntityFixture extends UserSqliteEntity {
  @OneToOne(() => UserProfileEntityFixture, (userProfile) => userProfile.user)
  userProfile?: UserProfileEntityFixture;
}
