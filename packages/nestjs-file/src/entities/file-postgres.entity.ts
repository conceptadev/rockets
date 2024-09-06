import { Column, Entity, Unique } from 'typeorm';
import { CommonPostgresEntity } from '@concepta/typeorm-common';
import { FileEntityInterface } from '../interfaces/file-entity.interface';

/**
 * File Postgres Entity
 */
@Entity()
@Unique(['serviceKey', 'fileName'])
export class FilePostgresEntity
  extends CommonPostgresEntity
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
