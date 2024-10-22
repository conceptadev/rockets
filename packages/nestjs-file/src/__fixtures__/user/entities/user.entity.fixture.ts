import { Entity, OneToOne } from 'typeorm';
import { UserSqliteEntity } from '@concepta/nestjs-user';
import { FileEntityFixture } from '../../file/file-entity.fixture';

@Entity()
export class UserEntityFixture extends UserSqliteEntity {
  @OneToOne(() => FileEntityFixture)
  document!: FileEntityFixture;
}
