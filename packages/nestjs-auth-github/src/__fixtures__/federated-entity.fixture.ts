import { Entity } from 'typeorm';
import { FederatedSqliteEntity } from '@concepta/nestjs-typeorm-ext';

@Entity()
export class FederatedEntityFixture extends FederatedSqliteEntity {}
