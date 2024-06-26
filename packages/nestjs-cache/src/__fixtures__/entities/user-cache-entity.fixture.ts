import { Entity, ManyToOne, Unique } from 'typeorm';
import { ReferenceIdInterface } from '@concepta/ts-core';
import { UserEntityFixture } from './user-entity.fixture';
import { CacheSqliteEntity } from '../../entities/cache-sqlite.entity';

/**
 * Cache Entity Fixture
 */
@Entity()
@Unique(['key', 'type', 'assignee.id'])
export class UserCacheEntityFixture extends CacheSqliteEntity {
  @ManyToOne(() => UserEntityFixture, (user) => user.userCaches, {
    nullable: false,
  })
  assignee!: ReferenceIdInterface;
}
