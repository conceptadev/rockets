import { OptionsInterface } from '@concepta/nestjs-common';
import { TypeOrmExtConnectionToken } from '../typeorm-ext.types';

/**
 * Metadata Single Item Interface
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
