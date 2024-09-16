import { Entity, OneToOne } from 'typeorm';
import { FileSqliteEntity } from '@concepta/nestjs-file';
import { ReportEntityFixture } from '../report/report-entity.fixture';
import { ReportEntityInterface } from '../../interfaces/report-entity.interface';

@Entity()
export class FileEntityFixture extends FileSqliteEntity {
  @OneToOne(() => ReportEntityFixture, (report) => report.file)
  report!: ReportEntityInterface;
}
