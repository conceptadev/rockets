import { Column, Entity, Unique } from 'typeorm';
import { CommonSqliteEntity } from '@concepta/typeorm-common';
import { FileEntityInterface } from '../interfaces/file-entity.interface';

/**
 * File Sqlite Entity
 */
@Entity()
@Unique(['fileName', 'serviceKey'])
export class FileSqliteEntity
  extends CommonSqliteEntity
  implements FileEntityInterface
{
  /**
   * serviceKey ( aws, filesystem, firebase, etc )
   */
  @Column()
  serviceKey!: string;

  /**
   * subject
   */
  @Column()
  fileName!: string;

  @Column()
  contentType!: string;
}
