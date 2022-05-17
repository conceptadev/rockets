import { Entity } from 'typeorm';
import { FederatedSqliteEntity } from '../entities/federated-sqlite.entity';

@Entity()
export class FederatedEntityFixture extends FederatedSqliteEntity {}
