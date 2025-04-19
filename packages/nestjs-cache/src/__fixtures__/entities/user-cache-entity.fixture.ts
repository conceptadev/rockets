import { Entity, Unique } from 'typeorm';
import { CacheSqliteEntity } from '../../entities/cache-sqlite.entity';

/**
 * Cache Entity Fixture
 */
@Entity()
@Unique(['key', 'type', 'assigneeId'])
export class UserCacheEntityFixture extends CacheSqliteEntity {}
