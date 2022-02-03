import { OptionsInterface } from '@rockts-org/nestjs-common';
import { TypeOrmExtConnectionToken } from '../typeorm-ext.types';

/**
 * TypeOrmExt Metadata Single Item Interface
 */
export interface TypeOrmExtMetadataItemInterface<T = unknown>
  extends OptionsInterface {
  /**
   * useClass option
   */
  useClass?: T;

  /**
   * Connection token
   */
  connection?: TypeOrmExtConnectionToken;
}
