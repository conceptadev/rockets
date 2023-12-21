import { Column, Entity } from 'typeorm';
import { ReferenceIdInterface } from '@concepta/ts-core';
import { CommonSqliteEntity } from '@concepta/typeorm-common';
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
