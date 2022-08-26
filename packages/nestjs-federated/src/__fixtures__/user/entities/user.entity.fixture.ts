import { Entity, OneToMany } from 'typeorm';
import { UserSqliteEntity } from '@concepta/nestjs-user';
import { FederatedEntityFixture } from '../../federated/federated-entity.fixture';

@Entity()
export class UserEntityFixture extends UserSqliteEntity {
  @OneToMany(() => FederatedEntityFixture, (federated) => federated.user)
  federateds!: UserEntityFixture;
}
