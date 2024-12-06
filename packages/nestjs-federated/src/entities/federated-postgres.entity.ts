import { Column, Entity } from 'typeorm';
import { ReferenceIdInterface } from '@concepta/nestjs-common';
import { CommonPostgresEntity } from '@concepta/typeorm-common';
import { FederatedEntityInterface } from '../interfaces/federated-entity.interface';

/**
 * Federated Postgres Entity
 */
@Entity()
export class FederatedPostgresEntity
  extends CommonPostgresEntity
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
