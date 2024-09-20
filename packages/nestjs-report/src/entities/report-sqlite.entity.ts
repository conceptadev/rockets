import { Column, Entity, Unique } from 'typeorm';
import { ReportStatusEnum } from '@concepta/ts-common';
import { ReferenceIdInterface } from '@concepta/ts-core';
import { CommonSqliteEntity } from '@concepta/typeorm-common';
import { ReportEntityInterface } from '../interfaces/report-entity.interface';

/**
 * Report Sqlite Entity
 */
@Entity()
@Unique(['name', 'serviceKey'])
export class ReportSqliteEntity
  extends CommonSqliteEntity
  implements ReportEntityInterface
{
  @Column()
  serviceKey!: string;

  @Column({ collation: 'NOCASE' })
  name!: string;

  @Column({
    type: 'text',
    enum: ReportStatusEnum,
  })
  status!: ReportStatusEnum;

  @Column({ type: 'text', nullable: true, default: null })
  errorMessage: string | null = null;

  file!: ReferenceIdInterface;
}
