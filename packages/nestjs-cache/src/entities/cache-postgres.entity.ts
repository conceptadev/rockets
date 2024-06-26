import { Column, Unique } from 'typeorm';
import { ReferenceIdInterface } from '@concepta/ts-core';
import { CacheInterface } from '@concepta/ts-common';
import { CommonPostgresEntity } from '@concepta/typeorm-common';

/**
 * Cache Postgres Entity
 */
@Unique(['key', 'type', 'assignee.id'])
export abstract class CachePostgresEntity
  extends CommonPostgresEntity
  implements CacheInterface
{
  @Column()
  type!: string;

  @Column()
  key!: string;

  @Column({ type: 'jsonb', nullable: true })
  data!: string | null;

  @Column({ type: 'timestamptz', nullable: true })
  expirationDate!: Date | null;

  /**
   * Should be overwrite by the table it will be assigned to
   */
  assignee!: ReferenceIdInterface;
}
