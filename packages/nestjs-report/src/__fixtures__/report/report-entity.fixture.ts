import { Entity } from 'typeorm';
import { ReportSqliteEntity } from '../../entities/report-sqlite.entity';

@Entity()
export class ReportEntityFixture extends ReportSqliteEntity {}
