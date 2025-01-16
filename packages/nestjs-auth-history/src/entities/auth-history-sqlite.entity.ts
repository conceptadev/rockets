import { ReferenceId, UserInterface } from '@concepta/nestjs-common';
import { CommonSqliteEntity } from '@concepta/typeorm-common';
import { Column } from 'typeorm';
import { AuthHistoryEntityInterface } from '../interfaces/auth-history-entity.interface';

export abstract class AuthHistorySqliteEntity
  extends CommonSqliteEntity
  implements AuthHistoryEntityInterface
{
  /**
   * ipAddress
   */
  @Column({ type: 'text' })
  ipAddress!: string;

  /**
   * authType
   */
  @Column({ type: 'text' })
  authType!: string;

  /**
   * deviceInfo
   */
  @Column({ type: 'text' })
  deviceInfo!: string;

  /**
   * User ID
   */
  @Column({ type: 'uuid' })
  userId!: ReferenceId;

  /**
   * Should be configured by the implementation
   */
  user?: UserInterface;
}
