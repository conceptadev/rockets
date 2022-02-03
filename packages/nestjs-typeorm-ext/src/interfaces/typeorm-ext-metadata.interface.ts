import { OptionsInterface } from '@rockts-org/nestjs-common';
import {
  TypeOrmExtStorableEntity,
  TypeOrmExtStorableRepository,
  TypeOrmExtStorableSubscriber,
} from '../typeorm-ext.types';
import { TypeOrmExtMetadataItemsInterface } from './typeorm-ext-metadata-items.interface';

/**
 * TypeOrmExt Metadata Interface
 */
export interface TypeOrmExtMetadataInterface extends OptionsInterface {
  /**
   * TypeOrmExt Metadata Entities
   */
  entities?: TypeOrmExtMetadataItemsInterface<TypeOrmExtStorableEntity>;

  /**
   * TypeOrmExt Metadata Repositories
   */
  repositories?: TypeOrmExtMetadataItemsInterface<TypeOrmExtStorableRepository>;

  /**
   * TypeOrmExt Metadata Subscribers
   */
  subscribers?: TypeOrmExtMetadataItemsInterface<TypeOrmExtStorableSubscriber>;
}
