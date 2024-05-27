import { Column, Index } from 'typeorm';
import { CommonSqliteEntity } from '@concepta/typeorm-common';
import { ReferenceIdInterface } from '@concepta/ts-core';
import { CacheInterface } from '@concepta/ts-common';

/**
 * Cache Sqlite Entity
 */

@Index('key_unique_index', ['key', 'type', 'assignee.id'], { unique: true })
export abstract class CacheSqliteEntity
  extends CommonSqliteEntity
  implements CacheInterface
{
  @Column()
  key!: string;

  @Column()
  type!: string;

  @Column({ type: 'text', nullable: true })
  data!: string;

  @Column({ type: 'datetime', nullable: true })
  expirationDate!: Date | null;

  /**
   * Should be overwrite by the table it will be assigned to
   */
  assignee!: ReferenceIdInterface;
}
