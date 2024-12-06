import { Column } from 'typeorm';
import { ReferenceIdInterface } from '@concepta/nestjs-common';
import { CommonSqliteEntity } from '@concepta/typeorm-common';
import { OrgEntityInterface } from '../interfaces/org-entity.interface';

/**
 * Org Sqlite Entity
 */
export abstract class OrgSqliteEntity
  extends CommonSqliteEntity
  implements OrgEntityInterface
{
  @Column()
  name!: string;

  @Column('boolean', { default: true })
  active = true;

  owner!: ReferenceIdInterface;
}
