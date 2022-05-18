import { OptionsInterface } from '@concepta/ts-core';
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
   * Automatically add to TypoORM config.
   *
   * Applies only to entities and subscribers.
   */
  autoConfig?: boolean;

  /**
   * Connection token
   */
  connection?: TypeOrmExtConnectionToken;
}
