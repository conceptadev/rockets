import { Column, Entity } from 'typeorm';
import { ReferenceIdInterface } from '@concepta/nestjs-common';
import { CommonSqliteEntity } from '@concepta/nestjs-typeorm-ext';
import { FederatedEntityInterface } from '../interfaces/federated-entity.interface';

/**
 * Federated Sqlite Entity
 */
@Entity()
export class FederatedSqliteEntity
  extends CommonSqliteEntity
  implements FederatedEntityInterface
{
  /**
   * provider
   */
  @Column()
  provider!: string;

  /**
   * subject
   */
  @Column()
  subject!: string;

  /**
   * User
   */
  user!: ReferenceIdInterface;
}
