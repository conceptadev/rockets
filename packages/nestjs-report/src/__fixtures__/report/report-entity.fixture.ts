import { FileEntityInterface } from '@concepta/nestjs-file';
import { Entity, JoinColumn, OneToOne } from 'typeorm';
import { ReportSqliteEntity } from '../../entities/report-sqlite.entity';
import { FileEntityFixture } from '../file/file-entity.fixture';

@Entity()
export class ReportEntityFixture extends ReportSqliteEntity {
  @OneToOne(() => FileEntityFixture, (file) => file.report)
  @JoinColumn()
  file!: FileEntityInterface;
}
