import { Entity, ManyToOne } from 'typeorm';
import { FederatedSqliteEntity } from '../entities/federated-sqlite.entity';
import { UserEntityFixture } from './user.entity.fixture';

@Entity()
export class FederatedEntityFixture extends FederatedSqliteEntity {
  @ManyToOne(() => UserEntityFixture, (user) => user.federateds)
  user!: UserEntityFixture;
}
