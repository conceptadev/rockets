import { Column, Index, Unique } from 'typeorm';
import { ReferenceIdInterface } from '@concepta/ts-core';
import { CacheInterface } from '@concepta/ts-common';
import { CommonPostgresEntity } from '@concepta/typeorm-common';

/**
 * Cache Postgres Entity
 */
@Index('key_unique_index', ['key', 'type', 'assignee.id'], { unique: true })
export abstract class CachePostgresEntity
  extends CommonPostgresEntity
  implements CacheInterface
{
  @Column()
  type!: string;

  @Column()
  key!: string;

  @Column({ type: 'jsonb', nullable: true })
  data!: string;

  @Column({ type: 'timestamptz' })
  expirationDate!: Date;

  /**
   * Should be overwrite by the table it will be assigned to
   */
  assignee!: ReferenceIdInterface;
}
