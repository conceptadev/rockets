import { Entity, OneToOne } from 'typeorm';
import { UserSqliteEntity } from '../entities/user-sqlite.entity';
import { UserProfileEntityFixture } from './user-profile.entity.fixture';

@Entity()
export class UserEntityFixture extends UserSqliteEntity {
  @OneToOne(() => UserProfileEntityFixture, (userProfile) => userProfile.user)
  userProfile?: UserProfileEntityFixture;
}
