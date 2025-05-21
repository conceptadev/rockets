import { Column, Entity } from 'typeorm';
import { UserProfileSqliteEntity } from '@concepta/nestjs-typeorm-ext';

/**
 * User Profile Entity Fixture
 */
@Entity()
export class UserProfileEntityFixture extends UserProfileSqliteEntity {
  @Column({ nullable: true })
  firstName!: string;
}
