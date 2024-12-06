import { Column } from 'typeorm';
import { ReferenceIdInterface } from '@concepta/nestjs-common';
import { CommonPostgresEntity } from '@concepta/typeorm-common';
import { OrgEntityInterface } from '../interfaces/org-entity.interface';

/**
 * Org Postgres Entity
 */
export abstract class OrgPostgresEntity
  extends CommonPostgresEntity
  implements OrgEntityInterface
{
  /**
   * Name
   */
  @Column()
  name!: string;

  /**
   * Flag to determine if the org is active or not
   */
  @Column('boolean', { default: true })
  active = true;

  /**
   * Owner
   */
  owner!: ReferenceIdInterface;
}
