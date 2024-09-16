import { Entity, OneToOne } from 'typeorm';
import { UserSqliteEntity } from '@concepta/nestjs-user';
import { ReportEntityFixture } from '../../report/report-entity.fixture';

@Entity()
export class UserEntityFixture extends UserSqliteEntity {
  @OneToOne(() => ReportEntityFixture)
  document!: ReportEntityFixture;
}
