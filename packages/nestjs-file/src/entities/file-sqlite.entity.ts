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
   * File name (including path)
   */
  @Column()
  fileName!: string;

  /**
   * Content type
   */
  @Column()
  contentType!: string;
}
