import { Entity, Unique } from 'typeorm';
import { CacheSqliteEntity } from '@concepta/nestjs-typeorm-ext';

/**
 * Cache Entity Fixture
 */
@Entity()
@Unique(['key', 'type', 'assigneeId'])
export class UserCacheEntityFixture extends CacheSqliteEntity {}
