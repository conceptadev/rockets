import { Column, Entity, ManyToOne } from 'typeorm';
import { ReferenceIdInterface } from '@concepta/nestjs-core';
import { AuditedSqliteEntity } from '../../../shared/persistence/audited-sqlite.entity';
import { UserEntity } from './user.entity';

@Entity('federated')
export class FederatedEntity extends AuditedSqliteEntity {
  @Column()
  provider!: string;

  @Column()
  subject!: string;

  // `IdentityInterface` names the owning side `user` — not `assignee`.
  @ManyToOne(() => UserEntity, (user) => user.federatedAccounts)
  user!: ReferenceIdInterface;
}
