import { Column, Unique } from 'typeorm';
import { CommonSqliteEntity } from '@concepta/typeorm-common';
import { ReferenceIdInterface } from '@concepta/nestjs-common';
import { CacheInterface } from '@concepta/nestjs-common';

/**
 * Cache Sqlite Entity
 */

@Unique(['key', 'type', 'assignee.id'])
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
