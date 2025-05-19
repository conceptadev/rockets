import { Entity, ManyToOne } from 'typeorm';
import { FederatedSqliteEntity } from '@concepta/nestjs-typeorm-ext';
import { UserEntityFixture } from '../user/entities/user.entity.fixture';

@Entity()
export class FederatedEntityFixture extends FederatedSqliteEntity {
  @ManyToOne(() => UserEntityFixture, (user) => user.federateds)
  user!: UserEntityFixture;
}
