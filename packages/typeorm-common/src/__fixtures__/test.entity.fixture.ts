import { Column, Entity } from 'typeorm';
import { TestInterfaceFixture } from './interface/test-entity.interface.fixture';
import { CommonSqliteEntity } from '../entities/common/common-sqlite.entity';

@Entity()
export class TestEntityFixture
  extends CommonSqliteEntity
  implements TestInterfaceFixture
{
  @Column()
  firstName!: string;

  @Column({ nullable: true })
  lastName!: string;
}
