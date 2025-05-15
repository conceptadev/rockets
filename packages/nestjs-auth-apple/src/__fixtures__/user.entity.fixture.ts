import { Entity, OneToMany } from 'typeorm';
import { UserSqliteEntity } from '@concepta/nestjs-typeorm-ext';
import { FederatedEntityFixture } from './federated-entity.fixture';

@Entity()
export class UserEntityFixture extends UserSqliteEntity {
  @OneToMany(() => FederatedEntityFixture, (federated) => federated.user)
  federateds!: UserEntityFixture;
}
