import { Entity } from 'typeorm';
import { FederatedSqliteEntity } from '@concepta/nestjs-federated';

@Entity()
export class FederatedEntityFixture extends FederatedSqliteEntity {}
