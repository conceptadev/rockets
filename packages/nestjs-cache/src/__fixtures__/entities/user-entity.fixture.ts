import { Column, Entity, OneToMany, PrimaryGeneratedColumn } from 'typeorm';
import { ReferenceIdInterface } from '@concepta/nestjs-common';
import { UserCacheEntityFixture } from './user-cache-entity.fixture';

/**
 * User Entity Fixture
 */
@Entity()
export class UserEntityFixture implements ReferenceIdInterface {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column({ default: false })
  isActive!: boolean;

  @OneToMany(() => UserCacheEntityFixture, (userCache) => userCache.assignee)
  userCaches!: UserCacheEntityFixture[];
}
