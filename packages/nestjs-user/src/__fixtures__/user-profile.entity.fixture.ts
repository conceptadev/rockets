import { Column, Entity, OneToOne } from 'typeorm';

import { UserProfileSqliteEntity } from '../entities/user-profile-sqlite.entity';
import { UserEntityFixture } from './user.entity.fixture';

/**
 * User Profile Entity Fixture
 */
@Entity()
export class UserProfileEntityFixture extends UserProfileSqliteEntity {
  @OneToOne(() => UserEntityFixture, (user) => user.userProfile)
  user!: UserEntityFixture;

  @Column({ nullable: true })
  firstName!: string;
}
