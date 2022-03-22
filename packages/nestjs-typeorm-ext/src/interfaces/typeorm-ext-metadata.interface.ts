import { OptionsInterface } from '@concepta/nestjs-common';
import {
  TypeOrmExtStorableEntity,
  TypeOrmExtStorableRepository,
  TypeOrmExtStorableSubscriber,
} from '../typeorm-ext.types';
import { TypeOrmExtMetadataItemsInterface } from './typeorm-ext-metadata-items.interface';

/**
 * Metadata Interface
 */
export interface TypeOrmExtMetadataInterface extends OptionsInterface {
  /**
   * Metadata Entities
   */
  entities?: TypeOrmExtMetadataItemsInterface<TypeOrmExtStorableEntity>;

  /**
   * Metadata Repositories
   */
  repositories?: TypeOrmExtMetadataItemsInterface<TypeOrmExtStorableRepository>;

  /**
   * Metadata Subscribers
   */
  subscribers?: TypeOrmExtMetadataItemsInterface<TypeOrmExtStorableSubscriber>;
}
