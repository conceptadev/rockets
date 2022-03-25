import { Column, Entity, PrimaryGeneratedColumn } from 'typeorm';
import { FederatedEntityInterface } from '../interfaces/federated-entity.interface';
/**
 * Federated Entity
 */
@Entity()
  // TODO: should we call it FederatedEntity instead?
export class Federated implements FederatedEntityInterface {
  /**
   * Unique Id
   */
  @PrimaryGeneratedColumn('uuid')
  id: string;

  /**
   * provider
   */
  @Column()
  provider: string;

  /**
   * Password
   */
  @Column()
  federatedRef: string;

  /**
   * userId
   */
  @Column()
  userId: string;
}
