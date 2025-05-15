import { Entity } from 'typeorm';
import { ReportSqliteEntity } from '@concepta/nestjs-typeorm-ext';

@Entity()
export class ReportEntityFixture extends ReportSqliteEntity {}
